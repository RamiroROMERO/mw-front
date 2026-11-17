import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import useProductOptions from '../../settings/productsCatalog/useProductOptions';
import { useReportData } from './useReportData';
import { buildColumns } from './reportTable';
import { REPORT_TITLES } from './purchaseReportRules';

// Reporte de Compras (SPEC v2-57-sr): detalle por producto (`detailByProduct`) o, con "Bonificaciones", solo las líneas bonificadas (`bonus`).
// El back valida el filtro, filtra por empresa y suma en centavos; el front solo muestra lo que llega y descarga el mismo reporte en Excel o PDF.
export const usePurchaseReport = ({ setLoading }) => {
  const intl = useIntl();
  const [listProviders, setListProviders] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [openModalOtherReport, setOpenModalOtherReport] = useState(false);
  const { options: listProducts, onInputChange: onProductSearch } = useProductOptions();

  const { formState, onInputChange } = useForm({ providerId: 0, storeId: 0, productId: 0, dateStart: '', dateEnd: '', isBonus: 0 });
  const { providerId, storeId, productId, dateStart, dateEnd, isBonus } = formState;
  const { report, errors, sendForm, downloading, fnSearch, fnDownload } = useReportData({ setLoading });

  const type = isBonus === true || isBonus === 1 ? 'bonus' : 'detailByProduct';
  const filter = { providerId, storeId, productCode: productId, dateStart, dateEnd };
  const title = REPORT_TITLES[type];

  const table = useMemo(() => ({
    title: '',
    columns: buildColumns(type, intl.formatMessage),
    data: report.rows,
    actions: [
      { color: 'secondary', icon: 'file-earmark-excel', onClick: () => fnDownload(type, filter, 'xlsx', title), title: 'Exportar', isFreeAction: true },
      { color: 'info', icon: 'printer', onClick: () => fnDownload(type, filter, 'pdf', title), title: 'Imprimir', isFreeAction: true }
    ]
  }), [report.rows, type, providerId, storeId, productId, dateStart, dateEnd, downloading, intl.locale]);

  useEffect(() => {
    request.GET('inventory/process/providers', (resp) => {
      setListProviders(resp.data.map((item) => ({ label: item.name, value: item.id })));
    });
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores(resp.data.map((item) => ({ label: item.name, value: item.id })));
    });
  }, []);

  const propsToHeaderReport = {
    ...formState,
    listProviders,
    listStores,
    listProducts,
    errors,
    sendForm,
    onInputChange,
    onProductSearch,
    fnSearchReport: () => fnSearch(type, filter),
    fnOpenOtherReports: () => setOpenModalOtherReport(true)
  };

  return { table, dataTotals: report.totals, propsToHeaderReport, listProviders, listStores, listProducts, onProductSearch, openModalOtherReport, setOpenModalOtherReport };
};
