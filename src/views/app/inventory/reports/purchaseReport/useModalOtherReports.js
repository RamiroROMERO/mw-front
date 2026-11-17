import { useIntl } from 'react-intl';
import { useForm } from '@Hooks';
import createNotification from '@Containers/ui/Notifications';
import { useReportData } from './useReportData';
import { buildColumns } from './reportTable';
import { RADIO_TO_TYPE, REPORT_TITLES, normalizeReport } from './purchaseReportRules';

// "Otros Reportes" (SPEC v2-57-sr): las 10 opciones de inv_repocompras.sc2 que ya existen en el back (1 a 5, 7 a 9, 12 y 13) usan el mismo
// endpoint común y se pueden ver en pantalla, descargar en Excel o imprimir (PDF). 6, 10 y 11 llegan con la SPEC v2-58-sr.
export const useModalOtherReports = ({ setLoading, onProductSearch }) => {
  const intl = useIntl();
  const { formState, onInputChange } = useForm({ providerId: 0, storeId: 0, productId: 0, dateStart: '', dateEnd: '', typeReport: 0 });
  const { typeReport, providerId, storeId, productId, dateStart, dateEnd } = formState;
  const { report, setReport, errors, sendForm, downloading, fnSearch, fnDownload } = useReportData({ setLoading });

  const type = RADIO_TO_TYPE[typeReport];
  const filter = { providerId, storeId, productCode: productId, dateStart, dateEnd };

  // Devuelve true si hay un tipo implementado; si no, avisa sin llamar al back.
  const withType = (fn) => {
    if (!type) {
      createNotification('warning', 'msg.purchaseReport.otherReports.notImplemented', 'alert.warning.title');
      return;
    }
    fn();
  };

  const fnSearchOtherReport = () => withType(() => fnSearch(type, filter));
  const fnDownloadOtherReport = (format) => withType(() => fnDownload(type, filter, format, REPORT_TITLES[type]));

  const onTypeChange = (e) => {
    onInputChange(e);
    setReport(normalizeReport());
  };

  const columns = buildColumns(type, intl.formatMessage);

  return { formState, errors, sendForm, downloading, onInputChange, onTypeChange, onProductSearch, fnSearchOtherReport, fnDownloadOtherReport, data: report.rows, columns };
};
