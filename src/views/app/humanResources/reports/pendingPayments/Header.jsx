import { Colxx } from '@/components/common/CustomBootstrap'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { IntlMessages } from '@/helpers/Utils'
import { Button, Card, CardBody, Row } from 'reactstrap'

const Header = ({projectId, listProjects, onProjectId, fnGetData}) => {
  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} md={7} lg={6}>
            <SearchSelect
              label='select.project'
              name='projectId'
              inputValue={projectId}
              options={listProjects}
              onChange={onProjectId}
            />
          </Colxx>
          <Colxx xxs={12} md={7} lg={12} style={{textAlign: 'right'}}>
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