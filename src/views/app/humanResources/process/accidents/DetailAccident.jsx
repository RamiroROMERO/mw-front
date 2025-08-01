import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import { SimpleSelect } from '@Components/simpleSelect'
import { InputField } from '@Components/inputFields'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { Checkbox } from '@Components/checkbox'
import { validInt } from '@Helpers/Utils'
import { RadioGroup } from '@Components/radioGroup'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import UploadFile from '@Components/uploadFile'
import DateTimeCalendar from '@Components/dateTimeCalendar'

const DetailAccident = ({employeeId,typeId,date,dateAccident,site,stroke,fall,injury,other,otherObs,description,medicalAsistance,
  employeeStatus,startDisability,endDisability,coments,affectedHead,affectedFace,affectedBody,affectedHands,affectedArms,
  affectedBack,affectedLags,affectedFeet,affectedOtherParts,otherPartsObs,question1,question2,question3,question4,filePath,
  setFilePath,status,listEmployees,onInputChange,setBulkForm,showInputs, setShowInputs, formValidation, sendForm}) => {

  const {employeeIdValid, typeIdValid, dateValid, dateAccidentValid} = formValidation;

  const onTypeChange = e =>{
    const typeAccident = e.target.value;
    if(validInt(typeAccident)===2){
      setShowInputs("block");
    }else{
      setShowInputs("none");
    }
    setBulkForm({typeId:e.target.value});
  }

  return (
    <Row>
      <Colxx xxs="12" md="8" lg="9">
        <Row>
          <Colxx xxs="12" xs="6" sm="3" md="6" xl="2">
            <DateCalendar
              name="date"
              value={date}
              label='select.date'
              onChange={onInputChange}
              invalid={sendForm && !!dateValid}
              feedbackText={sendForm && (dateValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="3" md="6" xl="3">
            <SimpleSelect
              name="typeId"
              value={typeId}
              label="select.type"
              onChange={onTypeChange}
              options={[
                {id:1, name:"Accidente Común"},
                {id:2, name:"Accidente Laboral"}
              ]}
              invalid={sendForm && !!typeIdValid}
              feedbackText={sendForm && (typeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="12" sm="6" md="12" xl="7">
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
          <Colxx xxs="12" xs="12" sm="5" md="12" lg="5">
            <DateTimeCalendar
              name="dateAccident"
              value={dateAccident}
              label='select.dateAccident'
              onChange={onInputChange}
              invalid={sendForm && !!dateAccidentValid}
              feedbackText={sendForm && (dateAccidentValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="12" sm="7" md="12" lg="7">
            <InputField
              name='site'
              label='page.accidents.input.accidentSite'
              value={site}
              onChange={onInputChange}
              type='text'
            />
          </Colxx>
        </Row>
        <Row style={{display: showInputs}}>
          <Colxx xxs="12">
            <InputField
              name='question1'
              label='page.accidents.input.question1'
              value={question1}
              onChange={onInputChange}
              type='textarea'
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.accidents.label.nature">
              <Row>
                <Colxx xxs="12" xs="3" sm="3" lg="2">
                  <Checkbox
                    label="page.accidents.check.stroke"
                    name="stroke"
                    value={stroke}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="3" sm="3" lg="2">
                  <Checkbox
                    label="page.accidents.check.fall"
                    name="fall"
                    value={fall}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="3" sm="3" lg="2">
                  <Checkbox
                    label="page.accidents.check.injury"
                    name="injury"
                    value={injury}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="3" sm="3" lg="2">
                  <Checkbox
                    label="page.accidents.check.other"
                    name="other"
                    value={other}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" lg="4">
                  <InputField
                    name='otherObs'
                    label='input.specify'
                    value={otherObs}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row style={{display: showInputs}}>
          <Colxx xxs="12">
            <RadioGroup
              label='page.accidents.radio.question2'
              name='question2'
              value={question2}
              onChange={onInputChange}
              options={[
                {id:1, label:'option.yes'},
                {id:2, label:'option.no'},
              ]}
              display="flex"
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name='description'
              label='page.accidents.input.description'
              value={description}
              onChange={onInputChange}
              type='textarea'
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
        <Row style={{display: showInputs}}>
          <Colxx xxs="12">
            <RadioGroup
              label='page.accidents.radio.question3'
              name='question3'
              value={question3}
              onChange={onInputChange}
              options={[
                {id:1, label:'option.yes'},
                {id:2, label:'option.no'},
              ]}
              display="flex"
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              name='question4'
              label='page.accidents.input.question4'
              value={question4}
              onChange={onInputChange}
              type='textarea'
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name='medicalAsistance'
              label='page.accidents.input.medicalAssistance'
              value={medicalAsistance}
              onChange={onInputChange}
              type='text'
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <InputField
              name='employeeStatus'
              label='page.accidents.input.employeeStatus'
              value={employeeStatus}
              onChange={onInputChange}
              type='textarea'
              style={{resize:'none'}}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="startDisability"
              value={startDisability}
              label='page.accidents.select.startDisability'
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" xs="6">
            <DateCalendar
              name="endDisability"
              value={endDisability}
              label='page.accidents.select.endDisability'
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.accidents.label.observationsRRHH">
              <Row>
                <Colxx xxs="12">
                  <InputField
                    name='coments'
                    label='input.comments'
                    value={coments}
                    onChange={onInputChange}
                    type='textarea'
                    style={{resize:'none'}}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs="12" md="4" lg="3">
        <Row>
          <Colxx xxs="12" sm="4" md="12" lg="12" className="mb-3">
            <UploadFile
              filePath={filePath}
              setFilePath={setFilePath}
            />
          </Colxx>
          <Colxx xxs="12" sm="8" md="12" lg="12">
            <ContainerWithLabel label="page.accidents.label.affectedParty">
              <Row>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.head"
                    name="affectedHead"
                    value={affectedHead}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.face"
                    name="affectedFace"
                    value={affectedFace}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.body"
                    name="affectedBody"
                    value={affectedBody}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.hands"
                    name="affectedHands"
                    value={affectedHands}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.arms"
                    name="affectedArms"
                    value={affectedArms}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.back"
                    name="affectedBack"
                    value={affectedBack}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.legs"
                    name="affectedLags"
                    value={affectedLags}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.feet"
                    name="affectedFeet"
                    value={affectedFeet}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4" md="12" xl="6">
                  <Checkbox
                    label="page.accidents.check.other"
                    name="affectedOtherParts"
                    value={affectedOtherParts}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" className="mt-2">
                  <InputField
                    name='otherPartsObs'
                    label='input.specify'
                    value={otherPartsObs}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <Checkbox
              label="check.status"
              name="status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
      </Colxx>
    </Row>
  )
}

export default DetailAccident