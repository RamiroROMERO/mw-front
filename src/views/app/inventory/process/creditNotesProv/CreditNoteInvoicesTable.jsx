import { Row, Form, Button, Table, Input } from 'reactstrap';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';

const CreditNoteInvoicesTable = (props) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const {
    detail1, discountPercent, accCode, accCodeError, listAccounts, onInputChange,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row, disabled
  } = props;

  const total = detail1.reduce((sum, item) => sum + Number(item.appliedValue || 0), 0);

  return (
    <Form>
      <Row className="mb-2">
        <Colxx xxs="12" sm="6" lg="8">
          {!disabled && (
            <Button color="primary" onClick={fnAddInvoices}>
              <i className="bi bi-plus" /> {t("button.addInvoice")}
            </Button>
          )}
        </Colxx>
        {!disabled && (
          <>
            <Colxx xxs="7" sm="3" lg="2">
              <InputField
                name="discountPercent"
                label="page.creditNotesProv.input.percentDiscount"
                value={discountPercent}
                onChange={onInputChange}
                type="text"
              />
            </Colxx>
            <Colxx xxs="5" sm="3" lg="2" className="mb-3">
              <Button color="secondary" onClick={fnApplyPercentToAll}>
                <i className="bi bi-check" /> {t("button.apply")}
              </Button>
            </Colxx>
          </>
        )}
      </Row>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.creditNotesProv.title.invoicesDetail">
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>{t("table.column.date")}</th>
                  <th>{t("table.column.invoice")}</th>
                  <th>{t("table.column.balance")}</th>
                  <th>{t("table.column.percent")}</th>
                  <th>{t("table.column.valueToApply")}</th>
                  {!disabled && <th>{t("table.column.options")}</th>}
                </tr>
              </thead>
              <tbody>
                {detail1.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.invoiceDate}</td>
                    <td>{item.invoiceNumber}</td>
                    <td align="right">{formatNumber(item.balance)}</td>
                    <td align="right">
                      {disabled ? formatNumber(item.percent) : (
                        <Input bsSize="sm" type="text" value={item.percent} onChange={(e) => onChangeDetail1Row(item.id, 'percent', e.target.value)} />
                      )}
                    </td>
                    <td align="right">
                      {disabled ? formatNumber(item.appliedValue) : (
                        <Input bsSize="sm" type="text" value={item.appliedValue} onChange={(e) => onChangeDetail1Row(item.id, 'appliedValue', e.target.value)} />
                      )}
                    </td>
                    {!disabled && (
                      <td align="right">
                        <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar" onClick={() => fnDeleteDetail1Row(item.id)}>
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={4} align="right">{t("input.total")}</th>
                  <th align="right">{formatNumber(total, "L.")}</th>
                  {!disabled && <th />}
                </tr>
              </tfoot>
            </Table>
          </ContainerWithLabel>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" sm="8" lg="6">
          <SimpleSelect
            label="select.accountId"
            name="accCode"
            value={accCode}
            options={listAccounts}
            onChange={onInputChange}
            disabled={disabled}
            invalid={!!accCodeError}
            feedbackText={accCodeError || null}
          />
        </Colxx>
      </Row>
    </Form>
  )
}
export default CreditNoteInvoicesTable;
