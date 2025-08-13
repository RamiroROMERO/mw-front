import { Card, CardBody, Row, Button, Form } from 'reactstrap';
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import Confirmation from '@/containers/ui/confirmationMsg';
import ReactTable from "@/components/reactTable";
import { useTypeProducts } from './useTypeProducts';

const TypeProducts = (props) => {
  const { setLoading } = props;

  const { formState, formValidation, sendForm, table, propsToMsgDelete, onInputChange, fnClearInputs, fnSave } = useTypeProducts({ setLoading });

  const { name, description, codeInit, codeSeq, status } = formState;

  const { nameValid, codeInitValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="4">
          <Card className="mb-5">
            <CardBody>
              <Form>
                <Row>
                  <Colxx xxs="12" md="6" lg="12">
                    <InputField
                      value={name}
                      name="name"
                      onChange={onInputChange}
                      type="text"
                      label="page.typeProducts.input.name"
                      invalid={sendForm && !!nameValid}
                      feedbackText={sendForm && (nameValid || null)}
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <InputField
                      value={description}
                      name="description"
                      onChange={onInputChange}
                      type="textarea"
                      label="page.typeProducts.input.description"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="6">
                    <InputField
                      value={codeInit}
                      name="codeInit"
                      onChange={onInputChange}
                      disabled={validInt(codeSeq) > 0 ? true : false}
                      type="text"
                      label="page.typeProducts.input.codeInit"
                      invalid={sendForm && !!codeInitValid}
                      feedbackText={sendForm && (codeInitValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="6">
                    <InputField
                      value={codeSeq}
                      name="codeSeq"
                      onChange={onInputChange}
                      disabled={validInt(codeSeq) > 0 ? true : false}
                      type="text"
                      label="page.typeProducts.input.codeSeq"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" md="6" lg="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="status"
                      value={status}
                      label="page.typeProducts.check.status"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12" className="div-action-button-container">
                    <Button color="secondary" onClick={fnClearInputs}><i className="bi bi-stars" /> {IntlMessages("button.clear")}</Button>
                    <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
                  </Colxx>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Colxx>
        <Colxx xxs="12" xs="12" sm="12" md="12" lg="8">
          <ReactTable
            {...table}
          />
        </Colxx>
        <Confirmation {...propsToMsgDelete} />
      </Row>
    </>
  );
}
export default TypeProducts;