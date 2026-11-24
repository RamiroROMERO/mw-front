import { Card, CardBody, Row, Table, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Confirmation from '@Containers/ui/confirmationMsg';
import HeaderReport from './HeaderReport';
import { useModuleOpeningClosing } from './useModuleOpeningClosing';
import { cellState, monthState, STATUS_OPEN, STATUS_CLOSED } from './moduleOpeningClosingRules';

const ModuleOpeningClosing = ({ setLoading }) => {
  const { t, data, settings, yearText, setYearText, yearError, load, fnGenerate, askCell, askBulk, propsToConfirm } = useModuleOpeningClosing({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <Card><CardBody>
            <HeaderReport {...{ yearText, setYearText, yearError, load, settings, t }} />
          </CardBody></Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Card><CardBody>
            <Table responsive bordered size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>{t('page.moduleOpeningClosing.input.month')}</th>
                  {data.modules.map((m) => <th key={m.id} className="text-center">{m.name}</th>)}
                  <th className="text-center">{t('page.moduleOpeningClosing.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data.months.map((month) => {
                  const state = monthState(month);
                  return (
                    <tr key={month.monthIndex}>
                      <td><strong>{month.monthName}</strong></td>
                      {month.cells.map((cell) => {
                        const s = cellState(cell);
                        if (s === 'none') return <td key={cell.moduleId} className="text-center text-muted">-</td>;
                        return (
                          <td key={cell.moduleId} className="text-center">
                            <Button size="sm" color={s === 'open' ? 'success' : 'danger'} outline onClick={() => askCell(month, cell)}
                              title={t(s === 'open' ? 'page.moduleOpeningClosing.status.open' : 'page.moduleOpeningClosing.status.closed')}>
                              <i className={s === 'open' ? 'bi bi-unlock-fill' : 'bi bi-lock-fill'} />
                            </Button>
                          </td>
                        );
                      })}
                      <td className="text-center text-nowrap">
                        {state === 'notGenerated' || state === 'empty' ? (
                          <Button size="sm" color="primary" onClick={() => fnGenerate(month.monthIndex)}>
                            <i className="bi bi-gear-fill" /> {t('page.moduleOpeningClosing.button.generate')}
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" color="success" className="me-1" disabled={state === 'allOpen'} onClick={() => askBulk(month, STATUS_OPEN)}>
                              <i className="bi bi-unlock-fill" /> {t('page.moduleOpeningClosing.button.openAll')}
                            </Button>
                            <Button size="sm" color="danger" disabled={state === 'allClosed'} onClick={() => askBulk(month, STATUS_CLOSED)}>
                              <i className="bi bi-lock-fill" /> {t('page.moduleOpeningClosing.button.closeAll')}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </CardBody></Card>
        </Colxx>
      </Row>
      <Confirmation {...propsToConfirm} />
    </>
  );
};
export default ModuleOpeningClosing;
