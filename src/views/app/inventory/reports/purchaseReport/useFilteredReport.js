import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import { useReportData } from './useReportData';
import { buildColumns } from './reportTable';
import { REPORT_TITLES } from './purchaseReportRules';

// Pantalla de reporte de compras con UN filtro (almacén o proveedor) y fechas (SPEC v2-57-sr): Almacén -> `byStore`, Proveedor -> `byProvider`
// y Gastos y Servicios -> `services`. Búsqueda, Excel e Imprimir (PDF) salen del mismo endpoint del back; el front no suma nada.
export const useFilteredReport = ({ setLoading, type, filterKey, listUrl }) => {
  const intl = useIntl();
  const [options, setOptions] = useState([]);
  const { formState, onInputChange } = useForm({ [filterKey]: 0, dateStart: '', dateEnd: '' });
  const { report, errors, sendForm, downloading, fnSearch, fnDownload } = useReportData({ setLoading });

  useEffect(() => {
    setLoading(true);
    request.GET(listUrl, (resp) => {
      setOptions(resp.data.map((item) => ({ label: item.name, value: item.id })));
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  const title = REPORT_TITLES[type];
  const table = useMemo(() => ({
    title: '',
    columns: buildColumns(type, intl.formatMessage),
    data: report.rows,
    actions: [
      { color: 'secondary', icon: 'file-earmark-excel', onClick: () => fnDownload(type, formState, 'xlsx', title), title: 'Exportar', isFreeAction: true },
      { color: 'info', icon: 'printer', onClick: () => fnDownload(type, formState, 'pdf', title), title: 'Imprimir', isFreeAction: true }
    ]
  }), [report.rows, formState, downloading, intl.locale]);

  return {
    table,
    dataTotals: report.totals,
    propsToHeaderReport: { ...formState, options, errors, sendForm, onInputChange, fnSearchReport: () => fnSearch(type, formState) }
  };
};
