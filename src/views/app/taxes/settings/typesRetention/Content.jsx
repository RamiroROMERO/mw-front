import { IntlMessages } from "@Helpers/Utils";
import { Card, CardBody, Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Checkbox } from '@Components/checkbox';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import ReactTable from '@Components/reactTable';
import Confirmation from '@Containers/ui/confirmationMsg';
import { useTypeRetentions } from './useTypeRetentions';

const TypesRetention = (props) => {
  const { setLoading } = props;
  const { formState, errors, onInputChange, fnSave, fnClearInputs, table, propsToMsgDelete, sendForm, listAccount, listReportTypes } = useTypeRetentions({ setLoading });

  const { name, status, percentValue, sarCode, withholdingCtaCode, reportTypeId } = formState;

  return (
    <>
      <Row>
        <Colxx xxs="12" lg="6">
          <Card className='mb-3'>
            <CardBody>
              <Row className='mb-3'>
                <Colxx xxs="12" xs="8">
                  <InputField
                    name="name"
                    onChange={onInputChange}
                    value={name}
                    label="page.typesRetention.input.name"
                    type="text"
                    maxLength={80}
                    invalid={sendForm && !!errors.name}
                    feedbackText={sendForm && (errors.name || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <InputField
                    name="percentValue"
                    onChange={onInputChange}
                    value={percentValue}
                    label="page.typesRetention.input.value"
                    type="text"
                    invalid={sendForm && !!errors.percentValue}
                    feedbackText={sendForm && (errors.percentValue || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="8">
                  <SearchSelect
                    label="page.typesRetention.select.idCtaAccount"
                    name="withholdingCtaCode"
                    onChange={onInputChange}
                    inputValue={withholdingCtaCode}
                    options={listAccount}
                    invalid={sendForm && !!errors.withholdingCtaCode}
                    feedbackText={sendForm && (errors.withholdingCtaCode || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="4">
                  <InputField
                    name="sarCode"
                    onChange={onInputChange}
                    value={sarCode}
                    label="page.typesRetention.input.taxCode"
                    type="text"
                    invalid={sendForm && !!errors.sarCode}
                    feedbackText={sendForm && (errors.sarCode || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xs="8">
                  <SearchSelect
                    label="page.typesRetention.select.reportType"
                    name="reportTypeId"
                    onChange={onInputChange}
                    inputValue={reportTypeId}
                    options={listReportTypes}
                    isClearable
                  />
                </Colxx>
                <Colxx xxs="12" xs="6">
                  <Checkbox
                    name="status"
                    onChange={onInputChange}
                    value={status}
                    label="page.typesRetention.checkbox.status"
                  />
                </Colxx>
              </Row>
              <hr />
              <Row>
                <Colxx xxs="12" className="div-action-button-container">
                  <Button
                    color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
                  </Button>
                  <Button
                    color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" lg="6">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default TypesRetention;