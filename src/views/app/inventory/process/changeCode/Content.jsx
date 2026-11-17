import { Card, CardBody, Row, Table } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import ControlPanel from '@Components/controlPanel';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import Modal from '@Components/modal';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useChangeCode } from './useChangeCode';
import ModalConfirmChange from './ModalConfirmChange';
import { MAX_CODE, MAX_DESCRIPTION, MAX_NAME, remainingText } from './changeCodeRules';

// Cambio de código, nombre y descripción de un producto (SPEC v2-55-sr).
const ChangeCode = ({ setLoading }) => {
  const {
    propsToControlPanel, current, form, formValidation, sendForm, productOptions, onProductSearch, onProductChange, onInputChange,
    preview, openConfirm, setOpenConfirm, fnConfirmChange, result
  } = useChangeCode({ setLoading });

  const { newCode, name, description } = form;
  const { productValid, newCodeValid, nameValid, descriptionValid } = formValidation;
  // Los textos nunca se piden dentro de condiciones (los hooks de traducción no pueden llamarse condicionalmente).
  const textResult = IntlMessages('page.changeCode.result.title');
  const textRemaining = IntlMessages('page.changeCode.result.remaining');
  const textTable = IntlMessages('page.changeCode.column.table');
  const textField = IntlMessages('page.changeCode.column.field');
  const textRows = IntlMessages('page.changeCode.column.rows');
  const textNameOnly = IntlMessages('page.changeCode.result.nameOnly');

  const propsToModalConfirm = {
    ModalContent: ModalConfirmChange,
    title: 'page.changeCode.modal.confirm.title',
    open: openConfirm,
    setOpen: setOpenConfirm,
    maxWidth: 'lg',
    data: { preview, oldCode: current?.code, name, fnConfirm: fnConfirmChange }
  };

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <Row>
                <Colxx xxs="12" lg="8">
                  <SearchSelect
                    label="page.changeCode.input.product"
                    name="productCode"
                    inputValue={current?.code || ''}
                    options={productOptions}
                    onChange={onProductChange}
                    onInputChange={onProductSearch}
                    invalid={sendForm && !!productValid}
                    feedbackText={sendForm && (productValid || null)}
                  />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" md="4" xl="3">
                  <InputField label="page.changeCode.input.currentCode" name="currentCode" value={current?.code || ''} disabled />
                </Colxx>
                <Colxx xxs="12" md="8" xl="5">
                  <InputField label="page.changeCode.input.currentName" name="currentName" value={current?.name || ''} disabled />
                </Colxx>
                <Colxx xxs="12" xl="4">
                  <InputField label="page.changeCode.input.currentDescription" name="currentDescription" value={current?.description || ''} disabled />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" md="4" xl="3">
                  <InputField
                    label="page.changeCode.input.newCode"
                    name="newCode"
                    value={newCode}
                    onChange={onInputChange}
                    maxLength={MAX_CODE + 10}
                    invalid={sendForm && !!newCodeValid}
                    feedbackText={sendForm && (newCodeValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" md="8" xl="5">
                  <InputField
                    label="page.changeCode.input.newName"
                    name="name"
                    value={name}
                    onChange={onInputChange}
                    maxLength={MAX_NAME}
                    invalid={sendForm && !!nameValid}
                    feedbackText={sendForm && (nameValid || null)}
                  />
                </Colxx>
                <Colxx xxs="12" xl="4">
                  <InputField
                    label="page.changeCode.input.newDescription"
                    name="description"
                    value={description}
                    onChange={onInputChange}
                    maxLength={MAX_DESCRIPTION}
                    invalid={sendForm && !!descriptionValid}
                    feedbackText={sendForm && (descriptionValid || null)}
                  />
                </Colxx>
              </Row>
              {result && (
                <>
                  <Separator className="mt-3 mb-3" />
                  <h5>{textResult}: {result.oldCode}{result.changedCode ? ` → ${result.newCode}` : ''}</h5>
                  {result.changedCode ? <p>{formatNumber(result.rows, '', 0)} / {result.tables}</p> : <p>{textNameOnly}</p>}
                  {result.hasRemaining && (
                    <p className="text-danger fw-bold" id="changeCodeRemaining">
                      <i className="bi bi-exclamation-octagon-fill" /> {textRemaining}: {remainingText(result.remaining)}
                    </p>
                  )}
                  <Table bordered size="sm">
                    <thead>
                      <tr><th>{textTable}</th><th>{textField}</th><th className="text-end">{textRows}</th></tr>
                    </thead>
                    <tbody>
                      {result.updated.map((item) => (
                        <tr key={`${item.table}.${item.column}`}>
                          <td>{item.table}</td><td>{item.column}</td><td className="text-end">{formatNumber(item.rows, '', 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalConfirm} />
    </>
  );
}
export default ChangeCode;
