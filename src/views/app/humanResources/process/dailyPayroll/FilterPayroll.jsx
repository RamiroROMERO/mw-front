import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, validInt } from '@Helpers/Utils'
import { Checkbox } from '@Components/checkbox'
import DateCalendar from '@Components/dateCalendar'
import SearchSelect from '@Components/SearchSelect/SearchSelect'

const FilterPayroll = ({dateFilter, customerIdFilter, projectIdFilter, previousPayroll, listCustomers, listProjects, listProjectsFilter, setListProjectsFilter, onInputChangeFilter, setBulkFormFilter, fnGetPayrolls, formValidation, sendForm, fnClearInputs}) => {

  const {dateFilterValid, customerIdFilterValid, projectIdFilterValid} = formValidation;

  const onCustomerChange = e =>{
    const custId = validInt(e.target.value);

    const filter = listProjects.filter((item)=>{
      return item.customerId === custId
    });
    filter.unshift({value:'0', label:'Seleccione'});

    setListProjectsFilter(filter);

    setBulkFormFilter({customerIdFilter: custId, projectIdFilter:0});
  }

  return (
    <Row>
      <Colxx xxs="12" sm="6" lg="3">
        <DateCalendar
          name="dateFilter"
          value={dateFilter}
          label='select.date'
          onChange={onInputChangeFilter}
          invalid={sendForm && !!dateFilterValid}
          feedbackText={sendForm && (dateFilterValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="5">
        <SearchSelect
          label='select.customer'
          name='customerIdFilter'
          inputValue={customerIdFilter}
          options={listCustomers}
          onChange={onCustomerChange}
          invalid={sendForm && !!customerIdFilterValid}
          feedbackText={sendForm && (customerIdFilterValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="4">
        <SearchSelect
          label='page.dailyReport.select.projectId'
          name='projectIdFilter'
          inputValue={projectIdFilter}
          options={listProjectsFilter}
          onChange={onInputChangeFilter}
          invalid={sendForm && !!projectIdFilterValid}
          feedbackText={sendForm && (projectIdFilterValid || null)}
        />
      </Colxx>
      <Colxx xxs="12" sm="6" lg="4" className="mb-3">
        <Checkbox
          label='check.previousPayroll'
          name="previousPayroll"
          value={previousPayroll}
          onChange={onInputChangeFilter}
        />
      </Colxx>
      <Colxx xxs="12" sm="12" lg="8" align="right">
        <Button color="secondary" onClick={fnClearInputs} className="mr-1 mb-3 mr-1"><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
        <Button color="success" onClick={fnGetPayrolls} className="mr-1 mb-3">
          <i className="bi bi-funnel" /> {IntlMessages("button.filter")}
        </Button>
      </Colxx>
    </Row>
  )
}

export default FilterPayroll