import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ moduleId, dateStart, dateEnd, modules, onInputChange, fnSearch, fnExportXlsx }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="6" lg="4">
          <SimpleSelect
            name="moduleId"
            label="page.moduleAudit.input.module"
            value={moduleId}
            onChange={onInputChange}
            options={modules}
            getOptionValue={(o) => o.id}
            getOptionLabel={(o) => o.name}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="3" lg="4">
          <DateCalendar
            name="dateStart"
            label="page.moduleAudit.input.dateStart"
            value={dateStart}
            onChange={onInputChange}
          />
        </Colxx>
        <Colxx xxs="12" xs="6" md="3" lg="4">
          <DateCalendar
            name="dateEnd"
            label="page.moduleAudit.input.dateEnd"
            value={dateEnd}
            onChange={onInputChange}
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="secondary" onClick={fnExportXlsx}>
            <i className="bi bi-file-earmark-excel" /> {IntlMessages('button.exportXls')}
          </Button>
          <Button color="primary" onClick={fnSearch}>
            <i className="bi bi-search" /> {IntlMessages('button.search')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
