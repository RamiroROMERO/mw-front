import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { useIntl } from 'react-intl';
import { Colxx } from '@Components/common/CustomBootstrap';
import { formatNumber } from '@Helpers/Utils';

// Confirmación del cambio (SPEC v2-55-sr): muestra el alcance (filas por tabla) y el aviso de horario ANTES del "Sí".
// Un solo useIntl arriba: los textos nunca se piden dentro de condiciones.
const ModalConfirmChange = ({ data, setOpen }) => {
  const { preview, oldCode, name, fnConfirm } = data;
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);
  const references = preview?.references || [];
  const nameOnly = Boolean(preview?.nameOnly);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            {nameOnly
              ? <p>{t('page.changeCode.msg.confirmNameOnly', { code: oldCode, name })}</p>
              : <p>{t('page.changeCode.msg.confirmChange', { oldCode, newCode: preview?.newCode, rows: formatNumber(preview?.totalRows || 0, '', 0), tables: references.length })}</p>}
            {!nameOnly && <p className="text-warning"><i className="bi bi-exclamation-triangle-fill" /> {t('page.changeCode.msg.scheduleWarning')}</p>}
          </Colxx>
        </Row>
        {!nameOnly && (
          <Row>
            <Colxx xxs="12">
              <Table bordered size="sm">
                <thead>
                  <tr>
                    <th>{t('page.changeCode.column.table')}</th>
                    <th>{t('page.changeCode.column.field')}</th>
                    <th className="text-end">{t('page.changeCode.column.rows')}</th>
                  </tr>
                </thead>
                <tbody>
                  {references.map((item) => (
                    <tr key={`${item.table}.${item.column}`}>
                      <td>{item.table}</td>
                      <td>{item.column}</td>
                      <td className="text-end">{formatNumber(item.rows, '', 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Colxx>
          </Row>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnConfirm}>
          <i className="bi bi-check-lg" /> {t('alert.question.yes')}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-x-lg" /> {t('alert.question.no')}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalConfirmChange;
