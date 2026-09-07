import { useState, useEffect } from "react";
import { Colxx } from "@Components/common/CustomBootstrap";
import { Badge, Button, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, Table, TabPane } from "reactstrap";
import { formatNumber, IntlMessages, validFloat, validInt } from "@Helpers/Utils";
import { useForm } from "@Hooks";
import { request, buildUrl } from "@Helpers/core";
import { SimpleSelect } from "@Components/simpleSelect";
import { Checkbox } from "@Components/checkbox";
import { InputField } from "@Components/inputFields";
import { ContainerWithLabel } from "@Components/containerWithLabel";
import notification from '@Containers/ui/Notifications';
import DateCalendar from "@Components/dateCalendar";
import ReactTable from "@Components/reactTable";
import classnames from "classnames";
import SearchSelect from "@Components/SearchSelect/SearchSelect";
import TableButton from "@Components/tableButtons";
import Confirmation from "@Containers/ui/confirmationMsg";
import Modal from "@Components/modal";
import ModalPrintCashClose from "./ModalPrintCashClose";

const ModalCashclose = (props) => {
  const { data, setOpen } = props;
  const { cashId, cashierId, listCashBoxes, listCashiers, printType, setLoading } = data;
  const [activeTab, setActiveTab] = useState("1");
  const [detailPayments, setDetailPayments] = useState([]);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [openMsgCancelCashClose, setOpenMsgCancelCashClose] = useState(false);
  const [openMsgSaveCashClose, setOpenMsgSaveCashClose] = useState(false);
  const [openMsgApplyCashClose, setOpenMsgApplyCashClose] = useState(false);
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
    expenses: 0,
    allCashiers: 0,
    othersIn: 0,
    othersOut: 0,
    depositNumber: "",
    depositValue: 0,
    isApplied: 0
  }, cashCloseValid);

  const { id, date, idCash, idCashier, initValue, cashValue, total, missingExcess, totalSale, cashSales, creditSales, totalDiscounts,
    totalExempt, totalTaxed, invoiced, cancellations, expenses, allCashiers, othersIn, othersOut, depositNumber, depositValue, isApplied } = formState;

  const { dateValid, idCashValid, idCashierValid, initValueValid, cashValueValid, totalValid } = formValidation;

  // Mantiene "Total en Caja (Teórico)" y "Faltante/Sobrante" en sincronía si el usuario edita
  // Valor Inicial, Total Efectivo, Otras Entradas u Otras Salidas después de Calcular Cierre —
  // `invoiced`/`cancellations` ya son la porción en efectivo real (ver fnCalcCashClose).
  useEffect(() => {
    const theoreticalTotal = validFloat(initValue) + validFloat(invoiced) + validFloat(cancellations)
      + validFloat(othersIn) - validFloat(expenses) - validFloat(othersOut);
    const excess = validFloat(cashValue) - theoreticalTotal;
    if (theoreticalTotal !== total || excess !== missingExcess) {
      setBulkForm({ total: theoreticalTotal, missingExcess: excess });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initValue, cashValue, invoiced, cancellations, expenses, othersIn, othersOut]);

  const [table, setTable] = useState({
    title: " ",
    columns: [
      { text: IntlMessages("page.pointSales.modal.cashClose.table.date"), dataField: "date", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.pointSales.modal.cashClose.table.cashier"), dataField: "cashier", headerStyle: { 'width': '30%' } },
      {
        text: IntlMessages("page.pointSales.modal.cashClose.table.total"),
        dataField: "totalValue",
        headerStyle: { 'width': '15%' },
        style: { textAlign: 'right' }
      },
      {
        text: IntlMessages("page.pointSales.modal.cashClose.table.status"),
        dataField: "isClose",
        headerStyle: { 'width': '15%' },
        style: { textAlign: 'center' },
        // Este ReactTable usa la API de tanstack-table (`cell`), no `formatter` (prop
        // muerta de una versión anterior). IntlMessages usa el hook useIntl(): acá es
        // seguro porque `cell` lo ejecuta la tabla durante su propio render, no en el
        // callback async de fnGetCashClose (eso rompía las reglas de hooks y dejaba la
        // tabla vacía).
        cell: ({ row }) => (
          <Badge color={validInt(row.original.isClose) === 1 ? 'success' : 'warning'} pill>
            {IntlMessages(validInt(row.original.isClose) === 1 ? 'page.pointSales.modal.cashClose.status.applied' : 'page.pointSales.modal.cashClose.status.pending')}
          </Badge>
        )
      },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { "width": "25%" }, style: { textAlign: 'right' } }
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
    let allCashiersFlag = allCashiers;
    let initValueClose = initValue;
    let othersInClose = othersIn;
    let othersOutClose = othersOut;
    if (item2 !== null) {
      closedId = item2.id;
      dateClose = item2.date;
      idCashierClose = item2.idCashier;
      idCashClose = item2.idCash;
      cashTotal = item2.cashValue;
      allCashiersFlag = item2.allCashiers;
      initValueClose = item2.initValue;
      othersInClose = item2.othersIn;
      othersOutClose = item2.othersOut;
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

    // "Todos los Cajeros": se omite cashierId del query — findResumeCalculate/etc. agrupan
    // por cajero igual, y el .reduce() de más abajo ya suma todas las filas que devuelvan.
    const detailQuery = allCashiersFlag
      ? { closedId, date: dateClose, cashId: idCashClose }
      : { closedId, date: dateClose, cashierId: idCashierClose, cashId: idCashClose };

    setLoading(true);
    request.GET(buildUrl('billing/process/cashClose/getDetail', detailQuery), (resp) => {
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
      // resumeExpenses trae Entradas (movementType 1) y Salidas (movementType 2) por separado —
      // solo las Salidas son "Gastos" que reducen la caja, una Entrada la reintegra.
      const totalExpense = detailCashClose.resumeExpenses
        .map(item => validInt(item.movementType) === 2 ? validFloat(item.value) : -validFloat(item.value))
        .reduce((prev, curr) => prev + curr, 0);

      // "Ventas al Contado" es por TIPO DE VENTA (Contado/Crédito del documento), no por
      // instrumento de pago — una factura Contado puede pagarse por transferencia, tarjeta, etc.
      // Para la conciliación de caja (efectivo real) hay que quedarse solo con las filas de
      // forma de pago/cancelación cuya cuenta contable coincide con la cuenta de efectivo de
      // ESTA caja registradora (fac_formaspagctas.numcta === fac_cajas.numcta_caja), igual que
      // se resolvió para Salidas/Entradas de Efectivo.
      const selectedCashBox = listCashBoxes.find(item => validInt(item.id) === validInt(idCashClose));
      const cashAccount = selectedCashBox ? selectedCashBox.idCtaCash : null;
      const cashFromSales = detailCashClose.detailForPaymentMethod
        .filter(item => cashAccount && item.paymentTypeDetail?.idCtaCont === cashAccount)
        .map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
      const cashFromCancellations = (detailCashClose.resumeCancela || [])
        .filter(item => cashAccount && item.paymentTypeDetail?.idCtaCont === cashAccount)
        .map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);

      // Total en Caja (teórico) = fondo inicial + efectivo real de ventas/cancelaciones +
      // otras entradas manuales - gastos (neto Salida-Entrada) - otras salidas manuales.
      // Faltante/Sobrante = Total Efectivo contado físicamente - Total en Caja (teórico).
      const theoreticalTotal = validFloat(initValueClose) + cashFromSales + cashFromCancellations
        + validFloat(othersInClose) - totalExpense - validFloat(othersOutClose);

      const viewData = {
        totalSale: totalInvoiced,
        cashSales: totalCashSales,
        creditSales: totalCreditSales,
        totalDiscounts: totalDiscount,
        totalExempt: exempt,
        totalTaxed: taxed,
        invoiced: cashFromSales,
        cancellations: cashFromCancellations,
        expenses: totalExpense,
        total: theoreticalTotal,
        missingExcess: cashTotal - theoreticalTotal,
        date: dateClose,
        idCash: idCashClose,
        idCashier: idCashierClose
      };
      if (item2 !== null) {
        viewData.id = item2.id
        viewData.initValue = item2.initValue
        viewData.cashValue = item2.cashValue
        viewData.allCashiers = item2.allCashiers
        viewData.othersIn = item2.othersIn
        viewData.othersOut = item2.othersOut
        viewData.depositNumber = item2.depositNumber
        viewData.depositValue = item2.depositValue
        viewData.isApplied = item2.isClose
      }
      setDetailPayments(detailCashClose.detailForPaymentMethod);
      setBulkForm(viewData);
      setActiveTab("1");
      setLoading(false);
    }, (err) => {

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

      setLoading(false);
    });
  }

  // Reversión (no borrado, a diferencia del legacy que hacía DELETE del registro de
  // cierre): revierte closedId a 0 en facturas/gastos/cancelaciones etiquetadas a este
  // cierre y lo marca status:0/aplica:0 — mismo criterio de reversión no destructiva ya
  // usado en Anular Documento y Anular Salida/Entrada de Efectivo esta migración.
  const fnOkCancelCashClose = () => {
    setLoading(true);
    request.DELETE(`billing/process/pointSales/cashCloseApply/${id}`, () => {
      fnGetCashClose();
      onResetForm();
      setOpenMsgCancelCashClose(false);
      notification('success', 'msg.success.voidCashClose', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      notification('error', 'msg.delete.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
  }

  const fnApplyCashClose = () => {
    if (id === 0 || validInt(isApplied) === 1) {
      return;
    }
    setOpenMsgApplyCashClose(true);
  }

  const fnOkApplyCashClose = () => {
    setLoading(true);
    request.POST(`billing/process/pointSales/cashCloseApply/${id}`, {}, () => {
      fnGetCashClose();
      setOpenMsgApplyCashClose(false);
      setOpen(false);
      localStorage.setItem('dataCashBox_current', JSON.stringify({}));
      notification('success', 'msg.success.applyCashClose', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      notification('error', 'msg.save.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
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

  // Guardar solo graba los números calculados (aplica/isClose queda en 0) — separado de
  // Aplicar, que es lo que realmente etiqueta closedId en facturas/gastos/cancelaciones y
  // bloquea el día. Mismo criterio que btnSaveDocument/btnContabDocument en
  // fac_pos_close.scx (dos pasos distintos, no uno solo).
  const fnOkSaveCashClose = () => {
    const newData = {
      date,
      cashId: idCash,
      cashierId: idCashier,
      initValue: validFloat(initValue),
      cashValue: validFloat(cashValue),
      total: validFloat(total),
      othersIn: validFloat(othersIn),
      othersOut: validFloat(othersOut),
      allCashiers: allCashiers ? 1 : 0,
      depositNumber,
      depositValue: validFloat(depositValue),
      status: 1
    }
    setLoading(true);
    request.POST(`billing/process/cashClose`, newData, (resp) => {
      setBulkForm({ id: resp.data.id, isApplied: 0 });
      fnGetCashClose();
      setOpenMsgSaveCashClose(false);
      setLoading(false);
    }, (err) => {

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

  const propsToMsgApplyCashClose = {
    open: openMsgApplyCashClose,
    setOpen: setOpenMsgApplyCashClose,
    fnOnOk: fnOkApplyCashClose,
    title: "msg.question.applyCashClose.title"
  }

  return (
    <>
      <ModalBody>
        <Nav tabs className="separator-tabs ms-0 mb-2">
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
                <Button color="success" disabled={id === 0 || validInt(isApplied) === 1} onClick={fnApplyCashClose}>
                  <i className="bi bi-check2-circle" />{IntlMessages("button.applyCashClose")}
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
                  <Colxx xxs="12">
                    <Checkbox
                      onChange={onInputChange}
                      name="allCashiers"
                      value={allCashiers}
                      label="page.pointSales.modal.cashClose.check.allCashiers"
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
                  <Colxx xxs="12" xs="6" sm="6" md="6">
                    <InputField
                      value={depositNumber}
                      name="depositNumber"
                      onChange={onInputChange}
                      type="text"
                      label="page.pointSales.modal.cashClose.input.depositNumber"
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6" sm="6" md="6">
                    <InputField
                      value={depositValue}
                      name="depositValue"
                      onChange={onInputChange}
                      type="number"
                      label="page.pointSales.modal.cashClose.input.depositValue"
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
                            <td align="right">{formatNumber(detailPayments.reduce((prev, curr) => prev + validFloat(curr.value), 0), 'L. ', 2)}</td>
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
                        <Colxx xxs="12">
                          <InputField
                            value={othersIn}
                            name="othersIn"
                            onChange={onInputChange}
                            type="number"
                            label="page.pointSales.modal.cashClose.input.othersIn"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={othersOut}
                            name="othersOut"
                            onChange={onInputChange}
                            type="number"
                            label="page.pointSales.modal.cashClose.input.othersOut"
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
      <Confirmation {...propsToMsgApplyCashClose} />
    </>
  )
}

export default ModalCashclose;