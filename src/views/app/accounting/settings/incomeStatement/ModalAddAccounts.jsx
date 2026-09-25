import { useState } from 'react';
import Select from 'react-select';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputLabel } from '@Components/inputLabel/InputLabel';
import { IntlMessages } from '@Helpers/Utils';

// Equivalente a cont_ccc_seek2.sc2 (picker multi-selección de cuentas del legacy) —
// mismo criterio ya usado en Libro Mayor (modo "Varias Cuentas"): un react-select isMulti
// en vez de portar el formulario de selección múltiple aparte del legacy.
const ModalAddAccounts = ({ data, setOpen }) => {
  const { options, fnAdd } = data;
  const [selected, setSelected] = useState([]);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputLabel label="page.incomeStatementStructure.modal.add.accounts">
              <Select
                className="react-select"
                classNamePrefix="react-select"
                isMulti
                options={options}
                value={selected}
                onChange={(opts) => setSelected(opts || [])}
                placeholder={IntlMessages('msg.select')}
              />
            </InputLabel>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => fnAdd(selected)}>
          <i className="bi bi-check-lg" /> {IntlMessages('page.incomeStatementStructure.button.add')}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddAccounts
