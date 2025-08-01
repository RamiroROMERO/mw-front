import React, { useEffect, useState } from 'react';
import { Row, Card, CardBody, FormGroup, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import { SimpleSelect } from '@/components/simpleSelect';
import { RadioGroup } from '@/components/radioGroup';
import { Checkbox } from '@/components/checkbox';
import { InputField } from '@/components/inputFields';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import classnames from 'classnames';
import ControlPanel from '@/components/controlPanel';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import DateCalendar from '@/components/dateCalendar';
import notification from '@/containers/ui/Notifications';
import Confirmation from '@/containers/ui/confirmationMsg';
import Modal from "@/components/modal";
import ModalViewCust from './ModalViewCust';

const Customers = (props) => {
  const { setLoading } = props;
  const [activeTab, setActiveTab] = useState('1');
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openModalViewCust, setOpenModalViewCust] = useState(false);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [listTypeCustomers, setListTypeCustomers] = useState([]);
  const [dataCustomers, setDataCustomers] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [isFarmControl, setIsFarmControl] = useState(false);
  const [isHospital, setIsHospital] = useState(false);

  const customersValid = {
    idTypeCont: [(val) => validInt(val) > 0, "msg.required.input.typeCustomer"],
    rtn: [(val) => val !== "", "msg.required.input.dni"],
    nomcli: [(val) => val !== "", "msg.required.input.name"],
    fechai: [(val) => val !== "", "msg.required.input.date"],
    solcredi: [(val) => validInt(val) > 0, "msg.required.radio.creditRequest"],
    numccxc: [(val) => val !== "", "msg.required.select.receivable"],
    numcdes: [(val) => val !== "", "msg.required.select.discountAccount"],
    numcimp: [(val) => val !== "", "msg.required.select.taxAccount"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    idTypeCont: 0,
    tipocli: 0,
    rtn: '',
    nomcli: '',
    fechai: '',
    tel: '',
    email: '',
    direcc: '',
    solcredi: 0,
    diascre: 0,
    limcred: 0,
    payter: '',
    isInter: false,
    isPartner: false,
    pagaiva: false,
    defaPos: false,
    nombrec: '',
    cargoc: '',
    telec: '',
    celuc: '',
    correoc: '',
    nombrep: '',
    cargop: '',
    telep: '',
    celup: '',
    correop: '',
    numccxc: '',
    numcdes: '',
    numcimp: '',
    numcfle: '',
    numcbon: '',
    exoneratedNumber: '',
    persem: false,
    permen: false,
    perqui: false,
    pertri: false,
    status: true,
    productor: false,
    prod_cert: false,
    defaHosp: false,
    type: 1,
    billOuts: false
  }, customersValid);

  const { id, idTypeCont, tipocli, rtn, nomcli, fechai, tel, email, direcc, solcredi, diascre, limcred, payter, isInter, isPartner,
    pagaiva, defaPos, nombrec, cargoc, telec, celuc, correoc, nombrep, cargop, telep, celup, correop, numccxc, numcdes, numcimp,
    numcfle, numcbon, persem, permen, perqui, pertri, status, productor, prod_cert, exoneratedNumber, defaHosp, type, billOuts } = formState;

  const { idTypeContValid, rtnValid, nomcliValid, fechaiValid, solcrediValid, numccxcValid, numcdesValid, numcimpValid } = formValidation;

  const fnViewCustomer = (item) => {
    if (!item.payter) item.payter = '';
    setBulkForm(item);
    setOpenModalViewCust(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('facCustomers', (resp) => {
      const data = resp.data.map((item) => {
        item.typeCustomer = item.setCustomerType ? item.setCustomerType.name : ""
        // item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
        //   <i className="medium-icon bi bi-square" />
        // item.options = <TableButton color='primary' icon='eye' fnOnClick={() => fnViewCustomer(item)} />
        return item;
      });
      setDataCustomers(data);
      setOpenModalViewCust(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      });
      setListLedgerAccounts(listAccounts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('admin/customerTypes', (resp) => {
      const listCustomersTypes = resp.data;
      setListTypeCustomers(listCustomersTypes);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    const companyData = JSON.parse(localStorage.getItem("mw_current_company"));
    if (companyData) {
      setIsFarmControl(companyData.isFarmControl);
      setIsHospital(companyData.isHospital);
    }

  }, []);

  const fnNewCustomer = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSearchCustomer = () => {
    fnGetData();
  }

  const fnSaveCustomer = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (validInt(solcredi) === 1) {
      if (validInt(diascre) === 0) {
        notification('warning', 'msg.required.input.creditDays', 'alert.warning.title');
        return;
      }
      if (validInt(limcred) === 0) {
        notification('warning', 'msg.required.input.creditLimit', 'alert.warning.title');
        return;
      }
    }

    const newData = {
      fechai,
      rtn,
      nomcli,
      idTypeCont,
      tel,
      direcc,
      email,
      nombrec,
      cargoc,
      telec,
      celuc,
      correoc,
      nombrep,
      cargop,
      telep,
      celup,
      correop,
      solcredi,
      persem,
      perqui,
      permen,
      pertri,
      diascre,
      limcred,
      tipocli,
      defaPos,
      isPartner,
      isInter,
      pagaiva,
      numccli: numccxc,
      numccxc,
      numcdes,
      numcimp,
      numcfle,
      numcbon,
      payter,
      status,
      productor,
      prod_cert,
      exoneratedNumber,
      defaHosp,
      type,
      billOuts
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`facCustomers/${id}`, newData, (resp) => {
        console.log(resp);
        setSendForm(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('facCustomers', newData, (resp) => {
        console.log(resp);
        setSendForm(false);
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintCustomer = () => { }

  const fnDeleteCustomer = () => {
    if (id > 0) {
      setOpenMsgQuestion(true);
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`facCustomers/${id}`, (resp) => {
      console.log(resp);
      fnNewCustomer();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnLedgerAccounts = () => {
    const selectFilter = listTypeCustomers.filter(item => {
      return item.id === validInt(idTypeCont);
    });
    if (selectFilter.length > 0) {
      const accounts = {
        numccli: selectFilter[0].idCtaCxp,
        numccxc: selectFilter[0].idCtaCxp,
        numcdes: selectFilter[0].idCtaDesc,
        numcimp: selectFilter[0].idCtaIva,
        numcfle: selectFilter[0].idCtaFlete,
        numcbon: selectFilter[0].idCtaBon
      }
      setBulkForm(accounts);
    } else {
      notification('warning', 'msg.required.input.typeCustomer', 'alert.warning.title');
    }
  }

  const fnExportToExcel = () => { }

  const propsToControlPanel = {
    fnNew: fnNewCustomer,
    fnSearch: fnSearchCustomer,
    fnSave: fnSaveCustomer,
    fnPrint: fnPrintCustomer,
    fnDelete: fnDeleteCustomer,
    buttonsHome: [
      {
        title: "button.ledgerAccounts",
        icon: "bi bi-journal-text",
        onClick: fnLedgerAccounts
      },
      {
        title: "button.export",
        icon: "bi bi-file-earmark-excel",
        onClick: fnExportToExcel
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToModalViewCust = {
    ModalContent: ModalViewCust,
    title: "page.customers.modal.modalViewCust.title",
    open: openModalViewCust,
    setOpen: setOpenModalViewCust,
    maxWidth: 'lg',
    data: {
      dataCustomers,
      fnViewItem: fnViewCustomer
    }
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title" }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-3" />
              <Nav tabs className="separator-tabs ml-0 mb-4">
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === '1',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTab('1')}
                  >
                    {IntlMessages("page.customers.modal.modalNew.title.generalData")}
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
                    {IntlMessages("page.customers.modal.modalNew.title.contacts")}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === '3',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTab('3')}
                  >
                    {IntlMessages("page.customers.modal.modalNew.title.ledgerAccounts")}
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <Row>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="5">
                      <Row>
                        <Colxx xxs="12" sm="6" lg="12">
                          <SimpleSelect
                            label="page.customers.modal.modalNew.select.typeCustomer"
                            name="idTypeCont"
                            value={idTypeCont}
                            onChange={onInputChange}
                            options={listTypeCustomers}
                            invalid={sendForm && !!idTypeContValid}
                            feedbackText={sendForm && (idTypeContValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={rtn}
                            name="rtn"
                            onChange={onInputChange}
                            type="text"
                            label="page.customers.modal.modalNew.input.dni"
                            invalid={sendForm && !!rtnValid}
                            feedbackText={sendForm && (rtnValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={nomcli}
                            name="nomcli"
                            onChange={onInputChange}
                            type="text"
                            label="page.customers.modal.modalNew.input.name"
                            invalid={sendForm && !!nomcliValid}
                            feedbackText={sendForm && (nomcliValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" lg="12">
                          <DateCalendar
                            value={fechai}
                            label="page.customers.modal.modalNew.input.dateAdmission"
                            name="fechai"
                            onChange={onInputChange}
                            invalid={sendForm && !!fechaiValid}
                            feedbackText={sendForm && (fechaiValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={tel}
                            name="tel"
                            onChange={onInputChange}
                            type="text"
                            label="page.customers.modal.modalNew.input.phone"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" lg="12">
                          <InputField
                            value={email}
                            name="email"
                            onChange={onInputChange}
                            type="email"
                            label="page.customers.modal.modalNew.input.email"
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <InputField
                            value={direcc}
                            name="direcc"
                            onChange={onInputChange}
                            type="textarea"
                            label="page.customers.modal.modalNew.input.address"
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <RadioGroup
                            label="page.customers.modal.modalNew.label.typeCustomer"
                            name="tipocli"
                            value={tipocli}
                            onChange={onInputChange}
                            options={[
                              { id: 1, label: 'page.customers.modal.modalNew.radio.custLocal' },
                              { id: 2, label: 'page.customers.modal.modalNew.radio.custForeigner' },
                              { id: 3, label: 'page.customers.modal.modalNew.radio.custInter' }
                            ]}
                            display='flex'
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <InputField
                            value={exoneratedNumber}
                            name="exoneratedNumber"
                            onChange={onInputChange}
                            label="page.customers.modal.modalNew.input.exoneratedNumber"
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="7">
                      <ContainerWithLabel label="page.customers.modal.modalNew.title.creditStatus">
                        <Row>
                          <Colxx xxs="12" sm="5">
                            <RadioGroup
                              label="page.customers.modal.modalNew.input.creditRequest"
                              name="solcredi"
                              value={solcredi}
                              onChange={onInputChange}
                              options={[
                                { id: 1, label: 'page.customers.modal.modalNew.input.creditRequest.yes' },
                                { id: 2, label: 'page.customers.modal.modalNew.input.creditRequest.no' }
                              ]}
                              display='flex'
                              invalid={sendForm && !!solcrediValid}
                              feedbackText={sendForm && (solcrediValid || null)}
                            />
                          </Colxx>
                          <Colxx xxs="6" sm="3">
                            <InputField
                              value={diascre}
                              name="diascre"
                              onChange={onInputChange}
                              type="number"
                              label="page.customers.modal.modalNew.input.creditDays"
                            />
                          </Colxx>
                          <Colxx xxs="6" sm="4">
                            <InputField
                              value={limcred}
                              name="limcred"
                              onChange={onInputChange}
                              type="number"
                              label="page.customers.modal.modalNew.input.creditLimit"
                            />
                          </Colxx>
                          <Colxx xxs="12">
                            <ContainerWithLabel label="page.customers.modal.modalNew.label.purchasePeriod">
                              <Row>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="persem"
                                    value={persem}
                                    label="page.customers.modal.modalNew.check.weekly"
                                  />
                                </Colxx>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="permen"
                                    value={permen}
                                    label="page.customers.modal.modalNew.check.monthly"
                                  />
                                </Colxx>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="perqui"
                                    value={perqui}
                                    label="page.customers.modal.modalNew.check.biweekly"
                                  />
                                </Colxx>
                                <Colxx xxs="6" sm="3">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="pertri"
                                    value={pertri}
                                    label="page.customers.modal.modalNew.check.quarterly"
                                  />
                                </Colxx>
                              </Row>
                            </ContainerWithLabel>
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12">
                            <InputField
                              value={payter}
                              name="payter"
                              onChange={onInputChange}
                              type="textarea"
                              label="page.customers.modal.modalNew.input.paymentTerms"
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                      <Row>
                        <Colxx xxs="12">
                          <FormGroup>
                            <Row>
                              <Colxx xxs="5">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="isInter"
                                  value={isInter}
                                  label="page.customers.modal.modalNew.check.international"
                                />
                              </Colxx>
                              <Colxx xxs="7">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="isPartner"
                                  value={isPartner}
                                  label="page.customers.modal.modalNew.check.wholesaleCustomer"
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs="5">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="pagaiva"
                                  value={pagaiva}
                                  label="page.customers.modal.modalNew.ckeck.payIVA"
                                />
                              </Colxx>
                              <Colxx xxs="7">
                                <Checkbox
                                  onChange={onInputChange}
                                  name="defaPos"
                                  value={defaPos}
                                  label="page.customers.modal.modalNew.check.defaultPOS"
                                />
                              </Colxx>
                            </Row>
                            {isFarmControl && (
                              <Row>
                                <Colxx xxs="6">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="productor"
                                    value={productor}
                                    label="page.customers.modal.modalNew.ckeck.productor"
                                  />
                                </Colxx>
                                <Colxx xxs="6">
                                  <Checkbox
                                    onChange={onInputChange}
                                    name="prod_cert"
                                    value={prod_cert}
                                    label="page.customers.modal.modalNew.check.productorCert"
                                  />
                                </Colxx>
                              </Row>
                            )}
                            <Row>
                              <Colxx xxs="5">
                                <Checkbox
                                  label="page.customers.checkbox.billOuts"
                                  name="billOuts"
                                  value={billOuts}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                              <Colxx xxs="7">
                                <Checkbox
                                  label="page.productsTypes.check.status"
                                  name="status"
                                  value={status}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                          </FormGroup>
                          <hr />
                          {isHospital && (
                            <Row>
                              <Colxx xxs={12} md={6}>
                                <RadioGroup
                                  label="page.customers.input.patientType"
                                  value={type}
                                  name="type"
                                  onChange={onInputChange}
                                  options={
                                    [
                                      { id: 1, label: "page.customers.input.patientType.type1" },
                                      { id: 2, label: "page.customers.input.patientType.type2" }
                                    ]
                                  }
                                />
                              </Colxx>
                              <Colxx xxs={12} md={6}>
                                <Checkbox
                                  label="page.customers.checkbox.defaSecurityHosp"
                                  name="defaHosp"
                                  value={defaHosp}
                                  onChange={onInputChange}
                                />
                              </Colxx>
                            </Row>
                          )}
                        </Colxx>
                      </Row>
                    </Colxx>
                  </Row>
                </TabPane>
                <TabPane tabId="2">
                  <Row>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="6">
                      <ContainerWithLabel label="page.customers.modal.modalNew.title.purchaseContact">
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={nombrec}
                              name="nombrec"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.nameContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={cargoc}
                              name="cargoc"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.positionContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={telec}
                              name="telec"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.phoneContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={celuc}
                              name="celuc"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.celphoneContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={correoc}
                              id="correoc"
                              name="correoc"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.emailContact"
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                    <Colxx xxs="12" xs="12" sm="12" md="12" lg="6">
                      <ContainerWithLabel label="page.customers.modal.modalNew.title.billingContact">
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={nombrep}
                              name="nombrep"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.nameContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={cargop}
                              name="cargop"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.positionContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={telep}
                              name="telep"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.phoneContact"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={celup}
                              id="celup"
                              name="celup"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.celphoneContact"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" sm="6" lg="12" xxl="6">
                            <InputField
                              value={correop}
                              name="correop"
                              onChange={onInputChange}
                              type="text"
                              label="page.customers.modal.modalNew.input.emailContact"
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </TabPane>
                <TabPane tabId="3">
                  <Row>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="numccxc"
                        inputValue={numccxc}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.receivable"
                        invalid={sendForm && !!numccxcValid}
                        feedbackText={sendForm && (numccxcValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="numcdes"
                        inputValue={numcdes}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.discountAccount"
                        invalid={sendForm && !!numcdesValid}
                        feedbackText={sendForm && (numcdesValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="numcimp"
                        inputValue={numcimp}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.taxAccount"
                        invalid={sendForm && !!numcimpValid}
                        feedbackText={sendForm && (numcimpValid || null)}
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="numcfle"
                        inputValue={numcfle}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.freightAccount"
                      />
                    </Colxx>
                    <Colxx xxs="12" sm="6" lg="4" xxl="3">
                      <SearchSelect
                        name="numcbon"
                        inputValue={numcbon}
                        onChange={onInputChange}
                        options={listLedgerAccounts}
                        label="page.customers.modal.modalNew.check.bonusAccount"
                      />
                    </Colxx>
                  </Row>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
      <Modal {...propsToModalViewCust} />
    </>
  );
}
export default Customers;