import { Row, Button, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { InputField } from '@Components/inputFields'
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { IntlMessages, validFloat } from "@Helpers/Utils";

export const UseDetailForm = ({
  formStateDetail, onInputChangeDetail, listAccount, formValidationDetail, sendFormDetail, fnAddItem,
  lines, fnEditLine, fnRemoveLine, editingLineIndex
}) => {
  const { idCtaCont, valueDebit, valueCredit, description, referenceCode } = formStateDetail;
  const { idCtaContValid } = formValidationDetail;

  return (
    <>
      <Row className='mb-2'>
        <Colxx xs="12">
          <ContainerWithLabel label="page.check.title.detalle">
            <Row>
              <Colxx xxs="12" xs="12" sm="6" lg="6">
                <SearchSelect
                  name="idCtaCont"
                  onChange={onInputChangeDetail}
                  inputValue={idCtaCont}
                  type="text"
                  label="select.accountId"
                  options={listAccount}
                  invalid={sendFormDetail && !!idCtaContValid}
                  feedbackText={sendFormDetail && idCtaContValid || null}
                />
              </Colxx>
              <Colxx xxs="6" xs="6" sm="3" lg="3">
                <InputField
                  name="valueDebit"
                  onChange={onInputChangeDetail}
                  value={valueDebit}
                  type="text"
                  label="page.checks.input.valueDebe"
                />
              </Colxx>
              <Colxx xxs="6" xs="6" sm="3" lg="3">
                <InputField
                  name="valueCredit"
                  onChange={onInputChangeDetail}
                  value={valueCredit}
                  type="text"
                  label="page.checks.input.valueHaber"
                />
              </Colxx>
              <Colxx xxs="12" md="6">
                <InputField
                  name="description"
                  onChange={onInputChangeDetail}
                  value={description}
                  type="textarea"
                  label="page.checks.input.overView"
                />
              </Colxx>
              <Colxx xxs="6" md="3">
                <InputField
                  name="referenceCode"
                  onChange={onInputChangeDetail}
                  value={referenceCode}
                  type="text"
                  label="page.checks.input.referenceCode"
                />
              </Colxx>
              <Colxx align="right">
                <Button color="primary" title={IntlMessages("button.add")}
                  onClick={() => { fnAddItem() }}>
                  <i className={editingLineIndex !== null ? 'bi bi-check-lg' : 'bi bi-plus'} />
                  {IntlMessages(editingLineIndex !== null ? "button.update" : "button.add")}
                </Button>
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <Table bordered hover>
            <thead>
              <tr>
                <th>{IntlMessages("page.checks.table.account")}</th>
                <th>{IntlMessages("page.checks.input.description")}</th>
                <th className='d-sm-none-table-cell'>{IntlMessages("page.checks.input.debito")}</th>
                <th className='d-sm-none-table-cell'>{IntlMessages("page.checks.input.credito")}</th>
                <th>{IntlMessages("table.column.options")}</th>
              </tr>
            </thead>
            <tbody>
              {(lines || []).map((line, index) => (
                <tr key={index}>
                  <td>{line.accountName || line.idCtaCont}</td>
                  <td>{line.description}</td>
                  <td className='d-sm-none-table-cell'>{validFloat(line.valueDebit).toFixed(2)}</td>
                  <td className='d-sm-none-table-cell'>{validFloat(line.valueCredit).toFixed(2)}</td>
                  <td>
                    <Button color="warning" size="sm" className="me-1" onClick={() => fnEditLine(index)}>
                      <i className="bi bi-pencil" />
                    </Button>
                    <Button color="danger" size="sm" onClick={() => fnRemoveLine(index)}>
                      <i className="bi bi-trash" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Colxx>
      </Row>
    </>
  )
}
