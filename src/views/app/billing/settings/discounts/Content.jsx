import { Card, CardBody, Row, Button } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useTableConfig } from '@Hooks';
import useDiscounts from './useDiscounts';

const Discounts = (props) => {
  const { setLoading } = props;

  const { formState, formValidation, sendForm, onInputChange, listLedgerAccount, fnSave, propsToMsgDelete, tableData, fnClearInputs, fnEditItem, fnDeleteItem } = useDiscounts({ setLoading });

  const { id, name, percentValue, idCtaAccount, status } = formState;
  const { nameValid, percentValueValid, idCtaAccountValid } = formValidation;
  const { tableInfo } = useTableConfig({
    title: IntlMessages("page.discounts.table.title"),
    columns: [
      { text: IntlMessages("page.discounts.table.description"), dataField: "description", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("page.discounts.table.amount"), dataField: "amount", headerStyle: { 'width': '30%' } },
    ],
    data: tableData,
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteItem
    }]
  });

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6" className="mb-3">
          <Card>
            <CardBody>
              <Row>
                <Colxx xxs="12" sm="8" lg="12">
                  <InputField
                    value={name}
                    name='name'
                    type='text'
                    onChange={onInputChange}
                    label="page.discounts.input.description"
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="4" lg="4">
                  <InputField
                    value={percentValue}
                    name='percentValue'
                    type='text'
                    label="page.discounts.input.amount"
                    onChange={onInputChange}
                    invalid={sendForm && !!percentValueValid}
                    feedbackText={sendForm && (percentValueValid || null)}
                  />
                </Colxx>
                <Colxx sm="12" lg="8">
                  <SearchSelect
                    label='page.discounts.select.account'
                    name='idCtaAccount'
                    inputValue={idCtaAccount}
                    options={listLedgerAccount}
                    onChange={onInputChange}
                    invalid={sendForm && !!idCtaAccountValid}
                    feedbackText={sendForm && (idCtaAccountValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx sm={12}>
                  <Checkbox
                    label="page.cashBoxes.check.active"
                    name="status"
                    value={status}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
              <hr />
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                  <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...tableInfo}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default Discounts;