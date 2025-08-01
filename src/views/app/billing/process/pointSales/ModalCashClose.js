import React, { useState, useEffect } from "react";
import { Colxx } from "@/components/common/CustomBootstrap";
import { Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from "reactstrap";
import { formatNumber, IntlMessages, validFloat, validInt } from "@/helpers/Utils";
import { useForm } from "@/hooks";
import { request } from "@/helpers/core";
import { SimpleSelect } from "@/components/simpleSelect";
import { InputField } from "@/components/inputFields";
import { ContainerWithLabel } from "@/components/containerWithLabel";
import notification from '@/containers/ui/Notifications';
import DateCalendar from "@/components/dateCalendar";
import ReactTable from "@/components/reactTable";
import classnames from "classnames";
import SearchSelect from "@/components/SearchSelect/SearchSelect";
import TableButton from "@/components/tableButtons";
import Confirmation from "@/containers/ui/confirmationMsg";
import Modal from "@/components/modal";
import ModalPrintCashClose from "./ModalPrintCashClose";

const ModalCashclose = (props) => {
  const { data, setOpen } = props;
  const { cashId, cashierId, listCashBoxes, listCashiers, printType, setLoading } = data;
  const [activeTab, setActiveTab] = useState("1");
  const [detailPayments, setDetailPayments] = useState([]);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openMsgCancelCashClose, setOpenMsgCancelCashClose] = useState(false);
  const [openMsgSaveCashClose, setOpenMsgSaveCashClose] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const cashCloseValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    idCash: [(val) => validInt(val) > 0, "msg.required.select.cashBox"],
    idCashier: [(val) => validInt(val) > 0, "msg.required.select.cashier"],
    initValue: [(val) => validInt(val) > 0, "msg.required.input.initValue"],
    cashValue: [(val) => validInt(val) > 0, "msg.required.input.cashValue"],
    total: [(val) => validInt(val) > 0, "msg.required.calcCashClose"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: "",
    idCash: cashId,
    idCashier: cashierId,
    initValue: 0,
    cashValue: 0,
    total: 0,
    missingExcess: 0,
    totalSale: 0,
    cashSales: 0,
    creditSales: 0,
    totalDiscounts: 0,
    totalExempt: 0,
    totalTaxed: 0,
    invoiced: 0,
    cancellations: 0,
    expenses: 0
  }, cashCloseValid);

  const { id, date, idCash, idCashier, initValue, cashValue, total, missingExcess, totalSale, cashSales, creditSales, totalDiscounts,
    totalExempt, totalTaxed, invoiced, cancellations, expenses } = formState;

  const { dateValid, idCashValid, idCashierValid, initValueValid, cashValueValid, totalValid } = formValidation;

  const [table, setTable] = useState({
    title: " ",
    columns: [
      { text: IntlMessages("page.pointSales.modal.cashClose.table.date"), dataField: "date", headerStyle: { 'width': '20%' } },
      { text: IntlMessages("page.pointSales.modal.cashClose.table.cashier"), dataField: "cashier", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("page.pointSales.modal.cashClose.table.total"),
        dataField: "totalValue",
        headerStyle: { 'width': '20%' },
        style: { textAlign: 'right' }
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { "width": "20%" }, style: { textAlign: 'right' } }
    ],
    data: [],
    actions: []
  });

  const fnPrintCashClose = () => {
    if (date === "") {
      return
    }
    setOpenModalPrint(true);
  }

  const fnCalcCashClose = (item2 = null) => {
    let closedId = id;
    let dateClose = date;
    let idCashierClose = idCashier;
    let idCashClose = idCash;
    let cashTotal = cashValue;
    if (item2 !== null) {
      closedId = item2.id;
      dateClose = item2.date;
      idCashierClose = item2.idCashier;
      idCashClose = item2.idCash;
      cashTotal = item2.cashValue;
    } else {
      if (idCash === 0) {
        notification('warning', 'msg.required.select.cashBox', 'alert.warning.title');
        return;
      }
      if (idCashier === 0) {
        notification('warning', 'msg.required.select.cashier', 'alert.warning.title');
        return;
      }
      if (initValue === 0) {
        notification('warning', 'msg.required.input.initValue', 'alert.warning.title');
        return;
      }
      if (cashValue === 0) {
        notification('warning', 'msg.required.input.cashValue', 'alert.warning.title');
        return;
      }
    }

    setLoading(true);
    request.GET(`billing/process/cashClose/getDetail?closedId=${closedId}&date=${dateClose}&cashierId=${idCashierClose}&cashId=${idCashClose}`, (resp) => {
      const detailCashClose = resp.data;
      if (detailCashClose.resumeInvoices.length === 0 && item2 === null) {
        notification('warning', 'msg.alert.cashCloseAplly', 'alert.warning.title');
        setLoading(false);
        return;
      }
      const totalInvoiced = detailCashClose.resumeInvoices.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);
      const totalCashSales = detailCashClose.resumeTypeInvoices.map(item => {
        item.total2 = item.documentType === 1 ? validFloat(item.total) : 0;
        return item.total2;
      }).reduce((prev, curr) => prev + curr, 0);
      const totalCreditSales = detailCashClose.resumeTypeInvoices.map(item => {
        item.total3 = item.documentType === 2 ? validFloat(item.total) : 0;
        return item.total3;
      }).reduce((prev, curr) => prev + curr, 0);
      const totalDiscount = detailCashClose.resumeInvoices.map(item => validFloat(item.discountValue)).reduce((prev, curr) => prev + curr, 0);
      const exempt = detailCashClose.resumeInvoices.map(item => validFloat(item.subTotExeValue)).reduce((prev, curr) => prev + curr, 0);
      const taxed = detailCashClose.resumeInvoices.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
      const totalCancel = detailCashClose.resumeCancela.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
      const totalExpense = detailCashClose.resumeExpenses.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
      const viewData = {
        totalSale: totalInvoiced,
        cashSales: totalCashSales,
        creditSales: totalCreditSales,
        totalDiscounts: totalDiscount,
        totalExempt: exempt,
        totalTaxed: taxed,
        invoiced: totalCashSales,
        cancellations: totalCancel,
        expenses: totalExpense,
        total: totalCashSales,
        missingExcess: cashTotal - totalCashSales,
        date: dateClose,
        idCash: idCashClose,
        idCashier: idCashierClose
      };
      if (item2 !== null) {
        viewData.id = item2.id
        viewData.initValue = item2.initValue
        viewData.cashValue = item2.cashValue
      }
      setDetailPayments(detailCashClose.detailForPaymentMethod);
      setBulkForm(viewData);
      setActiveTab("1");
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnViewCashClose = (item) => {
    fnCalcCashClose(item);
  }

  const fnCancelCashClose = (idCashClose) => {
    if (idCashClose > 0) {
      setOpenMsgCancelCashClose(true);
      onInputChange({ target: { name: "id", value: idCashClose } });
    }
  }

  const fnGetCashClose = () => {
    setLoading(true);
    request.GET('billing/process/cashClose', (resp) => {
      const cashClose = resp.data.map((item) => {
        item.cashier = item.adminUser.name
        item.idCash = item.cashId
        item.idCashier = item.cashierId
        item.missingExcess = validFloat(item.cashValue - item.total)
        item.totalValue = formatNumber(item.total, '', 2)
        item.options = <><TableButton color='primary' icon='eye' fnOnClick={() => fnViewCashClose(item)} />
          <TableButton color='danger' icon='bi bi-x-circle' fnOnClick={() => fnCancelCashClose(item.id)} /></>
        return item;
      });
      const tableData = {
        ...table, data: cashClose
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnOkCancelCashClose = () => {
    const dataCancel = {
      status: 0
    }
    setLoading(true);
    request.PUT(`billing/process/cashClose/${id}`, dataCancel, (resp) => {
      console.log(resp);
      fnGetCashClose();
      setOpenMsgCancelCashClose(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnNewCashClose = () => {
    setDetailPayments([]);
    onResetForm();
    setSendForm(false);
  }

  const fnSaveCashClose = () => {
    if (id > 0) {
      notification('warning', 'msg.alert.cashCloseSaved', 'alert.warning.title');
      return;
    }
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    setOpenMsgSaveCashClose(true);
  }

  const fnOkSaveCashClose = () => {
    const newData = {
      date,
      cashId: idCash,
      cashierId: idCashier,
      initValue: validFloat(initValue),
      cashValue: validFloat(cashValue),
      total: validFloat(total),
      isClose: 1,
      status: 1
    }
    request.POST(`billing/process/cashClose`, newData, (resp) => {
      console.log(resp);
      fnGetCashClose();
      setOpenMsgSaveCashClose(false);
      setOpen(false);
      localStorage.setItem('dataCashBox_current', JSON.stringify({}));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetCashClose();
  }, []);

  const propsToModalPrint = {
    ModalContent: ModalPrintCashClose,
    title: "page.pointSales.modal.printCashClose.title",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: 'md',
    data: {
      id,
      date,
      idCashier,
      listCashBoxes,
      idCash,
      listCashiers,
      initValue,
      cashValue,
      total,
      missingExcess,
      printType,
      setLoading
    }
  }

  const propsToMsgCancelCashClose = {
    open: openMsgCancelCashClose,
    setOpen: setOpenMsgCancelCashClose,
    fnOnOk: fnOkCancelCashClose,
    title: "msg.question.cancel.document.title",
    fnOnNo: onResetForm
  }

  const propsToMsgSaveCashClose = {
    open: openMsgSaveCashClose,
    setOpen: setOpenMsgSaveCashClose,
    fnOnOk: fnOkSaveCashClose,
    title: "msg.question.save.document.title"
  }

  return (
    <>
      <ModalBody>
        <Nav tabs className="separator-tabs ml-0 mb-2">
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '1',
                'nav-link': true,
              })}
              onClick={() => setActiveTab('1')}
            >
              {IntlMessages("page.pointSales.modal.cashClose.title.currentClose")}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '2',
                'nav-link': true,
              })}
              onClick={() => setActiveTab('2')}
            >
              {IntlMessages("page.pointSales.modal.cashClose.title.performedClose")}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnNewCashClose}>
                  <i className="bi bi-file-earmark-plus" />{IntlMessages("button.new")}
                </Button>
                <Button color="primary" onClick={() => fnCalcCashClose()}>
                  <i className="iconsminds-calculator" />{IntlMessages("button.calcCashClose")}
                </Button>
                <Button color="info" onClick={fnPrintCashClose}>
                  <i className="iconsminds-printer" />{IntlMessages("button.print")}
                </Button>
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx xxs="12" md="6">
                <Row>
                  <Colxx xxs="12" sm="6" md="12">
                    <DateCalendar
                      value={date}
                      name="date"
                      onChange={onInputChange}
                      label="page.pointSales.modal.cashClose.input.dateClosing"
                      invalid={sendForm && !!dateValid}
                      feedbackText={sendForm && (dateValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" md="12">
                    <SimpleSelect
                      name="idCash"
                      label="page.pointSales.modal.cashClose.input.cash"
                      value={idCash}
                      onChange={onInputChange}
                      options={listCashBoxes}
                      invalid={sendForm && !!idCashValid}
                      feedbackText={sendForm && (idCashValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" sm="6" md="12">
                    <SearchSelect
                      label='page.invoicing.select.sellerId'
                      name='idCashier'
                      inputValue={idCashier}
                      onChange={onInputChange}
                      options={listCashiers}
                      invalid={sendForm && !!idCashierValid}
                      feedbackText={sendForm && (idCashierValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="4" sm="3" md="6">
                    <InputField
                      name="initValue"
                      label="page.pointSales.modal.cashClose.input.initValue"
                      value={initValue}
                      onChange={onInputChange}
                      type="number"
                      invalid={sendForm && !!initValueValid}
                      feedbackText={sendForm && (initValueValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="4" sm="3" md="6">
                    <InputField
                      value={cashValue}
                      name="cashValue"
                      onChange={onInputChange}
                      type="number"
                      label="page.pointSales.modal.cashClose.input.totalCash"
                      invalid={sendForm && !!cashValueValid}
                      feedbackText={sendForm && (cashValueValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="4" sm="3" md="6">
                    <InputField
                      value={formatNumber(total)}
                      name="total"
                      onChange={onInputChange}
                      disabled
                      type="text"
                      label="page.pointSales.modal.cashClose.input.totalInCash"
                      invalid={sendForm && !!totalValid}
                      feedbackText={sendForm && (totalValid || null)}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="4" sm="3" md="6">
                    <InputField
                      value={formatNumber(missingExcess)}
                      name="missingExcess"
                      onChange={onInputChange}
                      disabled
                      type="text"
                      label="page.pointSales.modal.cashClose.input.missingExcess"
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <ContainerWithLabel label="page.pointSales.modal.cashClose.tableDetail.title">
                      <Table bordered hover size="sm">
                        <thead>
                          <tr>
                            <th align="center">{IntlMessages("page.pointSales.modal.cashClose.tableDetail.description")}</th>
                            <th align="center">{IntlMessages("page.pointSales.modal.cashClose.tableDetail.value")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            detailPayments.map((item) => {
                              return (
                                <tr key={item.paymentMethodId}>
                                  <td>{item.paymentTypeDetail.description}</td>
                                  <td align="right">{formatNumber(item.value)}</td>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                        <tfoot>
                          <tr>
                            <th scope="row">Total</th>
                            <td align="right">{formatNumber(total, 'L. ', 2)}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    </ContainerWithLabel>
                  </Colxx>
                </Row>
              </Colxx>
              <Colxx xxs="12" md="6">
                <ContainerWithLabel label="page.pointSales.modal.cashClose.summary.title">
                  <Row>
                    <Colxx xxs="12" xs="6">
                      <Row>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(totalSale)}
                            name="totalSale"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.totalSale"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(cashSales)}
                            name="cashSales"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.cashSales"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(creditSales)}
                            name="creditSales"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.creditSales"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(totalDiscounts)}
                            name="totalDiscounts"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.totalDiscounts"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(totalExempt)}
                            name="totalExempt"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.totalExempt"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(totalTaxed)}
                            name="totalTaxed"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.totalTaxed"
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx xxs="12" xs="6">
                      <Row>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(total)}
                            name="total"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.totalInCash"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(invoiced)}
                            name="invoiced"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.invoiced"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(cancellations)}
                            name="cancellations"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.cancellations"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={formatNumber(expenses)}
                            name="expenses"
                            onChange={onInputChange}
                            disabled
                            type="text"
                            label="page.pointSales.modal.cashClose.input.expenses"
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Colxx xxs="12">
                <ReactTable {...table} />
              </Colxx>
            </Row>
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" style={{ display: activeTab === "2" ? 'none' : 'block' }} onClick={fnSaveCashClose}>
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalPrint} />
      <Confirmation {...propsToMsgCancelCashClose} />
      <Confirmation {...propsToMsgSaveCashClose} />
    </>
  )
}

export default ModalCashclose;