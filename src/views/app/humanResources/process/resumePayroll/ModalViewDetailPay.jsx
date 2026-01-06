import React from 'react'
import { Colxx } from '@Components/common/CustomBootstrap';
import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, TabPane, Table } from 'reactstrap';
import { IntlMessages, formatDate, formatNumber, validFloat } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields';
import Confirmation from '@Containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import classnames from 'classnames';
import { useModalViewDetailPay } from './useModalViewDetailPay';
import { SimpleSelect } from '@Components/simpleSelect';

const ModalViewDetailPay = ({setOpen, data}) => {
  const {idPayroll, typePayroll, dateStart, dateEnd, notes, listTypeDeductions, listEmployees, listJobPositions, listPaymentMethod, listSchedules, listTypeIncomes, currentItemDeta, setLoading, fnViewDetailPayroll} = data;

  const {activeTab, percent, formState, formStateDeduc, formStateIncomes, formValidation, formValidationDeduc, formValidationIncomes, onInputChange, onInputChangeDeduc, onInputChangeIncomes, extDeducDetail, incomesDetail, dataAttendance, sendForm, sendFormDeduc, sendFormIncomes, onEmployeeChange, onDaysChange, onPercentChange, onHoursChange, onDaysIncChange, setActiveTab, fnAddDeductionExternal, fnEditDeductionExternal, fnAddIncomes, fnEditIncomes, fnDeleteDeductionExternal, fnDeleteIncomes, fnSaveDetailPayroll, fnClearInputsIncomes, fnClearInputsDeductions, propsToMsgDeleteDeducction, propsToMsgDeleteIncomes} = useModalViewDetailPay({idPayroll, typePayroll, dateStart, dateEnd, notes, currentItemDeta, setLoading, listEmployees, listTypeDeductions, listTypeIncomes, fnViewDetailPayroll, setOpen});

  const {employeeId, jobPositionId, methodPaymentId, daysWorked, daysVacationTaken, hoursWorked, turnId, totalIncomes, totalDeductions, totalPayment} = formState

  const {employeeIdValid, methodPaymentIdValid, daysWorkedValid} = formValidation;

  const {typeId, value, description} = formStateDeduc;

  const {typeIdValid, valueValid, descriptionValid} = formValidationDeduc;

  const {typeIdInc, daysInc, hoursInc, valueInc, descriptionInc} = formStateIncomes;

  const {typeIdIncValid, valueIncValid, descriptionIncValid} = formValidationIncomes;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Nav tabs className="separator-tabs ml-0 mb-4">
              <NavItem>
                <NavLink
                  className={classnames({
                    active: activeTab === '1',
                    'nav-link': true,
                  })}
                  onClick={() => setActiveTab('1')}
                >
                  {IntlMessages("page.biweeklyPayroll.modal.detail.title.generalData")}
                </NavLink>
              </NavItem>
              <NavItem style={{display: typePayroll===1?"block":"none"}}>
                <NavLink
                  className={classnames({
                    active: activeTab === '2',
                    'nav-link': true,
                  })}
                  onClick={() => setActiveTab('2')}
                >
                  {IntlMessages("page.biweeklyPayroll.modal.detail.title.incomeExpenses")}
                </NavLink>
              </NavItem>
              <NavItem style={{display: typePayroll===1?"block":"none"}}>
                <NavLink
                  className={classnames({
                    active: activeTab === '3',
                    'nav-link': true,
                  })}
                  onClick={() => setActiveTab('3')}
                >
                  {IntlMessages("page.biweeklyPayroll.modal.detail.title.externalDeduction")}
                </NavLink>
              </NavItem>
              <NavItem style={{display: typePayroll===1?"block":"none"}}>
                <NavLink
                  className={classnames({
                    active: activeTab === '4',
                    'nav-link': true,
                  })}
                  onClick={() => setActiveTab('4')}
                >
                  {IntlMessages("page.biweeklyPayroll.modal.detail.title.attendanceControl")}
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Colxx xxs="12" sm="6" lg="3" xl="3">
                    <InputField
                      label='select.dateStart'
                      name='dateStart'
                      value={formatDate(dateStart)}
                      disabled
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="3" xl="3">
                    <InputField
                      label='select.dateEnd'
                      name='dateEnd'
                      value={formatDate(dateEnd)}
                      disabled
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="12" lg="6" xl="6">
                    <SearchSelect
                      label='select.employee'
                      name='employeeId'
                      inputValue={employeeId}
                      options={listEmployees}
                      onChange={onEmployeeChange}
                      invalid={sendForm && !!employeeIdValid}
                      feedbackText={sendForm && (employeeIdValid || null)}
                      isDisabled={currentItemDeta.id?true:false}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="6" xl="4">
                    <SearchSelect
                      label='select.jobPosition'
                      name="jobPositionId"
                      inputValue={jobPositionId}
                      options={listJobPositions}
                      onChange={onInputChange}
                      isDisabled
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" lg="6" xl="4">
                    <SearchSelect
                      label='select.schedule'
                      name="turnId"
                      inputValue={turnId}
                      options={listSchedules}
                      onChange={onInputChange}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="4" lg="4" xl="4">
                    <SimpleSelect
                      name="methodPaymentId"
                      label='select.methodPayment'
                      value={methodPaymentId}
                      onChange={onInputChange}
                      options={listPaymentMethod}
                      invalid={sendForm && !!methodPaymentIdValid}
                      feedbackText={sendForm && (methodPaymentIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="4" lg="4" xl="3">
                    <InputField
                      name="daysWorked"
                      label='input.daysWorked'
                      value={daysWorked}
                      onChange={onDaysChange}
                      type="text"
                      invalid={sendForm && !!daysWorkedValid}
                      feedbackText={sendForm && (daysWorkedValid || null)}
                      disabled
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="4" lg="4" xl="3" style={{display: typePayroll===1?"block":"none"}}>
                    <InputField
                      name="daysVacationTaken"
                      label='input.daysVacationTaken'
                      value={daysVacationTaken}
                      onChange={onInputChange}
                      type="text"
                      disabled
                    />
                  </Colxx>
                </Row>
                <Row className='mt-3'>
                  <Colxx xxs="12" sm="7" md="7"> </Colxx>
                  <Colxx xxs="12" sm="5" md="5">
                    <Table size='sm'>
                      <tbody>
                        <tr style={{display: typePayroll===1?"block":"none"}}>
                          <td width="25%">{IntlMessages('page.biweeklyPayroll.label.income')}</td>
                          <td align='right' width="15%">{formatNumber(totalIncomes)}</td>
                        </tr>
                        <tr style={{display: typePayroll===1?"block":"none"}}>
                          <td width="25%">{IntlMessages('page.biweeklyPayroll.input.totalDeductions')}</td>
                          <td align='right' width="15%">{formatNumber(totalDeductions)}</td>
                        </tr>
                        <tr>
                          <th width="25%">{IntlMessages('table.column.totalPayment')}</th>
                          <td align='right' width="15%"><b>{formatNumber(totalPayment,'L. ',2)}</b></td>
                        </tr>
                      </tbody>
                    </Table>
                  </Colxx>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Colxx xxs="12" sm="5" lg="5" xl="4">
                    <SearchSelect
                      label='select.type'
                      name='typeIdInc'
                      inputValue={typeIdInc}
                      options={listTypeIncomes}
                      onChange={onInputChangeIncomes}
                      invalid={sendFormIncomes && !!typeIdIncValid}
                      feedbackText={sendFormIncomes && (typeIdIncValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="7" lg="7" xl="8">
                    <InputField
                      name="descriptionInc"
                      label='input.description'
                      value={descriptionInc}
                      onChange={onInputChangeIncomes}
                      type="text"
                      invalid={sendFormIncomes && !!descriptionIncValid}
                      feedbackText={sendFormIncomes && (descriptionIncValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="3" lg="3" xl="3">
                    <InputField
                      name="daysInc"
                      label='input.days'
                      value={daysInc}
                      onChange={onDaysIncChange}
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="3" lg="3" xl="3">
                    <InputField
                      name="hoursInc"
                      label='input.hours'
                      value={hoursInc}
                      onChange={onHoursChange}
                      type="text"
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="3" lg="3" xl="3">
                    <InputField
                      name="percent"
                      label='input.percent'
                      value={percent}
                      onChange={onPercentChange}
                      type="text"
                      disabled={validFloat(hoursInc)===0?true:false}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="3" lg="3" xl="3">
                    <InputField
                      name="valueInc"
                      label='input.value'
                      value={valueInc}
                      onChange={onInputChangeIncomes}
                      type="text"
                      invalid={sendFormIncomes && !!valueIncValid}
                      feedbackText={sendFormIncomes && (valueIncValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" align="right" className="mb-3">
                    <Button color="secondary" onClick={fnClearInputsIncomes} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                    <Button color="primary" onClick={fnAddIncomes}>
                      <i className="bi bi-plus" /> {IntlMessages("button.add")}
                    </Button>
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <Table bordered hover size='sm'>
                      <thead>
                        <tr>
                          <th width="45%">{IntlMessages('table.column.description')}</th>
                          <th width="15%">{IntlMessages('table.column.days')}</th>
                          <th width="15%">{IntlMessages('table.column.hours')}</th>
                          <th width="15%">{IntlMessages('table.column.value')}</th>
                          <th width="10%">{IntlMessages('table.column.options')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomesDetail.map((item,idx) =>{
                          return (
                            <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                              <td>{item.description}</td>
                              <td>{item.days}</td>
                              <td>{item.hours}</td>
                              <td align='right'>{formatNumber(item.value)}</td>
                              <td align='right'>
                                <Button type="button" className="btn-circle-table" color="warning" title="Editar"
                                  onClick={() => {fnEditIncomes(item)}} key={`buttons2-${idx}`}>
                                  <i className='bi bi-pencil' />
                                </Button>
                                <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                                  onClick={() => {fnDeleteIncomes(item)}} key={`buttons2-${idx + 1}`}>
                                  <i className='bi bi-trash' />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td><b>Total</b></td>
                          <td><b>{daysWorked + daysVacationTaken}</b></td>
                          <td><b>{hoursWorked}</b></td>
                          <td align='right'><b>{formatNumber(totalIncomes)}</b></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </Table>
                  </Colxx>
                </Row>
              </TabPane>
              <TabPane tabId="3">
                <Row>
                  <Colxx xxs="12" sm="5" lg="4" xl="3">
                    <SearchSelect
                      label='select.type'
                      name='typeId'
                      inputValue={typeId}
                      options={listTypeDeductions}
                      onChange={onInputChangeDeduc}
                      invalid={sendFormDeduc && !!typeIdValid}
                      feedbackText={sendFormDeduc && (typeIdValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="7" lg="5" xl="7">
                    <InputField
                      name="description"
                      label='input.description'
                      value={description}
                      onChange={onInputChangeDeduc}
                      type="text"
                      invalid={sendFormDeduc && !!descriptionValid}
                      feedbackText={sendFormDeduc && (descriptionValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="3" lg="3" xl="2">
                    <InputField
                      name="value"
                      label='input.value'
                      value={value}
                      onChange={onInputChangeDeduc}
                      type="text"
                      invalid={sendFormDeduc && !!valueValid}
                      feedbackText={sendFormDeduc && (valueValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="9" lg="12" xl="12" align="right" className="mb-3">
                    <Button color="secondary" onClick={fnClearInputsDeductions} className="mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                    <Button color="primary" onClick={fnAddDeductionExternal}>
                      <i className="bi bi-plus" /> {IntlMessages("button.add")}
                    </Button>
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <Table bordered hover size='sm'>
                      <thead>
                        <tr>
                          <th width="40%">{IntlMessages('table.column.description')}</th>
                          <th width="15%">{IntlMessages('table.column.days')}</th>
                          <th width="15%">{IntlMessages('table.column.hours')}</th>
                          <th width="20%">{IntlMessages('table.column.value')}</th>
                          <th width="10%">{IntlMessages('table.column.options')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extDeducDetail.map((item,idx) =>{
                          return (
                            <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx}>
                              <td>{item.description}</td>
                              <td>{item.days}</td>
                              <td>{item.hours}</td>
                              <td align='right'>{formatNumber(item.value)}</td>
                              <td align='right'>
                                <Button type="button" className="btn-circle-table" color="warning" title="Editar"
                                  onClick={() => {fnEditDeductionExternal(item)}} key={`buttons2-${idx}`}>
                                  <i className='bi bi-pencil' />
                                </Button>
                                <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                                  onClick={() => {fnDeleteDeductionExternal(item)}} key={`buttons2-${idx + 1}`}>
                                  <i className='bi bi-trash' />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Colxx>
                </Row>
              </TabPane>
              <TabPane tabId="4">
                <Row>
                  <Colxx xxs="12">
                    <Table bordered hover size='sm'>
                      <thead>
                        <tr>
                          <th width="30%">{IntlMessages('table.column.date')}</th>
                          <th width="10%">{IntlMessages('table.column.input')}</th>
                          <th width="10%">{IntlMessages('table.column.output')}</th>
                          <th width="10%">{IntlMessages('table.column.breakTimeOut')}</th>
                          <th width="10%">{IntlMessages('table.column.breakTimeIn')}</th>
                          <th width="30%">{IntlMessages('table.column.timeWorked')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataAttendance.map((item,idx) =>{
                          return (
                            <tr id={`tr-table-invoiceDetail-${item.id}`} key={idx} style={{backgroundColor: item.colorDay	}}>
                              <td>{item.date}</td>
                              <td>{item.input}</td>
                              <td>{item.output}</td>
                              <td>{item.breakOut}</td>
                              <td>{item.breakIn}</td>
                              <td>{item.timeWorked}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Colxx>
                </Row>
              </TabPane>
            </TabContent>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveDetailPayroll}>
          <i className="iconsminds-save" />{` ${IntlMessages("button.save")}`}
        </Button>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgDeleteDeducction}/>
      <Confirmation {...propsToMsgDeleteIncomes}/>
    </>
  )
}

export default ModalViewDetailPay