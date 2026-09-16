import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

// Legacy inv_compras_dataex.sc2 ("Datos de Exoneración"): constancia, orden y registro SAG
// de la exoneración fiscal de la compra — campos de solo referencia/documentación, no
// disparan ningún cálculo; se guardan junto con el resto del documento al hacer Guardar.
const ModalExonerated = (props) => {
  const { data, setOpen } = props;
  const { exemptedCertificate, exemptedNumber, exemptedRecord, onInputChange } = data;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField name="exemptedCertificate" label="page.purchases.input.exemptedCertificate"
              value={exemptedCertificate} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="exemptedNumber" label="page.purchases.input.exemptedNumber"
              value={exemptedNumber} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12">
            <InputField name="exemptedRecord" label="page.purchases.input.exemptedRecord"
              value={exemptedRecord} onChange={onInputChange} type="text" />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => { setOpen(false) }}>
          <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalExonerated;
