import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { buildReportRequest } from './reportRequestRules';
import { useForm } from '@Hooks';

const ASSET_REPORT_TYPES = [
  { id: 1, label: 'page.fixedAssets.report.byType' },
  { id: 2, label: 'page.fixedAssets.report.byAssignment' },
  { id: 3, label: 'page.fixedAssets.report.byArea' },
  { id: 4, label: 'page.fixedAssets.report.assignmentHistory' },
  { id: 5, label: 'page.fixedAssets.report.totalValue' }
];

export const useReports = ({ setLoading }) => {
  const [category, setCategory] = useState('assets');
  const [typeList, setTypeList] = useState([]);
  const [responsibleList, setResponsibleList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [openModalSchedule, setOpenModalSchedule] = useState(false);
  const [scheduleAssetId, setScheduleAssetId] = useState(null);

  const { formState, onInputChange } = useForm({
    reportType: 1,
    typeId: '',
    responsibleId: '',
    areaId: ''
  });

  const { reportType, typeId, responsibleId, areaId } = formState;

  const [table, setTable] = useState({ columns: [], data: [] });

  const COLUMNS_BY_TYPE = {
    1: [
      { text: IntlMessages('page.fixedAssets.input.code'), dataField: 'code' },
      { text: IntlMessages('input.name'), dataField: 'name' },
      { text: IntlMessages('page.fixedAssets.select.type'), dataField: 'typeName' },
      { text: IntlMessages('page.fixedAssets.input.valueIn'), dataField: 'valueIn', type: 'number' },
      { text: IntlMessages('page.fixedAssets.table.accumulatedDepreciation'), dataField: 'valueApplied', type: 'number' },
      { text: IntlMessages('page.fixedAssets.table.bookValue'), dataField: 'bookValue', type: 'number' },
      { text: IntlMessages('page.fixedAssets.select.responsible'), dataField: 'responsibleName' }
    ],
    2: [
      { text: IntlMessages('page.fixedAssets.input.code'), dataField: 'code' },
      { text: IntlMessages('input.name'), dataField: 'name' },
      { text: IntlMessages('page.fixedAssets.select.responsible'), dataField: 'responsibleName' },
      { text: IntlMessages('page.fixedAssets.select.area'), dataField: 'areaName' },
      { text: IntlMessages('page.fixedAssets.input.valueIn'), dataField: 'valueIn', type: 'number' },
      { text: IntlMessages('page.fixedAssets.table.bookValue'), dataField: 'bookValue', type: 'number' }
    ],
    3: [
      { text: IntlMessages('page.fixedAssets.input.code'), dataField: 'code' },
      { text: IntlMessages('input.name'), dataField: 'name' },
      { text: IntlMessages('page.fixedAssets.select.area'), dataField: 'areaName' },
      { text: IntlMessages('page.fixedAssets.select.responsible'), dataField: 'responsibleName' },
      { text: IntlMessages('page.fixedAssets.input.valueIn'), dataField: 'valueIn', type: 'number' },
      { text: IntlMessages('page.fixedAssets.table.bookValue'), dataField: 'bookValue', type: 'number' }
    ],
    4: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date' },
      { text: IntlMessages('page.fixedAssets.input.code'), dataField: 'code' },
      { text: IntlMessages('input.name'), dataField: 'name' },
      { text: IntlMessages('page.fixedAssets.select.responsible'), dataField: 'responsibleName' },
      { text: IntlMessages('page.fixedAssets.select.area'), dataField: 'areaName' },
      { text: IntlMessages('page.fixedAssets.title.status'), dataField: 'stateName' },
      { text: IntlMessages('page.fixedAssets.input.dateEnd'), dataField: 'dateEnd', type: 'date' }
    ],
    5: [
      { text: IntlMessages('page.fixedAssets.select.type'), dataField: 'typeName' },
      { text: IntlMessages('page.fixedAssets.table.quantity'), dataField: 'quantity', type: 'number' },
      { text: IntlMessages('page.fixedAssets.input.valueBuy'), dataField: 'totalValueBuy', type: 'number' },
      { text: IntlMessages('page.fixedAssets.input.valueIn'), dataField: 'totalValueIn', type: 'number' },
      { text: IntlMessages('page.fixedAssets.table.accumulatedDepreciation'), dataField: 'totalAccumulated', type: 'number' },
      { text: IntlMessages('page.fixedAssets.table.bookValue'), dataField: 'totalBook', type: 'number' }
    ]
  };

  const DEPREC_COLUMNS = [
    { text: IntlMessages('page.fixedAssets.input.code'), dataField: 'code' },
    { text: IntlMessages('input.name'), dataField: 'name' },
    { text: IntlMessages('page.fixedAssets.input.valueIn'), dataField: 'cost', type: 'number' },
    { text: IntlMessages('page.fixedAssets.input.useLife'), dataField: 'useLife' },
    { text: IntlMessages('page.fixedAssets.table.totalPeriods'), dataField: 'totalPeriods' },
    { text: IntlMessages('page.fixedAssets.table.appliedPeriods'), dataField: 'appliedPeriods' },
    { text: IntlMessages('page.fixedAssets.table.accumulatedDepreciation'), dataField: 'accumulatedDepreciation', type: 'number' },
    { text: IntlMessages('page.fixedAssets.table.pendingDepreciation'), dataField: 'pendingDepreciation', type: 'number' },
    { text: IntlMessages('page.fixedAssets.table.bookValue'), dataField: 'bookValue', type: 'number' }
  ];

  const fnGenerateAssetsReport = () => {
    setLoading(true);
    request.GET(buildUrl('fixedAssets/reports/search', { reportType, typeId, responsibleId, areaId }), (resp) => {
      setTable({ columns: COLUMNS_BY_TYPE[reportType] || [], data: resp.data });
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnGenerateDeprecReport = () => {
    setLoading(true);
    request.GET('fixedAssets/reports/depreciationSummary', (resp) => {
      setTable({
        columns: DEPREC_COLUMNS,
        data: resp.data,
        actions: [{ color: 'primary', icon: 'eye', toolTip: 'button.view', onClick: (row) => fnViewSchedule(row) }]
      });
      setLoading(false);
    }, () => setLoading(false));
  }

  // Descarga el MISMO reporte en PDF o Excel: el back lo arma de lo guardado (con los filtros elegidos) y lo envía en memoria. Los parámetros van en `data` (GETPdf los pone en la URL).
  const fnDownload = (format) => {
    const { url, params, fileName } = buildReportRequest({ category, reportType, typeId, responsibleId, areaId }, format);
    setLoading(true);
    request.GETPdf(url, params, fileName, (err) => {
      setLoading(false);
      notifyError(err, 'page.fixedAssets.msg.reportError');
    }, 'GET', () => setLoading(false));
  }

  const fnViewSchedule = (row) => {
    setScheduleAssetId(row.assetId);
    setOpenModalSchedule(true);
  }

  const fnChangeCategory = (value) => {
    setCategory(value);
    setTable({ columns: [], data: [] });
  }

  useEffect(() => {
    request.GET('fixedAssets/settings/types/getSL', (resp) => {
      setTypeList((resp.data || []).map((item) => ({ value: item.id, label: item.name })));
    }, () => { });
    request.GET('fixedAssets/settings/responsibles/getSL', (resp) => {
      setResponsibleList((resp.data || []).map((item) => ({ value: item.id, label: item.name })));
    }, () => { });
    request.GET('fixedAssets/reports/areas', (resp) => {
      setAreaList((resp.data || []).map((item) => ({ value: item.id, label: item.name })));
    }, () => { });
  }, []);

  return {
    category,
    fnChangeCategory,
    formState,
    onInputChange,
    typeList,
    responsibleList,
    areaList,
    assetReportTypes: ASSET_REPORT_TYPES,
    table,
    fnGenerateAssetsReport,
    fnGenerateDeprecReport,
    fnDownload,
    openModalSchedule,
    setOpenModalSchedule,
    scheduleAssetId
  }
}
