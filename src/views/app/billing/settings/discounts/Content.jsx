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
import { MAX_NAME } from './discountRules';

// Formulario de Descuentos (fac_desc.sc2). Obligatorios con `*` (nombre y porcentaje; la cuenta solo con Contabilidad activa). `feedbackText` recibe la CLAVE de traducción
// (el componente la traduce).
const Discounts = (props) => {
  const { setLoading } = props;

  const { formState, errors, sendForm, onInputChange, listLedgerAccount, fnSave, propsToMsgDelete, tableData, fnClearInputs, fnEditItem, fnDeleteItem } = useDiscounts({ setLoading });

  const { name, percentValue, discountCtaCode, status } = formState;
  const show = (key) => (sendForm && errors[key]) || null;
  const { tableInfo } = useTableConfig({
    title: IntlMessages("page.discounts.table.title"),
    columns: [
      { text: IntlMessages("page.discounts.table.description"), dataField: "description", headerStyle: { 'width': '45%' } },
      { text: IntlMessages("page.discounts.table.amount"), dataField: "amount", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '15%' } },
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
                    maxLength={MAX_NAME}
                    invalid={!!show('name')}
                    feedbackText={show('name')}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" sm="4" lg="4">
                  <InputField
                    value={percentValue}
                    name='percentValue'
                    type='text'
                    label="page.discounts.input.amount"
                    onChange={onInputChange}
                    maxLength={6}
                    invalid={!!show('percentValue')}
                    feedbackText={show('percentValue')}
                  />
                </Colxx>
                <Colxx sm="12" lg="8">
                  <SearchSelect
                    label='page.discounts.select.account'
                    name='discountCtaCode'
                    inputValue={discountCtaCode}
                    options={listLedgerAccount}
                    onChange={onInputChange}
                    invalid={!!show('discountCtaCode')}
                    feedbackText={show('discountCtaCode')}
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
