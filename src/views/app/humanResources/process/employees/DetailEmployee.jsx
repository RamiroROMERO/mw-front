/* eslint-disable react/prop-types */
import { useState } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils';
import { Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from 'reactstrap'
import classnames from 'classnames'
import { Colxx } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from '@Components/simpleSelect';
import { InputField } from '@Components/inputFields';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { Checkbox } from '@Components/checkbox';
import { RadioGroup } from '@Components/radioGroup';

const DetailEmployee = ({civilStatusId,profession,cellPhone,telePhone,email,spouse,telSpouse,birthplace,nameContact,phoneContact,departmentId,municipalityId,exactAddress,educationLevelId,ownsVehicle,typeVehicleId,vehiclePlate,dateIn,areaId,jobPositionId,immediateBossId,workScheduleId,contractTypeId,payrollTypeId,dateInContract,dateOutContract,defaultSalary,paymentMethod,bankPayment,accountNumber,condDiabetes,condHypertension,condVenerealDiseases,condHeartAttacks,condVisualImpairment,condHearingImpairment,condCerebroAccidents,condNeuroDisorders,condSteoDiseases,condOtherDiseases,condAllergies,deductionsIhss,deductionsIhssBiweekly,deductionsRap,deductionsRapBiweekly,payOvertime,shirtSize,pantSize,shoesSize,listDepartments,listMunicipality,listAreas,listJobPositions,listSchedules,listImmediateBoss,onInputChange,setBulkForm,listFilterMunic,setListFilterMunic,formValidation, sendForm}) => {
  const [activeTab, setActiveTab] = useState('1');
  const [disabledDateContract, setDisabledDateContract] = useState(false);

  const {civilStatusIdValid, cellPhoneValid, nameContactValid, phoneContactValid, departmentIdValid, municipalityIdValid,
  exactAddressValid, educationLevelIdValid, dateInValid, jobPositionIdValid, workScheduleIdValid, contractTypeIdValid,
  payrollTypeIdValid, defaultSalaryValid, paymentMethodValid} = formValidation;

  const onContractChange = e =>{
    const typeContract = validInt(e.target.value);
    const newTypeContract = {
      contractTypeId: typeContract
    }

    if(typeContract===2){
      setDisabledDateContract(true);
      newTypeContract.dateInContract = "";
      newTypeContract.dateOutContract = "";
    }else{
      setDisabledDateContract(false);
    }

    setBulkForm(newTypeContract);
  }

  const onDeptoChange = e =>{
    const codeDepto = e.target.value;
    const filterMunic = listMunicipality.filter((item)=> item.codeDepto === codeDepto );
    setListFilterMunic(filterMunic);

    const newDepto = {
      departmentId: codeDepto,
      municipalityId: "0",
      colonyId: "0"
    }
    setBulkForm(newDepto);
  }

  return (
    <>
    <Nav tabs className="separator-tabs ml-0 mb-2">
      <NavItem>
        <NavLink
           className={classnames({
            active: activeTab === '1',
            'nav-link': true,
          })}
          onClick={() => setActiveTab('1')}
        >
          {IntlMessages("page.employees.tab.title.general")}
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink
           className={classnames({
            active: activeTab === '2',
            'nav-link': true,
          })}
          onClick={() => setActiveTab('2')}
        >
          {IntlMessages("page.employees.tab.title.labor")}
        </NavLink>
      </NavItem>
    </Nav>
    <TabContent activeTab={activeTab}>
      <TabPane tabId="1" className="mt-3">
        <Row>
          <Colxx xxs="12" xs="6" md="4" xl="3">
            <SimpleSelect
              name="civilStatusId"
              label='page.employees.select.civilStatus'
              value={civilStatusId}
              onChange={onInputChange}
              options={[
                {id:1,name:'Soltero(a)'},
                {id:2,name:'Casado(a)'},
                {id:3,name:'Viudo(a)'},
                {id:4,name:'Divorciado(a)'},
                {id:5,name:'Union Libre'},
              ]}
              invalid={sendForm && !!civilStatusIdValid}
              feedbackText={sendForm && (civilStatusIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" md="4" xl="3">
            <InputField
              name='cellPhone'
              label='input.cellPhone'
              value={cellPhone}
              onChange={onInputChange}
              type='text'
              invalid={sendForm && !!cellPhoneValid}
              feedbackText={sendForm && (cellPhoneValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" xs="6" md="4" xl="3">
            <InputField
              name='telePhone'
              label='input.telePhone'
              value={telePhone}
              onChange={onInputChange}
              type='text'
            />
          </Colxx>
          <Colxx xxs="12" xs="6" md="4" xl="3">
            <InputField
              name='email'
              label='input.email'
              value={email}
              onChange={onInputChange}
              type='text'
            />
          </Colxx>
          <Colxx xxs="12" xs="6" md="8" xl="12">
            <InputField
              name='birthplace'
              label='page.employees.input.birthplace'
              value={birthplace}
              onChange={onInputChange}
              type='text'
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xxl="6">
            <ContainerWithLabel label="page.employees.label.spouse">
              <Row>
                <Colxx xxs="12" sm="7">
                  <InputField
                    name='spouse'
                    label='input.name'
                    value={spouse}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
                <Colxx xxs="12" sm="5">
                  <InputField
                    name='telSpouse'
                    label='input.telePhone'
                    value={telSpouse}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12" xxl="6">
            <ContainerWithLabel label="page.employees.label.emergencyContact">
              <Row>
                <Colxx xxs="12" sm="7">
                  <InputField
                    name='nameContact'
                    label='input.name'
                    value={nameContact}
                    onChange={onInputChange}
                    type='text'
                    invalid={sendForm && !!nameContactValid}
                    feedbackText={sendForm && (nameContactValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="5">
                  <InputField
                    name='phoneContact'
                    label='input.telePhone'
                    value={phoneContact}
                    onChange={onInputChange}
                    type='text'
                    invalid={sendForm && !!phoneContactValid}
                    feedbackText={sendForm && (phoneContactValid || null)}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.address">
              <Row>
                <Colxx xxs="12" md="5" xl="5">
                  <SearchSelect
                    label='select.department'
                    name="departmentId"
                    inputValue={departmentId}
                    options={listDepartments}
                    onChange={onDeptoChange}
                    invalid={sendForm && !!departmentIdValid}
                    feedbackText={sendForm && (departmentIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" md="7" xl="7">
                  <SearchSelect
                    label='select.municipality'
                    name="municipalityId"
                    inputValue={municipalityId}
                    options={listFilterMunic}
                    onChange={onInputChange}
                    invalid={sendForm && !!municipalityIdValid}
                    feedbackText={sendForm && (municipalityIdValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xx="12">
                  <InputField
                    name='exactAddress'
                    label='page.employees.input.exactAddress'
                    value={exactAddress}
                    onChange={onInputChange}
                    type='textarea'
                    style={{resize:'none'}}
                    invalid={sendForm && !!exactAddressValid}
                    feedbackText={sendForm && (exactAddressValid || null)}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.education">
              <Row>
                <Colxx xxs="12" sm="5">
                  <SimpleSelect
                    name='educationLevelId'
                    label='page.employees.input.educationLevelId'
                    value={educationLevelId}
                    onChange={onInputChange}
                    options={[
                      {id:1,name:'Educación Primaria'},
                      {id:2,name:'Educación Secundaria'},
                      {id:3,name:'Educación Superior'}
                    ]}
                    invalid={sendForm && !!educationLevelIdValid}
                    feedbackText={sendForm && (educationLevelIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="7">
                  <InputField
                    name='profession'
                    label='page.employees.input.profession'
                    value={profession}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.vehicleData">
              <Row>
                <Colxx xxs="12" xs="4" sm="3">
                  <RadioGroup
                    label='page.employees.radio.ownsVehicle'
                    name='ownsVehicle'
                    value={ownsVehicle}
                    onChange={onInputChange}
                    options={[
                      {id:1, label:'option.yes'},
                      {id:2, label:'option.no'},
                    ]}
                  />
                </Colxx>
                <Colxx xxs="12" xs="8" sm="9">
                  <Row>
                    <Colxx xxs="12" sm="6">
                      <SimpleSelect
                        name='typeVehicleId'
                        label='select.type'
                        value={typeVehicleId}
                        onChange={onInputChange}
                        options={[
                          {id:1,name:'Transporte Interno'},
                          {id:2,name:'Automovil'},
                          {id:3,name:'Motocicleta'},
                          {id:4,name:'Bicicleta'},
                          {id:5,name:'Otros'}
                        ]}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6">
                      <InputField
                        name='vehiclePlate'
                        label='page.employees.input.vehiclePlate'
                        value={vehiclePlate}
                        onChange={onInputChange}
                        type='text'
                      />
                    </Colxx>
                  </Row>
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.chronicDiseases">
              <Row>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.diabetes"
                    name="condDiabetes"
                    value={condDiabetes}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.hypertension"
                    name="condHypertension"
                    value={condHypertension}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.venerealDiseases"
                    name="condVenerealDiseases"
                    value={condVenerealDiseases}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.heartAttacks"
                    name="condHeartAttacks"
                    value={condHeartAttacks}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.visualImpairment"
                    name="condVisualImpairment"
                    value={condVisualImpairment}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.hearingImpairment"
                    name="condHearingImpairment"
                    value={condHearingImpairment}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.cerebrovascularAccidents"
                    name="condCerebroAccidents"
                    value={condCerebroAccidents}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.neuroDisorders"
                    name="condNeuroDisorders"
                    value={condNeuroDisorders}
                    onChange={onInputChange}
                  />
                </Colxx>
                <Colxx xxs="12" xs="6" md="4">
                  <Checkbox
                    label="page.employees.check.steoarticularDiseases"
                    name="condSteoDiseases"
                    value={condSteoDiseases}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
              <Row className='mt-3'>
                <Colxx xxs="12" xxl="6">
                  <InputField
                    name='condOtherDiseases'
                    label='page.employees.input.otherDiseases'
                    value={condOtherDiseases}
                    onChange={onInputChange}
                    type='textarea'
                    style={{resize:'none'}}
                  />
                </Colxx>
                <Colxx xxs="12" xxl="6">
                  <InputField
                    name='condAllergies'
                    label='page.employees.input.allergies'
                    value={condAllergies}
                    onChange={onInputChange}
                    type='textarea'
                    style={{resize:'none'}}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </TabPane>
      <TabPane tabId="2" className="mt-3">
        <Row>
          <Colxx xxs="12" sm="6" md="6" xl="3">
            <DateCalendar
              name="dateIn"
              value={dateIn}
              label='select.dateIn'
              onChange={onInputChange}
              invalid={sendForm && !!dateInValid}
              feedbackText={sendForm && (dateInValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" md="6" xl="4">
            <SearchSelect
              label='select.area'
              name="areaId"
              inputValue={areaId}
              options={listAreas}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" md="6" xl="5">
            <SearchSelect
              label='page.employees.select.jobPosition'
              name="jobPositionId"
              inputValue={jobPositionId}
              options={listJobPositions}
              onChange={onInputChange}
              invalid={sendForm && !!jobPositionIdValid}
              feedbackText={sendForm && (jobPositionIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" md="6" xl="5">
            <SearchSelect
              label='page.employees.select.immediateBoss'
              name="immediateBossId"
              inputValue={immediateBossId}
              options={listImmediateBoss}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12" sm="6" md="6" xl="7">
            <SearchSelect
              label='page.employees.select.workSchedule'
              name="workScheduleId"
              inputValue={workScheduleId}
              options={listSchedules}
              onChange={onInputChange}
              invalid={sendForm && !!workScheduleIdValid}
              feedbackText={sendForm && (workScheduleIdValid || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.contract">
              <Row>
                <Colxx xxs="12" sm="6" md="4" xl="3">
                  <SimpleSelect
                    name='contractTypeId'
                    label='select.type'
                    value={contractTypeId}
                    onChange={onContractChange}
                    options={[
                      {id:1,name:'Por Hora'},
                      {id:2,name:'Permanente'},
                      {id:3,name:'Temporal'}
                    ]}
                    invalid={sendForm && !!contractTypeIdValid}
                    feedbackText={sendForm && (contractTypeIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" md="4" xl="3">
                  <SimpleSelect
                    name='payrollTypeId'
                    label='select.payrollType'
                    value={payrollTypeId}
                    onChange={onInputChange}
                    options={[
                      {id:1,name:'Semanal'},
                      {id:2,name:'Quincenal'}
                    ]}
                    invalid={sendForm && !!payrollTypeIdValid}
                    feedbackText={sendForm && (payrollTypeIdValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" md="4" xl="3">
                  <DateCalendar
                    name="dateInContract"
                    value={dateInContract}
                    label='page.employees.select.dateInContract'
                    onChange={onInputChange}
                    disabled={disabledDateContract}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" md="4" xl="3">
                  <DateCalendar
                    name="dateOutContract"
                    value={dateOutContract}
                    label='page.employees.select.dateOutContract'
                    onChange={onInputChange}
                    disabled={disabledDateContract}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.paymentInformation">
              <Row>
                <Colxx xxs="12" sm="6" md="4" xl="3" xxl="3">
                  <InputField
                    name='defaultSalary'
                    label='page.employees.input.defaultSalary'
                    value={defaultSalary}
                    onChange={onInputChange}
                    type='text'
                    invalid={sendForm && !!defaultSalaryValid}
                    feedbackText={sendForm && (defaultSalaryValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" md="8" xl="5" xxl="3">
                  <SimpleSelect
                    name='paymentMethod'
                    label='select.paymentMethod'
                    value={paymentMethod}
                    onChange={onInputChange}
                    options={[
                      {id:1,name:'Efectivo'},
                      {id:2,name:'Cheque'},
                      {id:3,name:'Transferencia'},
                      {id:4,name:'Transferencia Otro Banco'}
                    ]}
                    invalid={sendForm && !!paymentMethodValid}
                    feedbackText={sendForm && (paymentMethodValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" md="6" xl="4" xxl="3">
                  <InputField
                    name='bankPayment'
                    label='input.bank'
                    value={bankPayment}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" md="6" xl="4" xxl="3">
                  <InputField
                    name='accountNumber'
                    label='input.accountNumber'
                    value={accountNumber}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
                <Colxx xxs="12" sm="6" md="6" xl="4" xxl="3">
                  <Checkbox
                    label='page.employees.check.payOvertime'
                    name='payOvertime'
                    value={payOvertime}
                    onChange={onInputChange}
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.deductionsByLaw">
              <Row>
                <Colxx xxs="12">
                  <Table bordered size='sm'>
                    <thead>
                      <tr>
                        <th>{IntlMessages("input.description")}</th>
                        <th>{IntlMessages("page.employees.table.yesNo")}</th>
                        <th>{IntlMessages("page.employees.table.biWeekly")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>IHSS</td>
                        <td>
                          <Row>
                            <Colxx xxs="12">
                              <RadioGroup
                                label='radio.title.empty'
                                name='deductionsIhss'
                                value={deductionsIhss}
                                onChange={onInputChange}
                                options={[
                                  {id:1, label:'option.yes'},
                                  {id:2, label:'option.no'},
                                ]}
                                display="flex"
                              />
                            </Colxx>
                          </Row>
                        </td>
                        <td>
                          <Row>
                            <Colxx xxs="12">
                              <RadioGroup
                                label='radio.title.empty'
                                name='deductionsIhssBiweekly'
                                value={deductionsIhssBiweekly}
                                onChange={onInputChange}
                                options={[
                                  {id:1, label:'page.employees.option.first'},
                                  {id:2, label:'page.employees.option.second'},
                                  {id:3, label:'page.employees.option.both'}
                                ]}
                                display="flex"
                              />
                            </Colxx>
                          </Row>
                        </td>
                      </tr>
                      <tr>
                        <td>RAP</td>
                        <td>
                          <Row>
                            <Colxx xxs="12">
                              <RadioGroup
                                label='radio.title.empty'
                                name='deductionsRap'
                                value={deductionsRap}
                                onChange={onInputChange}
                                options={[
                                  {id:1, label:'option.yes'},
                                  {id:2, label:'option.no'},
                                ]}
                                display="flex"
                              />
                            </Colxx>
                          </Row>
                        </td>
                        <td>
                          <Row>
                            <Colxx xxs="12">
                              <RadioGroup
                                label='radio.title.empty'
                                name='deductionsRapBiweekly'
                                value={deductionsRapBiweekly}
                                onChange={onInputChange}
                                options={[
                                  {id:1, label:'page.employees.option.first'},
                                  {id:2, label:'page.employees.option.second'},
                                  {id:3, label:'page.employees.option.both'}
                                ]}
                                display="flex"
                              />
                            </Colxx>
                          </Row>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
          <Colxx xxs="12">
            <ContainerWithLabel label="page.employees.label.uniformInformation">
              <Row>
                <Colxx xxs="12" sm="4" md="4" xl="3" xxl="3">
                  <InputField
                    name='shirtSize'
                    label='page.employees.input.shirtSize'
                    value={shirtSize}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
                <Colxx xxs="12" sm="4" md="4" xl="3" xxl="3">
                  <InputField
                    name='pantSize'
                    label='page.employees.input.pantSize'
                    value={pantSize}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
                <Colxx xxs="12" sm="4" md="4" xl="3" xxl="3">
                  <InputField
                    name='shoesSize'
                    label='page.employees.input.shoesSize'
                    value={shoesSize}
                    onChange={onInputChange}
                    type='text'
                  />
                </Colxx>
              </Row>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </TabPane>
    </TabContent>
    </>
  )
}

export default DetailEmployee