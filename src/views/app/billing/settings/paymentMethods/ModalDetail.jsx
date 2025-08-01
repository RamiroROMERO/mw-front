import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { useModalDetail } from './useModalDetail';
import Confirmation from '@Containers/ui/confirmationMsg';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';

export const ModalDetail = (props) => {
  const { data, setOpen } = props;
  const { selectedItem, setLoading } = data;

  const { formState, onInputChange, sendForm, contCtasList, customerList, table, fnSaveDetail, fnNewDetail, formValidation, propsToMsgDeleteDetail } = useModalDetail({ setLoading, selectedItem })

  const { description, idCtaCont, percentComiss, idCtaComiss, isReceivable, customerId, status } = formState;
  const { descriptionValid, idCtaContValid } = formValidation;


  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <h5> {selectedItem.name}</h5>
            <hr/>
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
                  invalid={sendForm && !!descriptionValid}
                  feedbackText={sendForm && (descriptionValid || null)}
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12}>
                <SearchSelect
                  label='page.paymentMethods.detail.select.idCtaCont'
                  name="idCtaCont"
                  inputValue={idCtaCont}
                  onChange={onInputChange}
                  options={contCtasList}
                  invalid={sendForm && !!idCtaContValid}
                  feedbackText={sendForm && (idCtaContValid || null)}
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
                />
              </Colxx>
              <Colxx xxs={12} sm={8}>
                <SearchSelect
                  label='page.paymentMethods.detail.select.idCtaCommiss'
                  name="idCtaComiss"
                  inputValue={idCtaComiss}
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
                <Button className='btn btn-info mr-2' onClick={fnNewDetail}><i className="bi bi-stars" /> {IntlMessages("button.new")} </Button>
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
