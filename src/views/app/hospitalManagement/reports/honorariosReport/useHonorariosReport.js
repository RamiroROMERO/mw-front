import { useEffect, useMemo, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import { TYPES, validateRange, buildRequest, toTotal } from './honorariosRules';

// SPEC v2-149-sr: tres reportes (honorarios en facturas, recibos de honorarios y total por médico), todos por GET. El PDF y el Excel los arma el back con las mismas filas.
const columnsFor = {
  lines: () => [
    { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date' },
    { text: IntlMessages('page.honorariosReport.table.documentNumber'), dataField: 'documentNumber' },
    { text: IntlMessages('page.honorariosReport.table.event'), dataField: 'eventId' },
    { text: IntlMessages('page.honorariosReport.table.patientName'), dataField: 'patientName' },
    { text: IntlMessages('page.honorariosReport.table.insurance'), dataField: 'insuranceName' },
    { text: IntlMessages('table.column.provider'), dataField: 'providerName' },
    { text: IntlMessages('page.honorariosReport.table.productName'), dataField: 'productName' },
    { text: IntlMessages('page.honorariosReport.table.qty'), dataField: 'qty', type: 'number' },
    { text: IntlMessages('page.honorariosReport.table.price'), dataField: 'price', type: 'number' },
    { text: IntlMessages('table.column.total'), dataField: 'total', type: 'number' },
    { text: IntlMessages('page.honorariosReport.table.hospitalValue'), dataField: 'hospitalValue', type: 'number' }
  ],
  receipts: () => [
    { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date' },
    { text: IntlMessages('page.honorariosReport.table.receipt'), dataField: 'id' },
    { text: IntlMessages('page.honorariosReport.table.documentNumber'), dataField: 'documentNumber' },
    { text: IntlMessages('page.honorariosReport.table.event'), dataField: 'eventId' },
    { text: IntlMessages('page.honorariosReport.table.patientName'), dataField: 'patientName' },
    { text: IntlMessages('page.honorariosReport.table.insurance'), dataField: 'insuranceName' },
    { text: IntlMessages('table.column.provider'), dataField: 'providerName' },
    { text: IntlMessages('table.column.description'), dataField: 'description' },
    { text: IntlMessages('page.honorariosReport.table.value'), dataField: 'value', type: 'number' },
    { text: IntlMessages('page.honorariosReport.table.retention'), dataField: 'retention', type: 'number' },
    { text: IntlMessages('table.column.total'), dataField: 'total', type: 'number' }
  ],
  summary: () => [
    { text: IntlMessages('table.column.provider'), dataField: 'providerName' },
    { text: IntlMessages('page.honorariosReport.table.linesTotal'), dataField: 'linesTotal', type: 'number' },
    { text: IntlMessages('page.honorariosReport.table.receiptsTotal'), dataField: 'receiptsTotal', type: 'number' },
    { text: IntlMessages('table.column.total'), dataField: 'total', type: 'number' }
  ]
};

export const useHonorariosReport = ({ setLoading }) => {
  const [allData, setAllData] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const { formState, onInputChange } = useForm({
    type: 'lines',
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    search: ''
  });

  const { type, dateStart, dateEnd, search } = formState;
  const typeOptions = TYPES.map((id) => ({ id, label: `page.honorariosReport.type.${id}` }));

  const visible = useMemo(() => {
    const text = String(search || '').trim().toUpperCase();
    if (!text) return allData;
    return allData.filter((item) => Object.values(item).join(' ').toUpperCase().includes(text));
  }, [allData, search]);

  const table = useMemo(() => ({
    title: IntlMessages('page.honorariosReport.table.title'),
    columns: columnsFor[type](),
    data: visible
  }), [type, visible]);

  const fnSearchReport = (nextType = type) => {
    const invalid = validateRange({ dateStart, dateEnd });
    setError(invalid);
    if (invalid) return;
    const { url, params } = buildRequest({ type: nextType, dateStart, dateEnd });
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setAllData(resp.data?.rows || []);
      setTotal(toTotal(resp.data));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  // Descarga el MISMO reporte en PDF o Excel; el back lo arma en memoria con los filtros elegidos.
  const fnDownload = (format) => {
    const invalid = validateRange({ dateStart, dateEnd });
    setError(invalid);
    if (invalid) return;
    const { url, params } = buildRequest({ type, dateStart, dateEnd }, format);
    setLoading(true);
    request.GETPdf(url, params, `${type}.${format}`, (err) => {
      setLoading(false);
      notifyError(err, 'page.honorariosReport.msg.exportError');
    }, 'GET', () => setLoading(false));
  };

  const onTypeChange = (event) => {
    onInputChange(event);
    setAllData([]);
    setTotal(0);
    fnSearchReport(event.target.value);
  };

  useEffect(() => {
    fnSearchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeaderReport = {
    type, typeOptions, dateStart, dateEnd, search, error, onInputChange, onTypeChange,
    fnSearchReport: () => fnSearchReport(), fnExportExcel: () => fnDownload('xlsx'), fnPrint: () => fnDownload('pdf')
  };

  const propsToTotals = { total: formatNumber(total) };

  return { table, propsToHeaderReport, propsToTotals };
};
