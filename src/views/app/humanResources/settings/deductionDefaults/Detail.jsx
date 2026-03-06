import { Checkbox } from '@/components/checkbox';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { IntlMessages } from '@/helpers/Utils';
import { Button, Card, CardBody, Row } from 'reactstrap';

const Detail = ({formState, onInputChange, formValidation, sendForm, listTypeDeductions, listProjects, fnSaveDocument, fnClear}) => {

  const {deductionTypeId, projectId, priceCeiling, percent, isIhss, isRap, status} = formState;

  const {deductionTypeIdValid, projectIdValid, priceCeilingValid, percentValid } = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12}>
            <SearchSelect
              name="deductionTypeId"
              inputValue={deductionTypeId}
              onChange={onInputChange}
              options={listTypeDeductions}
              label="select.deductionType"
              invalid={sendForm && !!deductionTypeIdValid}
              feedbackText={sendForm && (deductionTypeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12}>
            <SearchSelect
              name="projectId"
              inputValue={projectId}
              onChange={onInputChange}
              options={listProjects}
              label="select.project"
              invalid={sendForm && !!projectIdValid}
              feedbackText={sendForm && (projectIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={7}>
            <InputField
              name="priceCeiling"
              label="input.priceCeiling"
              onChange={onInputChange}
              value={priceCeiling}
              invalid={sendForm && !!priceCeilingValid}
              feedbackText={sendForm && (priceCeilingValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={5}>
            <InputField
              name="percent"
              label="input.percent"
              onChange={onInputChange}
              value={percent}
              invalid={sendForm && !!percentValid}
              feedbackText={sendForm && (percentValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <Checkbox
              name="isIhss"
              label="check.isIhss"
              value={isIhss}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} sm={6}>
            <Checkbox
              name="isRap"
              label="check.isRap"
              value={isRap}
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs={12} align="right">
            <Checkbox
              name="status"
              label="check.status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <hr/>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button
              color="secondary" onClick={fnClear}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSaveDocument}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail