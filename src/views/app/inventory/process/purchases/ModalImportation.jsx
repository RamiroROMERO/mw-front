import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';

// Legacy inv_compras_dataimport.sc2 ("Datos de Importación"): número de DUA, boleta, CIF,
// DAI e ISV de importación — campos de referencia/documentación, se guardan junto con el
// resto del documento al hacer Guardar (no disparan cálculo propio).
const ModalImportation = (props) => {
  const { data, setOpen } = props;
  const { importNumberDua, importTicket, importCif, importDai, importSelect, onInputChange } = data;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" sm="6">
            <InputField name="importNumberDua" label="page.purchases.input.importNumberDua"
              value={importNumberDua} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="6">
            <InputField name="importTicket" label="page.purchases.input.importTicket"
              value={importTicket} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="importCif" label="page.purchases.input.importCif"
              value={importCif} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="importDai" label="page.purchases.input.importDai"
              value={importDai} onChange={onInputChange} type="text" />
          </Colxx>
          <Colxx xxs="12" sm="4">
            <InputField name="importSelect" label="page.purchases.input.importSelect"
              value={importSelect} onChange={onInputChange} type="text" />
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

export default ModalImportation;
