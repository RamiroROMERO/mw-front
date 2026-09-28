import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import ReactTable from '@Components/reactTable';
import { IntlMessages } from '@Helpers/Utils';

const CreditNotesProvReport = ({ table, total, fnPrint }) => {
  return (
    <>
      <Row>
        <Colxx xxs="12" className="div-action-button-container mb-2">
          <Button color="secondary" onClick={fnPrint}>
            <i className="iconsminds-printer" /> {IntlMessages("button.print")}
          </Button>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-3">
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" xs="6" sm="3">
          <InputField
            name="creditNotesProvTotal"
            label="table.column.total"
            value={total}
            type="text"
            bold
            disabled
          />
        </Colxx>
      </Row>
    </>
  );
}

export default CreditNotesProvReport;
