/* eslint-disable react/prop-types */
import React from 'react'
import { Button, Row } from 'reactstrap'
import { Checkbox } from '@Components/checkbox';
import { Colxx } from '@Components/common/CustomBootstrap'
import { SimpleSelect } from '@Components/simpleSelect';
import { InputField } from '@Components/inputFields';
import { request } from '@Helpers/core';
import DateCalendar from '@Components/dateCalendar';
import { PATH_FILES } from '/src/helpers/pathFiles';
import ProfileImage from '@Components/profileImage/ProfileImage';

const FormEmployee = ({ codeEmployee, nationalityId, dni, firstName, secondName, lastName, secondLastName, birthday, genderId, status,
  areaManager, onInputChange, setBulkForm, formValidation, sendForm, imgEmployee, fnGetImgEmployee }) => {
  const hiddenFileInput = React.useRef(null);

  const { nationalityIdValid, dniValid, firstNameValid, lastNameValid, birthdayValid, genderIdValid } = formValidation;

  const onClickImage = e => {
    hiddenFileInput.current.click();
  }

  const fnUploadFiles = event => {
    const fileUploaded = event.target.files[0];
    const datafile = [{
      file: fileUploaded,
      name: fileUploaded.name
    }]
    request.uploadFiles(PATH_FILES.POST.PROFILES, datafile, resp => {
      const nameFile = resp.data[0].name;
      fnGetImgEmployee(nameFile);
      setBulkForm({ pathImage: nameFile })
    }, err => { console.log(err) });
  };

  return (
    <Row>
      <Colxx xxs="12" xs="5" md="4" lg="8" xl="7" className="mb-4">
        <ProfileImage initialImage={imgEmployee} onUploadFiles={fnUploadFiles} />
      </Colxx>
      <Colxx xxs="12" xs="7" md="8" lg="12" className="mb-2">
        <Row>
          <Colxx xxs="12">
            <InputField
              name='codeEmployee'
              label='input.code'
              value={codeEmployee}
              type='text'
              disabled
            />
          </Colxx>
          <Colxx xxs="12">
            <SimpleSelect
              name="nationalityId"
              value={nationalityId}
              label='page.employees.select.nationality'
              onChange={onInputChange}
              options={[
                { id: 1, name: 'Hondureña' },
                { id: 2, name: 'Extranjera' }
              ]}
              invalid={sendForm && !!nationalityIdValid}
              feedbackText={sendForm && (nationalityIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="dni"
              label='page.employees.input.dni'
              value={dni}
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!dniValid}
              feedbackText={sendForm && (dniValid || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="firstName"
              label='page.employees.input.firstName'
              value={firstName}
              onChange={onInputChange}
              type="text"
              invalid={sendForm && !!firstNameValid}
              feedbackText={sendForm && (firstNameValid || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="secondName"
              label='page.employees.input.secondName'
              value={secondName}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" xs="6" lg="12">
        <InputField
          name="lastName"
          label='page.employees.input.lastName'
          value={lastName}
          onChange={onInputChange}
          type="text"
          invalid={sendForm && !!lastNameValid}
          feedbackText={sendForm && (lastNameValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" lg="12">
        <InputField
          name="secondLastName"
          label='page.employees.input.secondLastName'
          value={secondLastName}
          onChange={onInputChange}
          type="text"
        />
      </Colxx>
      <Colxx xxs="12" xs="6" lg="12">
        <DateCalendar
          name="birthday"
          value={birthday}
          label='page.employees.select.birthday'
          onChange={onInputChange}
          invalid={sendForm && !!birthdayValid}
          feedbackText={sendForm && (birthdayValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" lg="12">
        <SimpleSelect
          name="genderId"
          value={genderId}
          label='page.employees.select.gender'
          onChange={onInputChange}
          options={[
            { id: 1, name: 'Masculino' },
            { id: 2, name: 'Femenino' }
          ]}
          invalid={sendForm && !!genderIdValid}
          feedbackText={sendForm && (genderIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" xs="6">
        <Checkbox
          label="check.status"
          name="status"
          value={status}
          onChange={onInputChange}
          disabled
        />
      </Colxx>
      <Colxx xxs="12" xs="6">
        <Checkbox
          label="page.employees.check.areaManager"
          name="areaManager"
          value={areaManager}
          onChange={onInputChange}
        />
      </Colxx>
    </Row>
  )
}

export default FormEmployee