import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { SimpleSelect } from '@Components/simpleSelect';
import { IntlMessages } from '@Helpers/Utils';

// Equivalente a Cont_IO_Modules_Edit.sc2: alterna Abierto/Cerrado para un solo módulo
// del período seleccionado.
const STATUS_OPTIONS = [
  { id: 1, name: 'page.moduleOpeningClosing.status.open' },
  { id: 0, name: 'page.moduleOpeningClosing.status.closed' }
];

const ModalEditStatus = ({ data, setOpen }) => {
  const { row, fnSave } = data;
  const [status, setStatus] = useState(row ? row.status : 0);

  if (!row) return null;

  const options = STATUS_OPTIONS.map((o) => ({ id: o.id, name: IntlMessages(o.name) }));

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12">
            <strong>{IntlMessages('page.moduleOpeningClosing.table.module')}:</strong> {row.moduleName}
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <SimpleSelect
              name="status"
              label="page.moduleOpeningClosing.table.status"
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              options={options}
              getOptionValue={(o) => o.id}
              getOptionLabel={(o) => o.name}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => fnSave(status)}>
          <i className="bi bi-check-lg" /> {IntlMessages('button.accept')}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalEditStatus
