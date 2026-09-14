import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import { useModalCopy } from './useModalCopy';

const ModalCopy = ({ data, setOpen }) => {

  const { currentCode, currentName, currentTypeId, listClassifications, fnSaveCopy } = data;

  const { formState, formValidation, sendForm, onInputChange, fnGenerateCode, fnSave, fnCancel } = useModalCopy({
    currentTypeId,
    listClassifications,
    fnSaveCopy,
    setOpen
  });

  const { newTypeId, newCode, newName } = formState;
  const { newTypeIdValid, newCodeValid, newNameValid } = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12}>
            <p><strong>{IntlMessages("page.productsCatalog.modal.copy.title.source")}</strong></p>
            <h6>{`${currentCode} - ${currentName}`}</h6>
          </Colxx>
        </Row>
        <hr />
        <Row>
          <Colxx xxs={12}>
            <p><strong>{IntlMessages("page.productsCatalog.modal.copy.title.new")}</strong></p>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} md={8}>
            <SearchSelect
              label="page.productsCatalog.modal.newProduct.select.classification"
              name="newTypeId"
              inputValue={newTypeId}
              onChange={onInputChange}
              options={listClassifications}
              invalid={sendForm && !!newTypeIdValid}
              feedbackText={sendForm && (newTypeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={4} align="right">
            <Button color="info" onClick={fnGenerateCode}>
              <i className="bi bi-arrow-clockwise" />
              {IntlMessages("button.generateCode")}
            </Button>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} md={6}>
            <InputField
              label="page.productsCatalog.modal.newProduct.input.code"
              name="newCode"
              type="text"
              value={newCode}
              onChange={onInputChange}
              invalid={sendForm && !!newCodeValid}
              feedbackText={sendForm && (newCodeValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} md={6}>
            <InputField
              label="page.productsCatalog.modal.newProduct.input.name"
              name="newName"
              type="text"
              value={newName}
              onChange={onInputChange}
              invalid={sendForm && !!newNameValid}
              feedbackText={sendForm && (newNameValid || null)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}><i className="iconsminds-save"></i> {` ${IntlMessages('button.save')}`}</Button>
        <Button color="secondary" onClick={fnCancel}><i className="bi bi-box-arrow-right"></i> {` ${IntlMessages('button.cancel')}`}</Button>
      </ModalFooter>
    </>
  )
}

export default ModalCopy;
