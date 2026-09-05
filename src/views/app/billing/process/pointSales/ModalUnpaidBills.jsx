import { Colxx } from "@Components/common/CustomBootstrap";
import { ReactTableEdit } from "@Components/reactTableEdit";
import { useEffect, useState } from "react"
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { IntlMessages, formatNumber, validFloat } from "@Helpers/Utils";
import { request, buildUrl } from "@Helpers/core";
import notification from '@Containers/ui/Notifications';

const ModalUnpaidBills = (props) => {
  const { data, setOpen } = props;
  const { customerId, fnAddDocuments, setLoading } = data;

  const [dataUnpaidBills, setDataUnpaidBills] = useState([]);

  useEffect(() => {
    if (!customerId) {
      setDataUnpaidBills([]);
      return;
    }
    setLoading(true);
    request.GET(buildUrl('accounting/process/cxc/pendingByCustomer', { customerId }), (resp) => {
      const pending = resp.data.map((item) => ({
        id: item.id,
        date: item.date,
        noInvoice: item.documentCode,
        customer: '',
        invoiceBalance: formatNumber(item.balance),
        balance: validFloat(item.balance),
        valuePaid: 0
      }));
      setDataUnpaidBills(pending);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }, [customerId]);

  const fnSave = () => {
    const selected = dataUnpaidBills.filter((item) => validFloat(item.valuePaid) > 0);
    if (selected.length === 0) {
      notification('warning', 'page.pointSales.modal.unpaidBills.validation.noSelection', 'alert.warning.title');
      return;
    }
    const overpaid = selected.find((item) => validFloat(item.valuePaid) > item.balance);
    if (overpaid) {
      notification('warning', 'page.pointSales.modal.unpaidBills.validation.overpaid', 'alert.warning.title');
      return;
    }
    fnAddDocuments(selected.map((item) => ({
      id: item.id,
      documentCode: item.noInvoice,
      originalValue: item.balance,
      valuePaid: validFloat(item.valuePaid)
    })));
    setOpen(false);
  }

  const table = {
    title: IntlMessages("page.pointSales.modal.unpaidBills.table.title"),
    columns: [
      {
        label: "page.pointSales.modal.unpaidBills.table.date", field: "date",
        headerStyle: { textAlign: 'center', width: '15%' },
        bodyStyle: { width: '15%' }
      },
      {
        label: "page.pointSales.modal.unpaidBills.table.noInvoice", field: "noInvoice",
        headerStyle: { textAlign: 'center', width: '30%' },
        bodyStyle: { width: '30%' }
      },
      {
        label: "page.pointSales.modal.unpaidBills.table.invoiceBalance", field: "invoiceBalance",
        headerStyle: { textAlign: 'center', width: '25%' },
        bodyStyle: { width: '25%', textAlign: 'right' }
      },
      {
        label: "page.pointSales.modal.unpaidBills.table.valuePaid", field: "valuePaid", isEditable: true,
        headerStyle: { textAlign: 'center', width: '30%' },
        bodyStyle: { width: '30%' }
      }
    ],
    data: dataUnpaidBills,
    onChangeData: setDataUnpaidBills,
    options: {
      columnActions: "options",
      tableHeight: '300px'
    }
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTableEdit {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalUnpaidBills;