import React from 'react'
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { useDetail } from './useDetail'

const Detail = ({currentItem, fnGetData, setLoading, setCurrentItem, listSpecialties}) => {

  const {formState, onInputChange, formValidation, sendForm, fnSaveDocument, IntlMessages, fnClear} = useDetail({currentItem, fnGetData, setLoading, setCurrentItem});

  const {specialtyId, dni, name, licenceNumber, phone, email, address, attendMonday, attendMondayHour, attendTuesday, attendTuesdayHour, attendWednesday, attendWednesdayHour, attendThursday, attendThursdayHour, attendFriday, attendFridayHour, attendSaturday, attendSaturdayHour, attendSunday, attendSundayHour, hospitalPercent, specialistPercent, status} = formState;

  const {specialtyIdValid, dniValid, nameValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xss={12} xs={6} lg={12}>
            <SearchSelect
              name="specialtyId"
              inputValue={specialtyId}
              onChange={onInputChange}
              options={listSpecialties}
              label="input.specialty"
              invalid={sendForm && !!specialtyIdValid}
              feedbackText={sendForm && (specialtyIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} xs={6} lg={12}>
            <InputField
              name="dni"
              label="input.dni"
              onChange={onInputChange}
              value={dni}
              invalid={sendForm && !!dniValid}
              feedbackText={sendForm && (dniValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} xs={6} lg={12}>
            <InputField
              name="name"
              label="input.name"
              onChange={onInputChange}
              value={name}
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} xs={6} lg={12} xl={6}>
            <InputField
              name="licenceNumber"
              label="input.licenceNumber"
              onChange={onInputChange}
              value={licenceNumber}
            />
          </Colxx>
          <Colxx xxs={12} xs={6} lg={12} xl={6}>
            <InputField
              name="phone"
              label="input.phone"
              onChange={onInputChange}
              value={phone}
            />
          </Colxx>
          <Colxx xxs={12} xs={6} lg={12} xl={6}>
            <InputField
              name="email"
              label="input.email"
              onChange={onInputChange}
              value={email}
            />
          </Colxx>
          <Colxx xxs={12}>
            <InputField
              name="address"
              label="input.address"
              onChange={onInputChange}
              value={address}
              type="textarea"
            />
          </Colxx>
          <Colxx xxs={12} align="right">
            <Checkbox
              name="status"
              label="check.status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xss={12} md={6} lg={12} xxl={8}>
            <ContainerWithLabel label="label.title.daysCare">
              <Row>
                <Colxx xxs={5} sm={3} md={5}>
                  <Checkbox
                    name="attendMonday"
                    label="check.attendMonday"
                    value={attendMonday}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={7} sm={3} md={7}>
                  <InputField
                    name="attendMondayHour"
                    onChange={onInputChange}
                    value={attendMondayHour}
                  />
                </Colxx>
                <Colxx xxs={5} sm={3} md={5}>
                  <Checkbox
                    name="attendTuesday"
                    label="check.attendTuesday"
                    value={attendTuesday}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={7} sm={3} md={7}>
                  <InputField
                    name="attendTuesdayHour"
                    onChange={onInputChange}
                    value={attendTuesdayHour}
                  />
                </Colxx>
                <Colxx xxs={5} sm={3} md={5}>
                  <Checkbox
                    name="attendWednesday"
                    label="check.attendWednesday"
                    value={attendWednesday}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={7} sm={3} md={7}>
                  <InputField
                    name="attendWednesdayHour"
                    onChange={onInputChange}
                    value={attendWednesdayHour}
                  />
                </Colxx>
                <Colxx xxs={5} sm={3} md={5}>
                  <Checkbox
                    name="attendThursday"
                    label="check.attendThursday"
                    value={attendThursday}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={7} sm={3} md={7}>
                  <InputField
                    name="attendThursdayHour"
                    onChange={onInputChange}
                    value={attendThursdayHour}
                  />
                </Colxx>
                <Colxx xxs={5} sm={3} md={5}>
                  <Checkbox
                    name="attendFriday"
                    label="check.attendFriday"
                    value={attendFriday}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={7} sm={3} md={7}>
                  <InputField
                    name="attendFridayHour"
                    onChange={onInputChange}
                    value={attendFridayHour}
                  />
                </Colxx>
                <Colxx xxs={5} sm={3} md={5}>
                  <Checkbox
                    name="attendSaturday"
                    label="check.attendSaturday"
                    value={attendSaturday}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={7} sm={3} md={7}>
                  <InputField
                    name="attendSaturdayHour"
                    onChange={onInputChange}
                    value={attendSaturdayHour}
                  />
                </Colxx>
                <Colxx xxs={5} sm={3} md={5}>
                  <Checkbox
                    name="attendSunday"
                    label="check.attendSunday"
                    value={attendSunday}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs={7} sm={3} md={7}>
                  <InputField
                    name="attendSundayHour"
                    onChange={onInputChange}
                    value={attendSundayHour}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xss={12} md={6} lg={12} xxl={4}>
            <ContainerWithLabel label="label.title.negotiation">
              <Row>
                <Colxx xxs={12} xs={6} md={12}>
                  <InputField
                    name="hospitalPercent"
                    label="input.hospitalPercent"
                    onChange={onInputChange}
                    value={hospitalPercent}
                  />
                </Colxx>
                <Colxx xxs={12} xs={6} md={12}>
                  <InputField
                    name="specialistPercent"
                    label="input.specialistPercent"
                    onChange={onInputChange}
                    value={specialistPercent}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <hr/>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button
              color="secondary" onClick={fnClear}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSaveDocument}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail