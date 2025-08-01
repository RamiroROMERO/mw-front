import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { SimpleSelect } from '@Components/simpleSelect'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import UploadFile from '@Components/uploadFile'

const DetailProofWork = ({employeeId, typeId, creationDate, contractEndDate, addressee, authorizedSignature, antiquity, salary,
  deductions, amount, description, filePath, setFilePath, status, listEmployees, listImmediateBoss, onInputChange, formValidation,
  sendForm}) => {

  const {employeeIdValid, typeIdValid, creationDateValid, authorizedSignatureValid} = formValidation;

  return (
    <>
    <Row>
      <Colxx xxs="12" lg="8" xl="9">
        <Row>
          <Colxx xxs="12" sm="9" xl="4">
            <SearchSelect
              label='select.employee'
              name='employeeId'
              inputValue={employeeId}
              options={listEmployees}
              onChange={onInputChange}
              invalid={sendForm && !!employeeIdValid}
              feedbackText={sendForm && (employeeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="3" xl="2" className="mb-3">
            <Checkbox
              label="check.status"
              name="status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" xl="3">
            <SimpleSelect
              name="typeId"
              label="select.type"
              value={typeId}
              onChange={onInputChange}
              options={[
                {id:1, name:"Con Destinatario"},
                {id:2, name:"Sin Destinatario"}
              ]}
              invalid={sendForm && !!typeIdValid}
              feedbackText={sendForm && (typeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" xl="3">
            <DateCalendar
              name="creationDate"
              value={creationDate}
              label='page.proofWork.select.creationDate'
              onChange={onInputChange}
              invalid={sendForm && !!creationDateValid}
              feedbackText={sendForm && (creationDateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" xl="3">
            <DateCalendar
              name="contractEndDate"
              value={contractEndDate}
              label='page.proofWork.select.contractEndDate'
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" xl="5">
            <InputField
              name="addressee"
              label='page.proofWork.input.addressee'
              value={addressee}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" sm="6" xl="4">
            <SearchSelect
              label='page.proofWork.select.authorizedSignature'
              name='authorizedSignature'
              inputValue={authorizedSignature}
              options={listImmediateBoss}
              onChange={onInputChange}
              invalid={sendForm && !!authorizedSignatureValid}
              feedbackText={sendForm && (authorizedSignatureValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="3" xl="3">
            <SimpleSelect
              name="antiquity"
              label="page.proofWork.select.antiquity"
              value={antiquity}
              onChange={onInputChange}
              options={[
                {id:1, name:"Si"},
                {id:2, name:"No"}
              ]}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="3" xl="3">
            <SimpleSelect
              name="salary"
              label="page.proofWork.select.salary"
              value={salary}
              onChange={onInputChange}
              options={[
                {id:1, name:"Si"},
                {id:2, name:"No"}
              ]}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="3" xl="3">
            <SimpleSelect
              name="deductions"
              label="page.proofWork.select.deductions"
              value={deductions}
              onChange={onInputChange}
              options={[
                {id:1, name:"Si"},
                {id:2, name:"No"}
              ]}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="3" xl="3">
            <InputField
              name="amount"
              label='page.proofWork.input.amount'
              value={amount}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs="12" xs="12" sm="6" xl="12">
            <InputField
              name="description"
              label='input.description'
              value={description}
              onChange={onInputChange}
              type="textarea"
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" lg="4" xl="3">
        <UploadFile
          filePath={filePath}
          setFilePath={setFilePath}
        />
      </Colxx>
    </Row>
    </>
  )
}

export default DetailProofWork