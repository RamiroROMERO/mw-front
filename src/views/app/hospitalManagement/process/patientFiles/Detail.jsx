import React from 'react'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { InputField } from '@/components/inputFields';
import { SimpleSelect } from '@/components/simpleSelect';
import DateCalendar from '@/components/dateCalendar';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import ReactTable from "@/components/reactTable";

const Detail = ({formState, onInputChange, onStateChange, formValidation, sendForm, listNationalities, listGenders, listCivilStatus, listStates, listCities, tableEvents}) => {

  const {dateIn, dni, code, firstName, secondName, lastName, secondLastName, birthDay, natinalityId, genderId, civilStatusId, phone, phone2, email, address, contactName1, contactPhone1, contactName2, contactPhone2, estateCode, cityCode, status} = formState;

  const {dateInValid, dniValid, firstNameValid, lastNameValid, birthDayValid} = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs={12} md={6} lg={7}>
          <ContainerWithLabel label="label.title.generalData">
            <Row>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="dni"
                  label="input.dni"
                  onChange={onInputChange}
                  value={dni}
                  invalid={sendForm && !!dniValid}
                  feedbackText={sendForm && (dniValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <DateCalendar
                  name="dateIn"
                  value={dateIn}
                  label='input.dateIn'
                  onChange={onInputChange}
                  invalid={sendForm && !!dateInValid}
                  feedbackText={sendForm && (dateInValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="code"
                  label="input.codePhysic"
                  onChange={onInputChange}
                  value={code}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="firstName"
                  label="input.firstName"
                  onChange={onInputChange}
                  value={firstName}
                  invalid={sendForm && !!firstNameValid}
                  feedbackText={sendForm && (firstNameValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="secondName"
                  label="input.secondName"
                  onChange={onInputChange}
                  value={secondName}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="lastName"
                  label="input.lastName"
                  onChange={onInputChange}
                  value={lastName}
                  invalid={sendForm && !!lastNameValid}
                  feedbackText={sendForm && (lastNameValid || null)}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="secondLastName"
                  label="input.secondLastName"
                  onChange={onInputChange}
                  value={secondLastName}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <DateCalendar
                  name="birthDay"
                  value={birthDay}
                  label='input.birthDay'
                  onChange={onInputChange}
                  invalid={sendForm && !!birthDayValid}
                  feedbackText={sendForm && (birthDayValid || null)}
                />
              </Colxx>
              <Colxx xss={12} xs={6} md={12} lg={6} xl={4}>
                <SimpleSelect
                  name="natinalityId"
                  value={natinalityId}
                  onChange={onInputChange}
                  options={listNationalities}
                  label="select.nationalityId"
                />
              </Colxx>
              <Colxx xss={12} xs={6} md={12} lg={6} xl={4}>
                <SimpleSelect
                  name="genderId"
                  value={genderId}
                  onChange={onInputChange}
                  options={listGenders}
                  label="select.genderId"
                />
              </Colxx>
              <Colxx xss={12} xs={6} md={12} lg={6} xl={4}>
                <SimpleSelect
                  name="civilStatusId"
                  value={civilStatusId}
                  onChange={onInputChange}
                  options={listCivilStatus}
                  label="select.civilStatusId"
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="phone"
                  label="input.telephone"
                  onChange={onInputChange}
                  value={phone}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={4}>
                <InputField
                  name="phone2"
                  label="input.cellphone"
                  onChange={onInputChange}
                  value={phone2}
                />
              </Colxx>
              <Colxx xxs={12} xs={6} md={12} lg={6} xl={8}>
                <InputField
                  name="email"
                  label="input.email"
                  onChange={onInputChange}
                  value={email}
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs={12} md={6} lg={5}>
          <Row>
            <Colxx xxs={12}>
              <ContainerWithLabel label="label.title.address">
                <Row>
                  <Colxx xss={12} sm={6} md={12}>
                    <SearchSelect
                      name="estateCode"
                      inputValue={estateCode}
                      onChange={onStateChange}
                      options={listStates}
                      label="select.estateCode"
                    />
                  </Colxx>
                  <Colxx xss={12} sm={6} md={12}>
                    <SearchSelect
                      name="cityCode"
                      inputValue={cityCode}
                      onChange={onInputChange}
                      options={listCities}
                      label="select.cityCode"
                    />
                  </Colxx>
                  <Colxx xxs={12}>
                    <InputField
                      name="address"
                      label="input.exactAddress"
                      onChange={onInputChange}
                      value={address}
                      type="textarea"
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
            <Colxx xxs={12}>
              <ContainerWithLabel label="label.title.emergencyContacts">
                <Row>
                  <Colxx xss={12} sm={7} md={12} xl={8}>
                    <InputField
                      name="contactName1"
                      value={contactName1}
                      onChange={onInputChange}
                      label="input.contactName1"
                    />
                  </Colxx>
                  <Colxx xss={12} sm={5} md={12} xl={4}>
                    <InputField
                      name="contactPhone1"
                      value={contactPhone1}
                      onChange={onInputChange}
                      label="input.contactPhone1"
                    />
                  </Colxx>
                  <Colxx xss={12} sm={7} md={12} xl={8}>
                    <InputField
                      name="contactName2"
                      value={contactName2}
                      onChange={onInputChange}
                      label="input.contactName2"
                    />
                  </Colxx>
                  <Colxx xss={12} sm={5} md={12} xl={4}>
                    <InputField
                      name="contactPhone2"
                      value={contactPhone2}
                      onChange={onInputChange}
                      label="input.contactPhone2"
                    />
                  </Colxx>
                </Row>
              </ContainerWithLabel>
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Row>
        <Colxx xss={12}>
          <ReactTable {...tableEvents} />
        </Colxx>
      </Row>
    </>
  )
}

export default Detail