import React, { useEffect, useState } from "react"
import { Colxx } from "@/components/common/CustomBootstrap";
import { useForm } from "@/hooks";
import { IntlMessages } from "@/helpers/Utils";
import { Button, CardTitle, ModalBody, ModalFooter, Nav, NavItem, NavLink, Row, TabContent, TabPane } from "reactstrap";
import { EditValuesTable } from "@/components/editValuesTable";
import { ContainerWithLabel } from "@/components/containerWithLabel";
import { SimpleSelect } from "@/components/simpleSelect";
import { ReactTableEdit } from "@/components/reactTableEdit";
import { InputField } from "@/components/inputFields";
import { request } from "@/helpers/core";
import SearchSelect from "@/components/SearchSelect/SearchSelect";
import DateCalendar from "@/components/dateCalendar";
import classnames from "classnames";
import ReactTable from "@/components/reactTable";
import TableButtons from "@/components/tableButtons";
import Modal from "@/components/modal";
import ModalTypeSheet from "@/components/modalTypeSheet";
import ModalConcepts from "./ModalConcepts";
import ModalUnpaidBills from "./ModalUnpaidBills";

const ModalCancellations = (props) => {
  const { data, setOpen } = props;
  const { cashId, cashierId, listTypeDocuments, listCustomers, listCashBoxes, listCashiers, listTypePayments, setListTypePayments,
    listLedgerAccount, printType, setLoading, userData } = data;
  const [activeTab, setActiveTab] = useState("1");
  const [openModalConcepts, setOpenModalConcepts] = useState(false);
  const [openModalUnpaidBills, setOpenModalUnpaidBills] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [listDocCancel, setListDocCancel] = useState([]);
  const [typeSheet, setTypeSheet] = useState(printType);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentCode: "",
    customerId: 0,
    reference: "",
    date: "",
    description: "",
    difference: 0,
    ctaDiffId: ""
  });

  const { id, documentCode, customerId, reference, date, description, difference, ctaDiffId } = formState;

  const [table, setTable] = useState({
    title: "",
    columns: [
      { text: IntlMessages("page.pointSales.modal.cancellations.table.date"), dataField: "date", headerStyle: { 'width': "15%" } },
      { text: IntlMessages("page.pointSales.modal.cancellations.table.document"), dataField: "documentCode", headerStyle: { 'width': "15%" } },
      { text: IntlMessages("page.pointSales.modal.cancellations.table.number"), dataField: "documentId", headerStyle: { 'width': "10%" } },
      { text: IntlMessages("page.pointSales.modal.cancellations.table.customer"), dataField: "facCliente.name", headerStyle: { 'width': "45%" } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { "width": "15%" }, style: { textAlign: 'right' } }
    ],
    data: [],
    actions: []
  });

  const [tableDocuments, setTableDocuments] = useState({
    title: IntlMessages("page.pointSales.modal.cancellations.title.documents"),
    columns: [
      {
        label: "page.pointSales.modal.cancellations.tableDocuments.document", field: "document",
        headerStyle: {
          textAlign: 'center',
          width: '50%'
        },
        bodyStyle: {
          width: '50%'
        }
      },
      {
        label: "page.pointSales.modal.cancellations.tableDocuments.balance", field: "balance",
        headerStyle: {
          textAlign: 'center',
          width: '25%'
        },
        bodyStyle: {
          width: '25%'
        }
      },
      {
        label: "page.pointSales.modal.cancellations.tableDocuments.canceled", field: "valuePaid", isEditable: true,
        headerStyle: {
          textAlign: 'center',
          width: '25%'
        },
        bodyStyle: {
          width: '25%',
          textAlign: 'right',
        }
      }
    ],
    data: listDocCancel,
    onChangeData: setListDocCancel,
    options: {
      columnActions: "options",
      tableHeight: '90px'
    }
  });

  const fnAddDocument = () => {
    setOpenModalUnpaidBills(true);
  }

  const fnNewCancellation = () => {
    onResetForm();
    const clearListTypePayments = listTypePayments.map(elem => {
      elem.value = 0;
      return elem;
    });
    setListTypePayments(clearListTypePayments);
  }

  const fnPrintCancellation = () => {
    if (id > 0) {
      setOpenModalPrint(true);
    }
  }

  const fnPrintDocument = () => {
    const dataPrint = {
      id,
      userName: userData.name,
      typePrint: typeSheet
    }
    request.GETPdf('billing/process/cancellations/exportPDFReceipt', dataPrint, 'Recibo de Cancelacion.pdf', (err) => {
      console.error(err);
      setLoading(false);
      setOpenModalPrint(false);
    });
  }

  const fnViewCancellation = (viewItem) => {
    setBulkForm(viewItem);
    let clearListTypePayments = listTypePayments.map(elem => {
      elem.value = 0;
      return elem;
    });
    setListTypePayments(clearListTypePayments);
    request.GET(`billing/process/cancellationPyments?idFather=${viewItem.id}`, (resp) => {
      resp.data.map((item) => {
        clearListTypePayments = clearListTypePayments.map((item2) => {
          if (item.paymentMethodId === item2.id) {
            item2.value = parseFloat(item.value);
          }
          return item2;
        });
        return item;
      });
      setListTypePayments(clearListTypePayments);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    setActiveTab("1");
  }

  const fnCancelCancellation = () => { }

  const fnGetCancellations = () => {
    setLoading(true);
    request.GET('billing/process/cancellations', (resp) => {
      const cancellations = resp.data.map((item) => {
        item.options = <><TableButtons color='primary' icon='eye' fnOnClick={() => fnViewCancellation(item)} />
          <TableButtons color='danger' icon='bi bi-x-circle' fnOnClick={() => fnCancelCancellation(item.id)} /></>
        return item;
      });
      const tableData = {
        ...table, data: cancellations
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnConcepts = () => {
    setOpenModalConcepts(true);
  }

  useEffect(() => {
    fnGetCancellations();
    fnNewCancellation();
  }, []);

  const propsToModalConcepts = {
    ModalContent: ModalConcepts,
    title: "page.pointSales.modal.concepts.title",
    open: openModalConcepts,
    setOpen: setOpenModalConcepts,
    maxWidth: "md",
    data: {
      setLoading
    }
  }

  const propsToModalUnpaidBills = {
    ModalContent: ModalUnpaidBills,
    title: "page.pointSales.modal.unpaidBills.title",
    open: openModalUnpaidBills,
    setOpen: setOpenModalUnpaidBills,
    maxWidth: "lg",
    data: {
      setLoading
    }
  }

  const propsToModalPrint = {
    ModalContent: ModalTypeSheet,
    title: "page.pointSales.modal.printCancellations.title",
    open: openModalPrint,
    setOpen: setOpenModalPrint,
    maxWidth: "sm",
    data: {
      typeSheet,
      setTypeSheet,
      disabledOpt: 2,
      fnPrintDocument
    }
  }

  const propsToTableTypePayments = {
    optionsTitle: "page.invoicing.modal.generateQuotation.input.paymentMethod",
    valuesTitle: "page.workOrders.detail.payment.value",
    totalTitle: "page.workOrders.detail.payment.total",
    listOptions: listTypePayments,
    setListValues: setListTypePayments,
    showTotal: true
  }

  return (
    <>
      <ModalBody>
        <Nav tabs className="separator-tabs ml-0 mb-3">
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === '1',
                'nav-link': true,
              })}
              onClick={() => setActiveTab('1')}
            >
              {IntlMessages("page.pointSales.modal.cancellations.title.currentCancel")}
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
              {IntlMessages("page.pointSales.modal.cancellations.title.customerCancel")}
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Row>
              <Colxx xxs="12" className="div-action-button-container">
                <Button color="secondary" onClick={fnNewCancellation}>
                  <i className="bi bi-file-earmark-plus" />{IntlMessages("button.new")}
                </Button>
                <Button color="primary" onClick={fnPrintCancellation}>
                  <i className="iconsminds-printer" />{IntlMessages("button.print")}
                </Button>
                <Button color="info">
                  <i className="iconsminds-calculator" />{IntlMessages("button.count")}
                </Button>
              </Colxx>
            </Row>
            <Row className="mt-3">
              <Colxx xxs="12" md="6">
                <Row>
                  <Colxx xxs="12" xs="6">
                    <SimpleSelect
                      name="cashId"
                      label="page.pointSales.modal.cashClose.input.cash"
                      value={cashId}
                      disabled
                      options={listCashBoxes}
                    />
                  </Colxx>
                  <Colxx xxs="12" xs="6">
                    <SearchSelect
                      label='page.invoicing.select.sellerId'
                      name='cashierId'
                      inputValue={cashierId}
                      options={listCashiers}
                      isDisabled
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <SimpleSelect
                      name="documentCode"
                      label="page.pointSales.modal.cancellations.select.documentCode"
                      value={documentCode}
                      onChange={onInputChange}
                      options={listTypeDocuments}
                    />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <ContainerWithLabel label="page.invoicing.title.customer">
                      <Row>
                        <Colxx xxs="12" sm="6" md="12">
                          <SearchSelect
                            label='page.invoicing.select.customerId'
                            name='customerId'
                            inputValue={customerId}
                            onChange={onInputChange}
                            options={listCustomers}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" md="12">
                          <InputField
                            value={reference}
                            name="reference"
                            onChange={onInputChange}
                            type="text"
                            label="page.invoicing.input.reference"
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
                  </Colxx>
                  <Colxx xxs="12">
                    <ContainerWithLabel label="page.pointSales.modal.cancellations.title.detail">
                      <Row>
                        <Colxx xxs="12" sm="6" md="12">
                          <DateCalendar
                            value={date}
                            name="date"
                            onChange={onInputChange}
                            label="page.pointSales.modal.cancellations.input.date"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" md="12">
                          <InputField
                            value={description}
                            name="description"
                            onChange={onInputChange}
                            type="text"
                            label="page.pointSales.modal.cancellations.input.description"
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
                  </Colxx>
                </Row>
                <Row className="mb-2">
                  <Colxx xxs="12" align="right">
                    <Button color="primary" onClick={() => { fnAddDocument() }}>
                      <i className='bi bi-plus' /> {IntlMessages("button.add")}
                    </Button>
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <ReactTableEdit {...tableDocuments} />
                  </Colxx>
                </Row>
              </Colxx>
              <Colxx xxs="12" md="6">
                <Row>
                  <Colxx xxs="12">
                    <CardTitle>{IntlMessages("page.pointSales.modal.cancellations.title.paymentMethods")}</CardTitle>
                    <EditValuesTable {...propsToTableTypePayments} />
                  </Colxx>
                </Row>
                <Row>
                  <Colxx xxs="12">
                    <ContainerWithLabel label="page.pointSales.modal.cancellations.differentialDetail">
                      <Row>
                        <Colxx xxs="12" md="5">
                          <InputField
                            name="difference"
                            label="page.pointSales.modal.cancellations.input.difference"
                            value={difference}
                            onChange={onInputChange}
                            type="text"
                            disabled
                          />
                        </Colxx>
                        <Colxx xxs="12" md="7" className="mb-3">
                          <Button color="info" onClick={fnConcepts}>
                            <i className="iconsminds-book" />{IntlMessages("button.concepts")}
                          </Button>
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <SearchSelect
                            label="page.pointSales.modal.cancellations.select.ledgerAccount"
                            name="ctaDiffId"
                            inputValue={ctaDiffId}
                            options={listLedgerAccount}
                            onChange={onInputChange}
                          />
                        </Colxx>
                      </Row>
                    </ContainerWithLabel>
                  </Colxx>
                </Row>
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
        <Button color="primary">
          <i className="iconsminds-save" />{IntlMessages("button.save")}
        </Button>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Modal {...propsToModalConcepts} />
      <Modal {...propsToModalUnpaidBills} />
      <Modal {...propsToModalPrint} />
    </>
  )
}

export default ModalCancellations;