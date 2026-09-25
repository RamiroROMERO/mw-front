import { useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';
import ModalPdaDetail from './ModalPdaDetail';

// Equivalente a cont_auditoria.sc2 ("Auditoría de Módulos"). El legacy tiene 3 pestañas,
// solo "Detalle" migrada: "Resumen" nunca recibe un solo `.Value =` en todo el formulario
// (siempre en blanco) y "Configuración" no tiene NINGÚN botón/grid conectado (ni siquiera
// RecordSource asignado) — ambas 100% código muerto, confirmado grepeando el .sc2 completo,
// no algo que dependa de privilegios de usuario. Ver comentario completo en
// ModuleAuditService.js (backend) para el detalle de esa investigación.
//
// El picker de módulo se deja fijo con los mismos 5 del Optiongroup del legacy (en vez de
// leer dinámicamente `set_audit_modules`, que tiene 8 filas reales pero el legacy solo
// expone 5) — Cuentas por Cobrar/Cuentas por Pagar nunca tuvieron datos reales (0 filas en
// `cont_auditoria` para esos dos, confirmado contra datos reales), se dejan igual por
// fidelidad al legacy, no se ocultan.
const MODULE_OPTIONS = [
  { id: 1, label: 'page.moduleAudit.module.billing' },
  { id: 2, label: 'page.moduleAudit.module.inventory' },
  { id: 3, label: 'page.moduleAudit.module.receivable' },
  { id: 4, label: 'page.moduleAudit.module.payable' },
  { id: 5, label: 'page.moduleAudit.module.banks' }
];

const noPdaLabel = 'page.moduleAudit.table.status.noPda';
const mismatchLabel = 'page.moduleAudit.table.status.mismatch';
const okLabel = 'page.moduleAudit.table.status.ok';

export const useModuleAudit = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({
    moduleId: 1,
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.now())
  });
  const { moduleId, dateStart, dateEnd } = formState;

  const [allRows, setAllRows] = useState([]);
  const [openPdaDetail, setOpenPdaDetail] = useState(false);
  const [pdaDetailData, setPdaDetailData] = useState(null);

  const noPdaText = IntlMessages(noPdaLabel);
  const mismatchText = IntlMessages(mismatchLabel);
  const okText = IntlMessages(okLabel);

  const modules = MODULE_OPTIONS.map((m) => ({ id: m.id, name: IntlMessages(m.label) }));

  const fnSearch = () => {
    setLoading(true);
    request.POST('accounting/reports/moduleAudit', { moduleId, dateStart, dateEnd }, (resp) => {
      const rows = resp.data.map((row) => {
        let status = okText;
        if (!row.pdaNumber || row.pdaNumber === 0) status = noPdaText;
        else if (row.difference !== 0) status = mismatchText;
        return { ...row, status };
      });
      setAllRows(rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnOpenPdaDetail = (row) => {
    if (!row.pdaNumber || row.pdaNumber === 0) return;
    setLoading(true);
    request.GET(`accounting/reports/moduleAudit/pdaDetail/${row.pdaNumber}`, (resp) => {
      setPdaDetailData({ pdaNumber: row.pdaNumber, lines: resp.data });
      setOpenPdaDetail(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const table = {
    title: IntlMessages('page.moduleAudit.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.moduleAudit.table.document'), dataField: 'documentName', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.moduleAudit.table.description'), dataField: 'description', headerStyle: { width: '25%' } },
      { text: IntlMessages('page.moduleAudit.table.documentNumber'), dataField: 'documentNumber', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.moduleAudit.table.value'), dataField: 'value', type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.moduleAudit.table.accountingValue'), dataField: 'accountingValue', type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.moduleAudit.table.difference'), dataField: 'difference', type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.moduleAudit.table.status'), dataField: 'status', headerStyle: { width: '10%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '4%' },
        cell: ({ row }) => (row.original.pdaNumber ? (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.moduleAudit.table.viewPda')}
            onClick={() => fnOpenPdaDetail(row.original)}
          />
        ) : null)
      }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = {
    totalValue: formatNumber(allRows.reduce((sum, r) => sum + Number(r.value || 0), 0)),
    totalAccountingValue: formatNumber(allRows.reduce((sum, r) => sum + Number(r.accountingValue || 0), 0)),
    totalDifference: formatNumber(allRows.reduce((sum, r) => sum + Number(r.difference || 0), 0))
  };

  const fnExportXlsx = () => {
    const moduleName = modules.find((m) => m.id === Number(moduleId))?.name;
    fnExport('accounting/reports/moduleAudit/exportXLSX', { moduleId, dateStart, dateEnd, moduleName }, 'AuditoriaDeModulos.xlsx');
  }

  const propsToHeader = { moduleId, dateStart, dateEnd, modules, onInputChange, fnSearch, fnExportXlsx };

  const propsToModalPdaDetail = {
    ModalContent: ModalPdaDetail,
    title: 'page.moduleAudit.modal.pdaDetail.title',
    open: openPdaDetail,
    setOpen: setOpenPdaDetail,
    maxWidth: 'md',
    data: { detail: pdaDetailData, formatNumber }
  }

  return { table, totals, propsToHeader, propsToModalPdaDetail };
}
