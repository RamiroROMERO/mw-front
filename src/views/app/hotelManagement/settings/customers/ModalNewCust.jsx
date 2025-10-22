import { IntlMessages } from '@/helpers/Utils';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { useModalNewCust } from './useModalNewCust';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { RadioGroup } from '@/components/radioGroup';
import { Checkbox } from '@/components/checkbox';

const ModalNewCust = ({data, setOpen}) => {
  const { listCountries, listCompanies, listGenders, listTypeTax, currentItem, setLoading, setListMunicipalities, fnGetData} = data;

  const {formState, formValidation, sendForm, onInputChange, fnSave} = useModalNewCust({setLoading, currentItem,fnGetData, setOpen, setListMunicipalities});

  const {typeId, dni, name, name2, phone1, phone2, email, address, genderId, taxType, companyId, zipCode, countryId, city1, city2, contact1Name, contact1Phone, contact1Email, contact2Name, contact2Phone, contact2Email, haveCredit, notes, status} = formState;

  const {dniValid, nameValid, phone1Valid} = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} lg={6}>
            <ContainerWithLabel label="page.customers.modal.modalNew.title.generalData">
              <Row>
                <Colxx xxs={12}>
                  <InputField
                    name='dni'
                    label='input.rtn'
                    value={dni}
                    onChange={onInputChange}
                    invalid={sendForm && !!dniValid}
                    feedbackText={sendForm && (dniValid || null)}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    name='name'
                    label='input.name'
                    value={name}
                    onChange={onInputChange}
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    name='name2'
                    label='input.companyName'
                    value={name2}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6}>
                  <SearchSelect
                    label="select.genderId"
                    name="genderId"
                    inputValue={genderId}
                    onChange={onInputChange}
                    options={listGenders}
                  />
                </Colxx>
                <Colxx xxs={12} md={6}>
                  <SearchSelect
                    label="select.companyId"
                    name="companyId"
                    inputValue={companyId}
                    onChange={onInputChange}
                    options={listCompanies}
                  />
                </Colxx>
                <Colxx xxs={12} md={6}>
                  <InputField
                    name='phone1'
                    label='input.phone'
                    value={phone1}
                    onChange={onInputChange}
                    invalid={sendForm && !!phone1Valid}
                    feedbackText={sendForm && (phone1Valid || null)}
                  />
                </Colxx>
                <Colxx xxs={12} md={6}>
                  <InputField
                    name='phone2'
                    label='input.phone2'
                    value={phone2}
                    onChange={onInputChange}
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
                <Colxx xxs={12} md={6}>
                  <RadioGroup
                    label="select.type"
                    name="typeId"
                    value={typeId}
                    onChange={onInputChange}
                    options={
                      [
                        { id: 1, label: "radio.company" },
                        { id: 2, label: "radio.naturalPerson" }
                      ]
                    }
                  />
                </Colxx>
                <Colxx xxs={12}>
                  <InputField
                    value={notes}
                    name="notes"
                    onChange={onInputChange}
                    type="textarea"
                    label="input.notes"
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs={12} lg={6}>
            <Row>
              <Colxx xxs={12} md={6}>
                <SearchSelect
                  label="select.taxId"
                  name="taxType"
                  inputValue={taxType}
                  onChange={onInputChange}
                  options={listTypeTax}
                />
              </Colxx>
              <Colxx xxs={12} md={6}>
                <Checkbox
                  onChange={onInputChange}
                  name="haveCredit"
                  value={haveCredit}
                  label="check.haveCredit"
                />
              </Colxx>
              <Colxx xxs={12} md={12} style={{textAlign: 'right'}}>
                <Checkbox
                  onChange={onInputChange}
                  name="status"
                  value={status}
                  label="check.active"
                />
              </Colxx>
            </Row>
            <Row>
              <Colxx xxs={12}>
                <ContainerWithLabel label="page.customers.modal.modalNew.input.address">
                  <Row>
                    <Colxx xxs={12}>
                      <SearchSelect
                        label="select.country"
                        name="countryId"
                        inputValue={countryId}
                        onChange={onInputChange}
                        options={listCountries}
                      />
                    </Colxx>
                    <Colxx xxs={12}>
                      <ContainerWithLabel label="page.customers.modal.modalNew.city">
                        <Row>
                          <Colxx xxs={12}>
                            <InputField
                              name='city1'
                              label=''
                              value={city1}
                              onChange={onInputChange}
                            />
                          </Colxx>
                          <Colxx xxs={12}>
                            <InputField
                              name='city2'
                              label=''
                              value={city2}
                              onChange={onInputChange}
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx xxs={12}>
                      <InputField
                        value={address}
                        name="address"
                        onChange={onInputChange}
                        type="textarea"
                        label="label.title.exactAddress"
                      />
                    </Colxx>
                    <Colxx xxs={12} md={6} lg={6}>
                      <InputField
                        name='zipCode'
                        label='input.zipCode'
                        value={zipCode}
                        onChange={onInputChange}
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs={12} lg={12}>
            <ContainerWithLabel label="page.customers.modal.modalNew.input.contact1Info">
              <Row>
                <Colxx xxs={12} md={6} lg={4}>
                  <InputField
                    name='contact1Name'
                    label='input.name'
                    value={contact1Name}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6} lg={4}>
                  <InputField
                    name='contact1Phone'
                    label='input.phone'
                    value={contact1Phone}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6} lg={4}>
                  <InputField
                    name='contact1Email'
                    label='input.email'
                    value={contact1Email}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6} lg={4}>
                  <InputField
                    name='contact2Name'
                    label='input.name'
                    value={contact2Name}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6} lg={4}>
                  <InputField
                    name='contact2Phone'
                    label='input.phone'
                    value={contact2Phone}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={12} md={6} lg={4}>
                  <InputField
                    name='contact2Email'
                    label='input.email'
                    value={contact2Email}
                    onChange={onInputChange}
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