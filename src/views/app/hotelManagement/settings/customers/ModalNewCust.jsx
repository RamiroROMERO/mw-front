import { IntlMessages } from '@/helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { useModalNewCust } from './useModalNewCust';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { SimpleSelect } from '@/components/simpleSelect';
import SearchSelect from '@/components/SearchSelect/SearchSelect';

const ModalNewCust = ({data, setOpen}) => {
  const {listDepartments, listMunicipalities, currentItem, setLoading, setListMunicipalities, fnGetData} = data;

  const {formState, formValidation, sendForm, onInputChange, onDeptoChange, fnSave} = useModalNewCust({setLoading, currentItem,fnGetData, setOpen, setListMunicipalities});

  const {rtn, nomcli, tel, email, deptoCode, municCode, direcc} = formState;

  const {rtnValid, nomcliValid, telValid, deptoCodeValid} = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} md={6}>
            <InputField
              name='rtn'
              label='input.rtn'
              value={rtn}
              onChange={onInputChange}
              invalid={sendForm && !!rtnValid}
              feedbackText={sendForm && (rtnValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              name='nomcli'
              label='input.name'
              value={nomcli}
              onChange={onInputChange}
              invalid={sendForm && !!nomcliValid}
              feedbackText={sendForm && (nomcliValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              name='tel'
              label='input.phone'
              value={tel}
              onChange={onInputChange}
              invalid={sendForm && !!telValid}
              feedbackText={sendForm && (telValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              name='email'
              label='input.email'
              value={email}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12}>
            <ContainerWithLabel label="page.customers.modal.modalNew.input.address">
              <Row>
                <Colxx xxs={12} lg={6}>
                  <SearchSelect
                    label="select.department"
                    name="deptoCode"
                    inputValue={deptoCode}
                    onChange={onDeptoChange}
                    options={listDepartments}
                    invalid={sendForm && !!deptoCodeValid}
                    feedbackText={sendForm && (deptoCodeValid || null)}
                  />
                </Colxx>
                <Colxx xxs={12} lg={6}>
                  <SearchSelect
                    label="select.municipality"
                    name="municCode"
                    inputValue={municCode}
                    onChange={onInputChange}
                    options={listMunicipalities}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs={12}>
                  <InputField
                    value={direcc}
                    name="direcc"
                    onChange={onInputChange}
                    type="textarea"
                    label="label.title.exactAddress"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>
          {` ${IntlMessages('button.exit')}`}
        </Button>
        <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
      </ModalFooter>
    </>
  )
}

export default ModalNewCust