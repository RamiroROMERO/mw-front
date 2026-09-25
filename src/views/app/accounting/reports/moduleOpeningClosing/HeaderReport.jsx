import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';

const HeaderReport = ({ monthIndex, year, months, onInputChange, fnGenerate, fnOpenAll, fnCloseAll, hasHeader }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" md="5" lg="4">
          <SimpleSelect
            name="monthIndex"
            label="page.moduleOpeningClosing.input.month"
            value={monthIndex}
            onChange={onInputChange}
            options={months}
            getOptionValue={(o) => o.index}
            getOptionLabel={(o) => o.name}
          />
        </Colxx>
        <Colxx xxs="12" md="4" lg="4">
          <InputField
            name="year"
            label="page.moduleOpeningClosing.input.year"
            value={year}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={fnGenerate}>
            <i className="bi bi-gear-fill" /> {IntlMessages('page.moduleOpeningClosing.button.generate')}
          </Button>
          <Button color="success" disabled={!hasHeader} onClick={fnOpenAll}>
            <i className="bi bi-unlock-fill" /> {IntlMessages('page.moduleOpeningClosing.button.openAll')}
          </Button>
          <Button color="danger" disabled={!hasHeader} onClick={fnCloseAll}>
            <i className="bi bi-lock-fill" /> {IntlMessages('page.moduleOpeningClosing.button.closeAll')}
          </Button>
        </Colxx>
      </Row>
    </>
  );
}

export default HeaderReport;
