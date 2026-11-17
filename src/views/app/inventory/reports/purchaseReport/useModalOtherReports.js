import { useIntl } from 'react-intl';
import { useForm } from '@Hooks';
import createNotification from '@Containers/ui/Notifications';
import { useReportData } from './useReportData';
import { buildColumns } from './reportTable';
import { RADIO_TO_TYPE, REPORT_TITLES, normalizeReport } from './purchaseReportRules';

// "Otros Reportes" (SPEC v2-57-sr y v2-58-sr): las 13 opciones de inv_repocompras.sc2 usan el mismo
// endpoint común y se pueden ver en pantalla, descargar en Excel o imprimir (PDF).
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
