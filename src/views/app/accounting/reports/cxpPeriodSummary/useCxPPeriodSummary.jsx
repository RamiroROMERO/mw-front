import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { adminRoot } from '@Constants/defaultValues';

// Equivalente a cont_cxp_week_report.sc2 ("Saldos y Pagos"). Genuinamente distinto de
// cualquier reporte "Semanal" de CxC (advertencia del usuario: no asumir que espeja a
// CxC) — no es un aging de 8 semanas, es un resumen de MOVIMIENTO por proveedor en un
// rango [Desde, Hasta]: saldo acumulado ANTES de Desde (corte histórico) + facturas
// nuevas creadas DENTRO del rango (valor completo, no saldo) + pagos registrados DENTRO
// del rango (sin importar a qué factura se aplicaron). Ver findPeriodSummaryByProvider
// en el backend para el detalle completo de la fórmula, incluyendo el quirk fiel del
// legacy donde un proveedor que SOLO pagó en el período (sin saldo previo ni facturas
// nuevas) queda fuera del reporte.
// El botón "..." del legacy abre `cont_cxp_detail.sc2` (un historial de proveedor SIN
// rango de fechas, con notas por proveedor/factura vía cont_cxp_comment — tabla con solo
// 2 filas reales en todo el sistema, feature esencialmente sin uso) — en vez de duplicar
// esa pantalla casi idéntica a la ya construida `cxpProviderHistory`, este botón navega
// ahí con el proveedor pre-seleccionado (mismo patrón de reutilización ya usado en toda
// la familia CxC/CxP). El checkbox de selección por fila del legacy (Column9, usado para
// filtrar qué providers salen en el reporte IMPRESO) y el botón "Imprimir" no se migran,
// mismo criterio aplicado a toda pantalla de reportes de esta sesión (no se replican
// reportes .frx nativos, solo Exportar XLS).
export const useCxPPeriodSummary = ({ setLoading }) => {
  const navigate = useNavigate();
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.now())
  });
  const { dateStart, dateEnd } = formState;

  const [rows, setRows] = useState([]);

  const fnSearch = () => {
    if (!dateStart || !dateEnd) return;
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/periodSummary', { dateStart, dateEnd }), (resp) => {
      setRows(resp.data);
      setLoading(false);
    }, () => setLoading(false));
  }

  useEffect(() => { fnSearch(); }, []);

  const fnViewProvider = (row) => {
    navigate(`${adminRoot}/accounting/reports/cxpProviderHistory`, { state: { providerId: row.providerId } });
  }

  const table = {
    title: IntlMessages('page.cxpPeriodSummary.table.title'),
    columns: [
      { text: IntlMessages('page.cxpProviderHistory.input.provider'), dataField: 'providerName', headerStyle: { width: '34%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.accumulated'), dataField: 'accumulated', type: 'number', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.added'), dataField: 'added', type: 'number', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.total'), dataField: 'total', type: 'number', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.paid'), dataField: 'paid', type: 'number', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '13%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '4%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.cxpPeriodSummary.table.viewProvider')}
            onClick={() => fnViewProvider(row.original)}
          />
        )
      }
    ],
    data: rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = {
    totalAccumulated: formatNumber(rows.reduce((sum, r) => sum + Number(r.accumulated || 0), 0)),
    totalAdded: formatNumber(rows.reduce((sum, r) => sum + Number(r.added || 0), 0)),
    totalTotal: formatNumber(rows.reduce((sum, r) => sum + Number(r.total || 0), 0)),
    totalPaid: formatNumber(rows.reduce((sum, r) => sum + Number(r.paid || 0), 0)),
    totalBalance: formatNumber(rows.reduce((sum, r) => sum + Number(r.balance || 0), 0))
  };

  const fnExportXlsx = () => {
    fnExport('accounting/process/accountsPayable/periodSummary/exportXLSX', { dateStart, dateEnd }, 'CuentasPorPagarSaldosYPagos.xlsx');
  }

  const propsToHeader = { dateStart, dateEnd, onInputChange, fnSearch, fnExportXlsx };

  return { table, totals, propsToHeader };
}
