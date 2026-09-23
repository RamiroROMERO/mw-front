import { useState } from 'react';
import { Button, Input, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatDate, formatNumber, validFloat } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';

// "Seleccionar" (Commandbutton_hw4 de cont_pdas.sc2): elige UN anticipo existente (de
// cualquier proveedor) para aplicar contra esta partida — a diferencia de CxC/CxP, solo
// puede aplicarse un anticipo por partida, así que la selección es de una sola fila.
const ModalAdvanceSelect = ({ data, setOpen }) => {
  const { pending, fnSelectAdvance } = data;
  const [selectedId, setSelectedId] = useState(null);
  const [amount, setAmount] = useState(0);

  const toggleRow = (row) => {
    if (selectedId === row.id) {
      setSelectedId(null);
      setAmount(0);
      return;
    }
    setSelectedId(row.id);
    setAmount(Number(row.balance));
  }

  const onAmountChange = (row, value) => {
    const balance = Number(row.balance);
    setAmount(Math.min(validFloat(value, 0), balance));
  }

  const fnAccept = () => {
    const row = pending.find((r) => r.id === selectedId);
    if (!row || !(amount > 0)) {
      createNotification('warning', 'page.dailyItems.msg.noAdvanceSelected', 'alert.warning.title');
      return;
    }
    fnSelectAdvance(row, amount);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" style={{ maxHeight: 350, overflowY: 'auto' }}>
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th />
                  <th>{IntlMessages('page.dailyItems.input.date')}</th>
                  <th>{IntlMessages('page.dailyItems.input.provider')}</th>
                  <th align="right">{IntlMessages('page.dailyItems.input.balance')}</th>
                  <th align="right">{IntlMessages('page.dailyItems.input.advanceAmount')}</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input type="checkbox" checked={selectedId === row.id} onChange={() => toggleRow(row)} />
                    </td>
                    <td>{formatDate(row.date)}</td>
                    <td>{row.providerName}</td>
                    <td align="right">{formatNumber(row.balance)}</td>
                    <td align="right">
                      <Input
                        type="text"
                        bsSize="sm"
                        disabled={selectedId !== row.id}
                        value={selectedId === row.id ? amount : ''}
                        onChange={(e) => onAmountChange(row, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept}>
          <i className="bi bi-check-lg" /> {IntlMessages('button.accept')}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" /> {IntlMessages('button.exit')}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalAdvanceSelect;
