import { Row, Form, Button, Table, Input } from 'reactstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';

const CreditNoteInvoicesTable = (props) => {
  const { detail1, discountPercent, onInputChange, fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row, disabled } = props;

  const total = detail1.reduce((sum, item) => sum + Number(item.valuePayment || 0), 0);

  return (
    <Form>
      <Row className="mb-2">
        <Colxx xxs="12" sm="6" lg="8">
          {!disabled && (
            <Button color="primary" onClick={fnAddInvoices}>
              <i className="bi bi-plus" /> {IntlMessages("button.addInvoice")}
            </Button>
          )}
        </Colxx>
        {!disabled && (
          <>
            <Colxx xxs="7" sm="3" lg="2">
              <InputField
                name="discountPercent"
                label="page.custCreditNotes.input.percentToApply"
                value={discountPercent}
                onChange={onInputChange}
                type="text"
              />
            </Colxx>
            <Colxx xxs="5" sm="3" lg="2" className="mb-3">
              <Button color="secondary" onClick={fnApplyPercentToAll}>
                <i className="bi bi-check" /> {IntlMessages("button.apply")}
              </Button>
            </Colxx>
          </>
        )}
      </Row>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.custCreditNotes.title.invoicesDetail">
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>{IntlMessages("page.custCreditNotes.table.date")}</th>
                  <th>{IntlMessages("page.custCreditNotes.table.invoice")}</th>
                  <th>{IntlMessages("page.custCreditNotes.table.balance")}</th>
                  <th>{IntlMessages("page.custCreditNotes.table.percent")}</th>
                  <th>{IntlMessages("page.custCreditNotes.table.valueToApply")}</th>
                  {!disabled && <th>{IntlMessages("page.invoicing.options")}</th>}
                </tr>
              </thead>
              <tbody>
                {detail1.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.dateDocument}</td>
                    <td>{item.invoiceCode}</td>
                    <td align="right">{formatNumber(item.invoiceVal)}</td>
                    <td align="right">
                      {disabled ? formatNumber(item.percent) : (
                        <Input bsSize="sm" type="text" value={item.percent} onChange={(e) => onChangeDetail1Row(item.id, 'percent', e.target.value)} />
                      )}
                    </td>
                    <td align="right">
                      {disabled ? formatNumber(item.valuePayment) : (
                        <Input bsSize="sm" type="text" value={item.valuePayment} onChange={(e) => onChangeDetail1Row(item.id, 'valuePayment', e.target.value)} />
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
                  <th colSpan={4} align="right">{IntlMessages("page.invoicing.input.total")}</th>
                  <th align="right">{formatNumber(total, "L.")}</th>
                  {!disabled && <th />}
                </tr>
              </tfoot>
            </Table>
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </Form>
  )
}
export default CreditNoteInvoicesTable;
