import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { useModalDetail } from './useModalDetail';
import Confirmation from '@Containers/ui/confirmationMsg';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';
import { MAX_DESCRIPTION } from './paymentMethodRules';

// Cuentas de una forma de pago. Obligatorios: descripción y cuenta contable; la comisión (con su porcentaje) y el cliente de "Genera CxC" se validan con las reglas del back.
// `feedbackText` recibe la CLAVE de traducción (el componente la traduce).
export const ModalDetail = (props) => {
  const { data } = props;
  const { selectedItem, selectedName, setLoading } = data;

  const { formState, onInputChange, sendForm, contCtasList, customerList, table, fnSaveDetail, fnNewDetail, errors, propsToMsgDeleteDetail } = useModalDetail({ setLoading, selectedItem })

  const { description, paymentCtaCode, percentComiss, commissionCtaCode, isReceivable, customerId, status } = formState;
  const show = (key) => (sendForm && errors[key]) || null;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <h5>{selectedName}</h5>
            <hr />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} md={6}>
            <Row>
              <Colxx xxs={12} xs={12}>
                <InputField
                  label='page.paymentMethods.detail.input.description'
                  name="description"
                  value={description}
                  onChange={onInputChange}
                  maxLength={MAX_DESCRIPTION}
                  invalid={!!show('description')}
                  feedbackText={show('description')}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12}>
                <SearchSelect
                  label='page.paymentMethods.detail.select.paymentCtaCode'
                  name="paymentCtaCode"
                  inputValue={paymentCtaCode}
                  onChange={onInputChange}
                  options={contCtasList}
                  invalid={!!show('paymentCtaCode')}
                  feedbackText={show('paymentCtaCode')}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12} sm={4}>
                <InputField
                  label='page.paymentMethods.detail.input.percentComiss'
                  name="percentComiss"
                  value={percentComiss}
                  onChange={onInputChange}
                  type='number'
                  invalid={!!show('percentComiss')}
                  feedbackText={show('percentComiss')}
                />
              </Colxx>
              <Colxx xxs={12} sm={8}>
                <SearchSelect
                  label='page.paymentMethods.detail.select.commissionCtaCode'
                  name="commissionCtaCode"
                  inputValue={commissionCtaCode}
                  onChange={onInputChange}
                  options={contCtasList}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12} sm={4}>
                <Checkbox
                  label='page.paymentMethods.detail.select.isReceivable'
                  name='isReceivable'
                  value={isReceivable}
                  onChange={onInputChange}
                />
              </Colxx>
              <Colxx xxs={12} sm={8}>
                <SearchSelect
                  label='page.paymentMethods.detail.select.customerId'
                  name="customerId"
                  inputValue={customerId}
                  onChange={onInputChange}
                  options={customerList}
                  invalid={!!show('customerId')}
                  feedbackText={show('customerId')}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12}>
                <Checkbox
                  label='checkbox.active'
                  name="status"
                  value={status}
                  onChange={onInputChange}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12}>
                <Button className='btn btn-info me-2' onClick={fnNewDetail}><i className="bi bi-stars" /> {IntlMessages("button.new")} </Button>
                <Button className='btn btn-info' onClick={fnSaveDetail}><i className="iconsminds-save" /> {IntlMessages("button.save")} </Button>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs={12} md={6}>
            <ReactTable {...table} />
          </Colxx>
        </Row>
        <hr />
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
      <Confirmation {...propsToMsgDeleteDetail} />
    </>
  )
}
