import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';

const ModalUnpaidBill = ({ data, setOpen }) => {
  const { dataPending, fnConfirm } = data;
  const [selected, setSelected] = useState([]);

  const toggleRow = (row) => {
    setSelected((current) => (
      current.some((item) => item.documentCode === row.documentCode)
        ? current.filter((item) => item.documentCode !== row.documentCode)
        : [...current, row]
    ));
  }

  const fnAccept = () => {
    fnConfirm(selected);
    setSelected([]);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th />
                  <th>{IntlMessages("table.column.date")}</th>
                  <th>{IntlMessages("table.column.noInvoice")}</th>
                  <th>{IntlMessages("page.creditNotesProv.modal.unpaidBills.invoiceBalance")}</th>
                </tr>
              </thead>
              <tbody>
                {dataPending.map((item, idx) => (
                  <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => toggleRow(item)}>
                    <td>
                      <input type="checkbox" checked={selected.some((sel) => sel.documentCode === item.documentCode)} readOnly />
                    </td>
                    <td>{item.date}</td>
                    <td>{item.documentCode}</td>
                    <td align="right">{formatNumber(item.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAccept} disabled={selected.length === 0}>
          <i className="bi bi-check-lg" /> {IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalUnpaidBill;
