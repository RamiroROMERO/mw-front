/* eslint-disable react/prop-types */
import React from 'react'
import { useHeader } from './useHeader';
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import SearchSelect from '@Components/SearchSelect/SearchSelect';

const Header = ({listProjects, setLoading, table, setTable, enableGenerateReport}) => {

  const {formState, formValidation, sendForm, onInputChange, fnGetData} = useHeader({setLoading, table, setTable, enableGenerateReport});

  const {projectId} = formState;

  const {projectIdValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} md={6} lg={5}>
            <SearchSelect
              label='select.project'
              name='projectId'
              inputValue={projectId}
              options={listProjects}
              onChange={onInputChange}
              invalid={sendForm && !!projectIdValid}
              feedbackText={sendForm && (projectIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={6} lg={12} style={{textAlign: 'right'}}>
            <Button
              color="primary" onClick={fnGetData}><i className="iconsminds-save" /> {IntlMessages("button.filter")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Header