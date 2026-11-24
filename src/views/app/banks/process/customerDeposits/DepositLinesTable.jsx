import { Row, Table, Button } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useIntl } from 'react-intl';
import { validFloat } from '@Helpers/Utils';

// Tabla con inputs editables por fila (no ReactTableEdit — ese componente no soporta
// acciones/celdas formateadas y silencia valores objeto, ver feedback_reacttableedit_no_actions_no_cell).
export const DepositLinesTable = ({ lines, listAccount, fnUpdateLine, fnRemoveLine, fnOpenInvoicesPicker, isApplied, totals, problem }) => {
  // Un solo useIntl arriba: la columna de opciones sale dentro de una condición (isApplied cambia al contabilizar) y un hook no puede llamarse así.
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { applied: totalApplied, deduction: totalDeduction, difference } = totals;
  // Diferencia en rojo cuando la regla del tope la rechazaría (SPEC v2-22).
  const differenceFailed = problem && (problem.code === 'deposit.shortage.exceeded');

  return (
    <>
      <Row className="mb-2">
        <Colxx xxs="12" align="right">
          {!isApplied && (
            <Button color="primary" size="sm" onClick={fnOpenInvoicesPicker}>
              <i className="bi bi-plus" /> {t('page.customerDeposits.button.addInvoices')}
            </Button>
          )}
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Table bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>{t('table.column.nInvoice')}</th>
                <th>{t('table.column.date')}</th>
                <th>{t('page.customerDeposits.table.originalValue')}</th>
                <th>{t('page.customerDeposits.table.appliedValue')}</th>
                <th>{t('page.customerDeposits.table.deductionValue')}</th>
                <th>{t('page.customerDeposits.table.deductionReason')}</th>
                <th>{t('page.customerDeposits.select.deductionAccount')}</th>
                {!isApplied && <th>{t('table.column.options')}</th>}
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={index}>
                  <td>{line.documentCode}</td>
                  <td>{line.date}</td>
                  <td>{validFloat(line.originalValue).toFixed(2)}</td>
                  <td style={{ minWidth: 110 }}>
                    <InputField
                      name="appliedValue"
                      value={line.appliedValue}
                      onChange={(e) => fnUpdateLine(index, 'appliedValue', e.target.value)}
                      type="text"
                      disabled={isApplied}
                    />
                  </td>
                  <td style={{ minWidth: 110 }}>
                    <InputField
                      name="deductionValue"
                      value={line.deductionValue}
                      onChange={(e) => fnUpdateLine(index, 'deductionValue', e.target.value)}
                      type="text"
                      disabled={isApplied}
                    />
                  </td>
                  <td style={{ minWidth: 160 }}>
                    <InputField
                      name="deductionDescription"
                      value={line.deductionDescription}
                      onChange={(e) => fnUpdateLine(index, 'deductionDescription', e.target.value)}
                      type="text"
                      disabled={isApplied}
                    />
                  </td>
                  <td style={{ minWidth: 200 }}>
                    <SearchSelect
                      name="deductionAccount"
                      inputValue={line.deductionAccount}
                      onChange={(e) => fnUpdateLine(index, 'deductionAccount', e.target.value)}
                      options={listAccount}
                      isDisabled={isApplied}
                    />
                  </td>
                  {!isApplied && (
                    <td>
                      <Button color="danger" size="sm" onClick={() => fnRemoveLine(index)}>
                        <i className="bi bi-trash" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="6" sm="4">
          <InputField value={totalApplied.toFixed(2)} name="totalApplied" label="page.customerDeposits.table.totalApplied" type="text" disabled />
        </Colxx>
        <Colxx xxs="6" sm="4">
          <InputField value={totalDeduction.toFixed(2)} name="totalDeduction" label="page.customerDeposits.table.totalDeduction" type="text" disabled />
        </Colxx>
        <Colxx xxs="12" sm="4">
          <InputField
            value={difference.toFixed(2)}
            name="difference"
            label="page.customerDeposits.table.difference"
            type="text"
            invalid={!!differenceFailed}
            feedbackText={differenceFailed ? 'page.customerDeposits.msg.shortageExceeded' : null}
            bold
            disabled
          />
        </Colxx>
      </Row>
    </>
  )
}
