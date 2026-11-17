import { useIntl } from 'react-intl';
import { useForm } from '@Hooks';
import { useInventoryReportData } from './useInventoryReportData';
import { buildColumns } from './reportTable';
import { usesField, usesStore, usesDates } from './inventoryReportRules';

// "Otros Reportes" (SPEC v2-60-sr): los 8 reportes de inv_reportes.sc2 con el mismo endpoint común: se ven en pantalla, se descargan en Excel o se imprimen
// (PDF). Los campos que el reporte no usa se ocultan.
export const useModalOtherReports = ({ setLoading }) => {
  const intl = useIntl();
  const { formState, onInputChange } = useForm({ typeId: 1, storeId: 0, destinationId: 0, productCode: 0, dateStart: '', dateEnd: '' });
  const { report, errors, sendForm, downloading, fnSearch, fnDownload, reset } = useInventoryReportData({ setLoading });
  const { typeId } = formState;

  const onTypeChange = (e) => { onInputChange(e); reset(); };
  const fnSearchOtherReport = () => fnSearch(typeId, formState);
  const fnDownloadOtherReport = (format) => fnDownload(typeId, formState, format);

  return {
    formState, errors, sendForm, downloading, onInputChange, onTypeChange, fnSearchOtherReport, fnDownloadOtherReport,
    data: report.rows, columns: buildColumns(typeId, intl.formatMessage),
    showStore: usesStore(typeId), showDestination: usesField(typeId, 'destination'), showProduct: usesField(typeId, 'product'), showDates: usesDates(typeId)
  };
};
