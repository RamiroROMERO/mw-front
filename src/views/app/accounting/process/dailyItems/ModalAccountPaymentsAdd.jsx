import { useMemo, useState } from 'react';
import { Button, Input, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages, formatDate, formatNumber, validFloat } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';

// Picker "Agregar" (cont_pdacxc_add.sc2 / cont_pdacxp_add.sc2): navegador de TODAS las
// facturas de CxC/CxP con saldo pendiente (de cualquier cliente/proveedor). Al marcar una
// fila se auto-llena el Valor a Pagar con el Saldo (igual que el legacy); el usuario puede
// editarlo, siempre capado al saldo. "Aceptar" aplica todas las filas marcadas.
const ModalAccountPaymentsAdd = ({ data, setOpen }) => {
  const { pending, entityLabel, fnApplyPayments } = data;
  const [search, setSearch] = useState('');
  const [amounts, setAmounts] = useState({});

  const filtered = useMemo(() => {
    if (!search) return pending;
    const term = search.toLowerCase();
    return pending.filter((row) => (
      String(row.documentCode).toLowerCase().includes(term)
      || String(row.customerName || row.providerName || '').toLowerCase().includes(term)
    ));
  }, [pending, search]);

  const toggleRow = (row) => {
    setAmounts((prev) => {
      const next = { ...prev };
      if (next[row.id] !== undefined) {
        delete next[row.id];
      } else {
        next[row.id] = Number(row.balance);
      }
      return next;
    });
  }

  const onAmountChange = (row, value) => {
    const balance = Number(row.balance);
    const amount = Math.min(validFloat(value, 0), balance);
    setAmounts((prev) => ({ ...prev, [row.id]: amount }));
  }

  const fnAccept = () => {
    const rows = Object.entries(amounts)
      .filter(([, amount]) => Number(amount) > 0)
      .map(([id, amount]) => ({ id: Number(id), amount: Number(amount) }));
    if (rows.length === 0) {
      createNotification('warning', 'page.dailyItems.msg.noAmountSelected', 'alert.warning.title');
      return;
    }
    fnApplyPayments(rows);
    setAmounts({});
    setSearch('');
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" sm="4" className="mb-2">
            <InputField name="search" label="page.dailyItems.input.search" value={search} onChange={(e) => setSearch(e.target.value)} type="text" />
          </Colxx>
          <Colxx xxs="12" style={{ maxHeight: 350, overflowY: 'auto' }}>
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th />
                  <th>{IntlMessages('page.dailyItems.input.date')}</th>
                  <th>{IntlMessages('page.dailyItems.input.document')}</th>
                  <th>{entityLabel}</th>
                  <th align="right">{IntlMessages('page.dailyItems.input.balance')}</th>
                  <th align="right">{IntlMessages('page.dailyItems.input.amountToPay')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input type="checkbox" checked={amounts[row.id] !== undefined} onChange={() => toggleRow(row)} />
                    </td>
                    <td>{formatDate(row.date)}</td>
                    <td>{row.documentCode}</td>
                    <td>{row.customerName || row.providerName}</td>
                    <td align="right">{formatNumber(row.balance)}</td>
                    <td align="right">
                      <Input
                        type="text"
                        bsSize="sm"
                        disabled={amounts[row.id] === undefined}
                        value={amounts[row.id] !== undefined ? amounts[row.id] : ''}
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

export default ModalAccountPaymentsAdd;
