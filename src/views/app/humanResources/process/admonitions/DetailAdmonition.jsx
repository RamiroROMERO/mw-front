import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { SimpleSelect } from '@Components/simpleSelect'
import { validInt } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import { Checkbox } from '@Components/checkbox'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import DateCalendar from '@Components/dateCalendar'
import UploadFile from '@Components/uploadFile'
import DateTimeCalendar from '@Components/dateTimeCalendar'

const DetailAdmonition = ({documentTypeId,employeeId,offenseDate,offenseTypeId,admonitionTypeId,description,notes,reportManagerId,
  offenseId,appointmentDate,witnessId,abandonmentDate1,abandonmentDate2,abandonmentDate3, status,listEmployees,listManagers,listOffenses,
  filePath,setFilePath,filterFaults,setFilterFaults,setBulkForm,onInputChange,showDocto1, setShowDocto1,showDocto2, setShowDocto2,
  showDocto3, setShowDocto3,showOffense, setShowOffense,showReportM, setShowReportM, formValidation, sendForm}) => {

  const {employeeIdValid, documentTypeIdValid, offenseDateValid} = formValidation;

  const onTypeDocumentChange = e =>{
    const typeDocto = e.target.value;
    if(validInt(typeDocto)===1){
      setShowDocto1("block");
      setShowDocto2("block");
      setShowDocto3("none");
      setShowOffense("block");
      setShowReportM("none");
    }else if(validInt(typeDocto)===2){
      setShowDocto1("none");
      setShowDocto2("block");
      setShowDocto3("none");
      setShowOffense("block");
      setShowReportM("block");
    }else if(validInt(typeDocto)===3){
      setShowDocto1("none");
      setShowDocto2("none");
      setShowDocto3("block");
      setShowOffense("none");
      setShowReportM("block");
    }else{
      setShowDocto1("none");
      setShowDocto2("none");
      setShowDocto3("none");
      setShowOffense("none");
      setShowReportM("none");
    }
    setBulkForm({documentTypeId:e.target.value});
  }

  const onOffenseChange = e =>{
    const offenseType = e.target.value;
    const filterOffenses = listOffenses.filter((item)=>{
      return item.faulClassificationId === validInt(offenseType)
    });
    setFilterFaults(filterOffenses);
    setBulkForm({offenseTypeId:offenseType});
  }

  return (
    <>
    <Row>
      <Colxx xxs="12" sm="12" lg="5" xl="4">
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
      <Colxx xxs="12" sm="6" lg="4" xl="3">
        <SimpleSelect
          name="documentTypeId"
          value={documentTypeId}
          label="page.admonition.select.typeDocument"
          onChange={onTypeDocumentChange}
          options={[
            {id:1, name:"Amonestación"},
            {id:2, name:"Citación"},
            {id:3, name:"Acta de Abandono"},
            {id:4, name:"Despido en Periodo de Prueba"}
          ]}
          invalid={sendForm && !!documentTypeIdValid}
          feedbackText={sendForm && (documentTypeIdValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="3" xl="2">
        <DateCalendar
          name="offenseDate"
          value={offenseDate}
          label='page.admonition.select.offenseDate'
          onChange={onInputChange}
          invalid={sendForm && !!offenseDateValid}
          feedbackText={sendForm && (offenseDateValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="4" xl="3" style={{display:showReportM}}>
        <SearchSelect
          label='page.admonition.select.reportManager'
          name='reportManagerId'
          inputValue={reportManagerId}
          options={listManagers}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="4" xl="3" style={{display:showDocto3}}>
        <SearchSelect
          label='page.admonition.select.witness'
          name='witnessId'
          inputValue={witnessId}
          options={listEmployees}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="3" xl="3" style={{display:showOffense}}>
        <SimpleSelect
          name="offenseTypeId"
          value={offenseTypeId}
          label="page.admonition.select.typeOffense"
          onChange={onOffenseChange}
          options={[
            {id:1, name:"Leve"},
            {id:2, name:"Menos Grave"},
            {id:3, name:"Grave"}
          ]}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="5" xl="6" style={{display:showDocto2}}>
        <SearchSelect
          label='page.admonition.select.offense'
          name='offenseId'
          inputValue={offenseId}
          options={filterFaults}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" md="6" lg="4" xl="3" style={{display:showDocto1}}>
        <SimpleSelect
          name="admonitionTypeId"
          value={admonitionTypeId}
          label="page.admonition.select.typeAdmonition"
          onChange={onInputChange}
          options={[
            {id:1, name:"Suspensión"},
            {id:2, name:"Despido"},
            {id:3, name:"Audiencia de Descargo"}
          ]}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="4" xl="3" style={{display:showReportM}}>
        <DateTimeCalendar
          name="appointmentDate"
          value={appointmentDate}
          label='page.admonition.select.date'
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="3" style={{display:showDocto3}}>
        <DateCalendar
          name="abandonmentDate1"
          value={abandonmentDate1}
          label='page.admonition.select.abandonmentDate1'
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="3" style={{display:showDocto3}}>
        <DateCalendar
          name="abandonmentDate2"
          value={abandonmentDate2}
          label='page.admonition.select.abandonmentDate2'
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="3" style={{display:showDocto3}}>
        <DateCalendar
          name="abandonmentDate3"
          value={abandonmentDate3}
          label='page.admonition.select.abandonmentDate3'
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="2" xl="2">
        <Checkbox
          label="check.status"
          name="status"
          value={status}
          onChange={onInputChange}
        />
      </Colxx>
    </Row>
    <Row>
      <Colxx xxs="12" md="8" style={{display:showDocto1}}>
        <Row>
          <Colxx xxs="12">
            <InputField
              name="description"
              label='input.description'
              value={description}
              onChange={onInputChange}
              type="textarea"
              style={{resize:'none'}}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name="notes"
              label='input.observations'
              value={notes}
              onChange={onInputChange}
              type="textarea"
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" md="4" style={{display:showDocto1}}>
        <UploadFile
          filePath={filePath}
          setFilePath={setFilePath}
        />
      </Colxx>
    </Row>
    </>
  )
}

export default DetailAdmonition