import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import useProductOptions from '../../settings/productsCatalog/useProductOptions';
import { useInventoryReportData } from './useInventoryReportData';
import { buildColumns } from './reportTable';

const DETAIL = 1; // La pantalla principal muestra el detallado por centro de destino; los demás están en "Otros reportes".

// Reporte de inventario (SPEC v2-60-sr): detallado por centro de destino con sus filtros, Excel e Imprimir. Almacenes origen = tipo 1; centros de destino = tipo 2.
export const useInventoryReport = ({ setLoading }) => {
  const intl = useIntl();
  const [listStores, setListStores] = useState([]);
  const [listDestinations, setListDestinations] = useState([]);
  const [openModalOtherReport, setOpenModalOtherReport] = useState(false);
  const { options: listProducts, onInputChange: onProductSearch } = useProductOptions();

  const { formState, onInputChange } = useForm({ storeId: 0, destinationId: 0, productCode: 0, dateStart: '', dateEnd: '' });
  const { report, errors, sendForm, downloading, fnSearch, fnDownload } = useInventoryReportData({ setLoading });

  const table = useMemo(() => ({
    title: '',
    columns: buildColumns(DETAIL, intl.formatMessage),
    data: report.rows,
    actions: [
      { color: 'secondary', icon: 'file-earmark-excel', onClick: () => fnDownload(DETAIL, formState, 'xlsx'), title: 'Exportar', isFreeAction: true },
      { color: 'info', icon: 'printer', onClick: () => fnDownload(DETAIL, formState, 'pdf'), title: 'Imprimir', isFreeAction: true }
    ]
  }), [report.rows, formState, downloading, intl.locale]);

  useEffect(() => {
    request.GET('inventory/settings/stores?type=1', (resp) => setListStores(resp.data.map((item) => ({ label: item.name, value: item.id }))));
    request.GET('inventory/settings/stores?type=2', (resp) => setListDestinations(resp.data.map((item) => ({ label: item.name, value: item.id }))));
  }, []);

  const propsToHeaderReport = {
    ...formState,
    listStores,
    listDestinations,
    listProducts,
    errors,
    sendForm,
    onInputChange,
    onProductSearch,
    fnSearchReport: () => fnSearch(DETAIL, formState),
    fnOtherReport: () => setOpenModalOtherReport(true)
  };

  return { table, propsToHeaderReport, listStores, listDestinations, listProducts, onProductSearch, openModalOtherReport, setOpenModalOtherReport };
};
