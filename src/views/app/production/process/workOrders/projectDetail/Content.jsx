import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Row, Nav, NavItem, NavLink, TabContent, TabPane, Button, Badge, Table } from 'reactstrap';
import { InputField } from '@/components/inputFields';
import { useLocation, useNavigate } from "react-router-dom";
import { adminRoot } from '@/constants/defaultValues';
import { request } from '@/helpers/core';
import { IntlMessages, formatNumber, validFloat, validInt } from '@/helpers/Utils';
import { CircularProgressbar } from 'react-circular-progressbar';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useForm } from '@/hooks';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import classnames from 'classnames';
import Dropzone from '@/components/dropzone';
import GalleryDetail from '@/containers/pages/GalleryDetail';
import Confirmation from '@/containers/ui/confirmationMsg';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import DateCalendar from '@/components/dateCalendar';
import Modal from "@/components/modal";
import ModalGenInvoice from './ModalInvoice';

const ProjectDetail = (props) => {
  const { setLoading } = props;
  const history = useNavigate();
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [dataProducts, setDataProducts] = useState([]);
  const projectData = useLocation().state;
  const [activeFirstTab, setActiveFirstTab] = useState('1');
  const [currentItemProd, setCurrentItemProd] = useState({});
  const [percentPayment, setPercentPayment] = useState(0);
  const [valuePayment, setValuePayment] = useState(0);
  const [listCustomers, setListCustomers] = useState([]);
  const [listManagers, setListManagers] = useState([]);
  const [listTypeProducts, setListTypeProducts] = useState([]);
  const [listTypeProjects, setListTypeProjects] = useState([]);
  const [listDestinations, setListDestinations] = useState([]);
  const [listStatus, setListStatus] = useState([]);
  const [initialGallery, setInitialGallery] = useState([]);
  const [manufacturingGallery, setManufacturingGallery] = useState([]);
  const [dataInvoice, setDataInvoice] = useState([]);
  const [dataPayments, setDataPayments] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [modalInvoice, setModalInvoice] = useState(false);
  const [paymentGen, setPaymentGen] = useState("block");
  const [sendForm, setSendForm] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);

  const newProjectValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    startDate: [(val) => val !== "", "msg.required.input.startDate"],
    customerId: [(val) => validInt(val) > 0, "msg.required.select.customer"],
    responsId: [(val) => validInt(val) > 0, "msg.required.select.manager"],
    productTypeId: [(val) => validInt(val) > 0, "msg.required.select.typeProduct"],
    projectTypeId: [(val) => validInt(val) > 0, "msg.required.select.typeProject"],
    destinityId: [(val) => validInt(val) > 0, "msg.required.select.destiny"],
    status: [(val) => validInt(val) > 0, "msg.required.select.status"],
    estimatedValue: [(val) => validInt(val) > 0, "msg.required.input.estimatedValue"],
    estimatedTime: [(val) => validInt(val) > 0, "msg.required.input.estimatedDays"]
  }

  const detailValid = {
    nameRawMaterial: [(val) => val !== "", "msg.required.input.name"],
    qtyRawMaterial: [(val) => validInt(val) > 0, "msg.required.input.qty"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: projectData.id ? projectData.id : '',
    name: projectData.name ? projectData.name : '',
    description: projectData.description ? projectData.description : '',
    notes: '',
    destinityId: projectData.destinityId ? projectData.destinityId : '0',
    status: projectData.status ? projectData.status : 1,
    startDate: projectData.startDate !== "0000-00-00" ? projectData.startDate : '',
    estimatedValue: projectData.estimatedValue ? projectData.estimatedValue : 0,
    estimatedTime: projectData.estimatedTime ? projectData.estimatedTime : 0,
    customerId: projectData.facCliente ? projectData.facCliente.id : 0,
    responsId: projectData.prodResponsible ? projectData.prodResponsible.id : 0,
    productTypeId: projectData.prodProductType ? projectData.prodProductType.id : 0,
    projectTypeId: projectData.prodOrderType ? projectData.prodOrderType.id : 0
  }, newProjectValid);

  const { formState: formStateDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta, onInputChange: onInputChangeDeta,
    onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta } = useForm({
      nameRawMaterial: '',
      qtyRawMaterial: 0,
      notesRawMaterial: ''
    }, detailValid);

  const { id, name, description, notes, destinityId, status, startDate, estimatedValue, estimatedTime, customerId, responsId,
    productTypeId, projectTypeId } = formState;

  const { nameRawMaterial, qtyRawMaterial, notesRawMaterial } = formStateDeta;

  const { nameValid, startDateValid, customerIdValid, responsIdValid, productTypeIdValid, projectTypeIdValid, destinityIdValid,
    statusValid, estimatedValueValid, estimatedTimeValid } = formValidation;

  const { nameRawMaterialValid, qtyRawMaterialValid } = formValidationDeta;

  const fnSaveGeneralData = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      name,
      customerId,
      responsId,
      productTypeId,
      destinityId,
      projectTypeId,
      status,
      startDate,
      estimatedValue,
      estimatedTime,
      description,
      notes
    }

    if (projectData && projectData.id > 0) {
      setLoading(true);
      request.PUT(`prodProjects/${projectData.id}`, newData, (resp) => {
        console.log(resp);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnGenerateInvoice = () => {
    setModalInvoice(true);
  }

  const fnClearInputs = () => {
    onResetFormDeta();
    setSendFormDeta(false);
  }

  const fnGetProducts = () => {
    setLoading(true);
    request.GET(`prodOrderProducts?orderId=${projectData.id}`, (resp) => {
      const dataProd = resp.data.map((item) => {
        return {
          id: item.id,
          nameRawMaterial: item.name,
          qtyRawMaterial: item.qty,
          notesRawMaterial: item.notes
        }
      });
      setDataProducts(dataProd);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetImages = () => {
    setLoading(true);
    request.GET(`prodOrderImages?orderId=${projectData.id}`, (resp) => {
      const dataImg = resp.data.map((item) => {
        return {
          id: item.id,
          img: item.image,
          type: item.type
        }
      });
      const imgInit = dataImg.filter((item) => {
        return item.type === 1
      });
      const imgManufact = dataImg.filter((item) => {
        return item.type === 2
      });
      setInitialGallery(imgInit);
      setManufacturingGallery(imgManufact);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnGetPayment = () => {
    setLoading(true);
    setPaymentGen("block");
    request.GET(`prodOrderPayments/getPayments?orderId=${projectData.id}`, (resp) => {
      setDataInvoice(resp.data.dataInvoice);
      setDataPayments(resp.data.dataPayments);
      let value = 0;
      if (resp.data.dataPayments.length > 0) {
        const valueTotal = resp.data.dataPayments.map(item => {
          value += validFloat(item.value);
          return value;
        });
        setPercentPayment((valueTotal[0] / resp.data.dataInvoice.total) * 100);
        setValuePayment(valueTotal[0]);
      }
      if (resp.data.dataOrder) {
        setPaymentGen("none");
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveProducts = () => {
    setSendFormDeta(true);
    if (!isFormValidDeta) {
      return;
    }

    const data = {
      orderId: projectData.id,
      name: nameRawMaterial,
      qty: qtyRawMaterial,
      notes: notesRawMaterial
    }
    if (currentItemProd && currentItemProd.id > 0) {
      setLoading(true);
      request.PUT(`prodOrderProducts/${currentItemProd.id}`, data, (resp) => {
        console.log(resp);
        fnClearInputs();
        fnGetProducts();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('prodOrderProducts', data, (resp) => {
        console.log(resp);
        fnClearInputs();
        fnGetProducts();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDeleteItem = (item) => {
    setCurrentItemProd(item);
    setOpenMsgQuestion(true);
  };

  const fnDeleteProducts = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`prodOrderProducts/${currentItemProd.id}`, (resp) => {
      console.log(resp);
      fnGetProducts();
      setCurrentItemProd({});
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnEditItem = (item) => {
    setCurrentItemProd(item);
    setBulkFormDeta(item);
  };

  const fnBack = () => {
    history(
      `${adminRoot}/production/process/workOrders`,
      { replace: true }
    );
  }

  const propsToGallery = {
    detailImages: initialGallery
  }

  const propsToGallery2 = {
    detailImages: manufacturingGallery
  }

  useEffect(() => {
    setLoading(true);
    request.GET('facCustomers/findSL', (resp) => {
      const listCustomer = resp.data.map((item) => {
        return {
          label: item.nomcli,
          value: item.codigo
        }
      });
      setListCustomers(listCustomer);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('prodResponsibles', (resp) => {
      const listManager = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListManagers(listManager);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('prodProductTypes', (resp) => {
      const listTypeProduct = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListTypeProducts(listTypeProduct);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('prodOrderTypes', (resp) => {
      const listTypeProject = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListTypeProjects(listTypeProject);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('prodDestinations', (resp) => {
      const listDestination = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListDestinations(listDestination);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET('prodSteps', (resp) => {
      const listSteps = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStatus(listSteps);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    fnGetProducts();
    fnGetImages();
    fnGetPayment();
  }, []);

  const fnFileUploaded = (resp) => {
    const result = JSON.parse(resp.xhr.response);
    const dataImages = {
      orderId: projectData.id,
      name: result.data[0].name,
      image: `/assets/pictures/${result.data[0].name}`,
      type: 1
    }
    request.POST('prodOrderImages', dataImages, (res) => {
      console.log(res);
      fnGetImages();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnFileUploaded2 = (resp) => {
    const result = JSON.parse(resp.xhr.response);
    const dataImages = {
      orderId: projectData.id,
      name: result.data[0].name,
      image: `/assets/pictures/${result.data[0].name}`,
      type: 2
    }
    request.POST('prodOrderImages', dataImages, (res) => {
      console.log(res);
      fnGetImages();
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnPrintProject = () => {
    request.GETPdf('prodProjects/exportPDF', { id: projectData.id, userName: userData.name }, 'Boleta.pdf', (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDeleteProducts, title: "alert.question.title", setCurrentItem: setCurrentItemProd }

  const propsToModalInvoice = {
    ModalContent: ModalGenInvoice,
    title: "page.workOrders.detail.modal.invoice.title",
    open: modalInvoice,
    setOpen: setModalInvoice,
    maxWidth: 'md',
    data: {
      projectData,
      fnGetPayment,
      setLoading
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardHeader>
              <Nav tabs className="card-header-tabs ">
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeFirstTab === '1',
                      'nav-link': true,
                    })}
                    onClick={() => {
                      setActiveFirstTab('1');
                    }}
                  >
                    {IntlMessages("page.workOrders.detail.tab.title.generalData")}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeFirstTab === '2',
                      'nav-link': true,
                    })}
                    onClick={() => {
                      setActiveFirstTab('2');
                    }}
                  >
                    {IntlMessages("page.workOrders.detail.tab.title.gallery")}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeFirstTab === '3',
                      'nav-link': true,
                    })}
                    onClick={() => {
                      setActiveFirstTab('3');
                    }}
                  >
                    {IntlMessages("page.workOrders.detail.tab.title.payment")}
                  </NavLink>
                </NavItem>
              </Nav>
              <h2>
                <Badge
                  color={projectData.colorStatus}
                  pill
                  className="position-absolute badge-top-right-3"
                >
                  {`${projectData.code} | ${projectData.prodStep ? projectData.prodStep.name : ""}`}
                </Badge>
              </h2>
            </CardHeader>
            <CardBody>
              <TabContent activeTab={activeFirstTab}>
                <TabPane tabId="1">
                  <Row>
                    <Colxx xxs="12" lg="7">
                      <Row>
                        <Colxx xxs="12" xs="12" sm="6">
                          <InputField
                            value={name}
                            name="name"
                            onChange={onInputChange}
                            type="text"
                            label="page.workOrders.modal.modalNew.input.name"
                            invalid={sendForm && !!nameValid}
                            feedbackText={sendForm && (nameValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="12" sm="6">
                          <DateCalendar
                            name="startDate"
                            value={startDate}
                            label='page.workOrders.modal.modalNew.input.startDate'
                            onChange={onInputChange}
                            invalid={sendForm && !!startDateValid}
                            feedbackText={sendForm && (startDateValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="12" sm="6">
                          <SearchSelect
                            name="customerId"
                            inputValue={customerId}
                            onChange={onInputChange}
                            options={listCustomers}
                            label="page.workOrders.modal.modalNew.select.customer"
                            invalid={sendForm && !!customerIdValid}
                            feedbackText={sendForm && (customerIdValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="12" sm="6">
                          <SearchSelect
                            name="responsId"
                            inputValue={responsId}
                            onChange={onInputChange}
                            options={listManagers}
                            label="page.workOrders.modal.modalNew.select.manager"
                            invalid={sendForm && !!responsIdValid}
                            feedbackText={sendForm && (responsIdValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="12" sm="6">
                          <SearchSelect
                            name="productTypeId"
                            inputValue={productTypeId}
                            onChange={onInputChange}
                            options={listTypeProducts}
                            label="page.workOrders.modal.modalNew.select.typeProduct"
                            invalid={sendForm && !!productTypeIdValid}
                            feedbackText={sendForm && (productTypeIdValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="12" sm="6">
                          <SearchSelect
                            name="projectTypeId"
                            inputValue={projectTypeId}
                            onChange={onInputChange}
                            options={listTypeProjects}
                            label="page.workOrders.modal.modalNew.select.typeProject"
                            invalid={sendForm && !!projectTypeIdValid}
                            feedbackText={sendForm && (projectTypeIdValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="12" sm="6">
                          <SearchSelect
                            inputValue={destinityId}
                            name="destinityId"
                            onChange={onInputChange}
                            label="page.workOrders.modal.modalNew.select.destiny"
                            options={listDestinations}
                            invalid={sendForm && !!destinityIdValid}
                            feedbackText={sendForm && (destinityIdValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="12" sm="6">
                          <SearchSelect
                            inputValue={status}
                            name="status"
                            onChange={onInputChange}
                            label="page.workOrders.modal.modalNew.select.status"
                            options={listStatus}
                            invalid={sendForm && !!statusValid}
                            feedbackText={sendForm && (statusValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" xs="12" sm="6">
                          <InputField
                            value={estimatedValue}
                            name="estimatedValue"
                            onChange={onInputChange}
                            type="number"
                            label="page.workOrders.modal.modalNew.input.estimatedValue"
                            invalid={sendForm && !!estimatedValueValid}
                            feedbackText={sendForm && (estimatedValueValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" xs="12" sm="6">
                          <InputField
                            value={estimatedTime}
                            name="estimatedTime"
                            onChange={onInputChange}
                            type="number"
                            label="page.workOrders.modal.modalNew.input.estimatedDays"
                            invalid={sendForm && !!estimatedTimeValid}
                            feedbackText={sendForm && (estimatedTimeValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <InputField
                            value={description}
                            name="description"
                            onChange={onInputChange}
                            type="textarea"
                            label="page.workOrders.modal.modalNew.select.description"
                          />
                        </Colxx>
                        <Colxx xxs="12">
                          <InputField
                            value={notes}
                            name="notes"
                            onChange={onInputChange}
                            type="textarea"
                            label="page.workOrders.detail.text.notes"
                          />
                        </Colxx>
                      </Row>
                      <Row className='mb-3'>
                        <Colxx xxs="12" className="div-action-button-container">
                          <Button color="secondary" onClick={fnPrintProject}><i className="iconsminds-printer" />
                            {IntlMessages("button.print")}
                          </Button>
                          <Button color="primary" onClick={fnSaveGeneralData}><i className="iconsminds-save" />
                            {IntlMessages("button.save")}
                          </Button>
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx xxs="12" lg="5">
                      <ContainerWithLabel label="page.workOrders.detail.table.title">
                        <Row>
                          <Colxx xxs="12" xs="12" sm="6" md="6" lg="12" xl="6">
                            <InputField
                              value={nameRawMaterial}
                              name="nameRawMaterial"
                              onChange={onInputChangeDeta}
                              type="text"
                              label="page.workOrders.detail.input.nameRawMaterial"
                              invalid={sendFormDeta && !!nameRawMaterialValid}
                              feedbackText={sendFormDeta && (nameRawMaterialValid || null)}
                            />
                          </Colxx>
                          <Colxx xxs="12" xs="12" sm="4" md="4" lg="12" xl="4">
                            <InputField
                              value={qtyRawMaterial}
                              name="qtyRawMaterial"
                              onChange={onInputChangeDeta}
                              type="text"
                              label="page.workOrders.detail.input.qtyRawMaterial"
                              invalid={sendFormDeta && !!qtyRawMaterialValid}
                              feedbackText={sendFormDeta && (qtyRawMaterialValid || null)}
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12">
                            <InputField
                              value={notesRawMaterial}
                              name="notesRawMaterial"
                              onChange={onInputChangeDeta}
                              type="textarea"
                              label="page.workOrders.detail.text.notes"
                            />
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12" className="div-action-button-container mb-3">
                            <Button color="secondary" onClick={fnClearInputs}>
                              <i className="bi bi-stars" /> {IntlMessages("button.clear")}
                            </Button>
                            <Button color="primary" onClick={fnSaveProducts}>
                              <i className="iconsminds-save" /> {IntlMessages("button.save")}
                            </Button>
                          </Colxx>
                        </Row>
                        <Row>
                          <Colxx xxs="12">
                            <Table bordered hover size='sm'>
                              <thead>
                                <tr>
                                  <th>{IntlMessages("page.workOrders.detail.table.name")}</th>
                                  <th>{IntlMessages("page.workOrders.detail.table.qty")}</th>
                                  <th className='d-xs-none-table-cell'>{IntlMessages("page.workOrders.detail.table.note")}</th>
                                  <th>{IntlMessages("table.column.options")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dataProducts.map((item, idx) => {
                                  return (
                                    <tr id={`tr-table-dataproducts-${item.id}`} key={idx}>
                                      <th scope="row">{item.nameRawMaterial}</th>
                                      <td>{item.qtyRawMaterial} G.</td>
                                      <td className='d-xs-none-table-cell'>{item.notesRawMaterial}</td>
                                      <td className="text-right"><Button type="button" className="btn-circle-table" color="primary" title={IntlMessages("button.edit")}
                                        onClick={() => { fnEditItem(item) }}>
                                        <i className='bi bi-pencil' />
                                      </Button>
                                        <Button type="button" className="btn-circle-table" color="danger" title={IntlMessages("button.delete")}
                                          onClick={() => { fnDeleteItem(item) }}>
                                          <i className='bi bi-trash' />
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </TabPane>
                <TabPane tabId="2">
                  <Row>
                    <Colxx className="mb-3" xxs="12">
                      <ContainerWithLabel label="page.workOrders.detail.initialGallery">
                        <Row>
                          <Colxx className="mb-3" xxs="12" sm="6" lg="4" xl="3">
                            <Row>
                              <Colxx className="mb-3" xxs="12">
                                <Dropzone fnComplete={fnFileUploaded} />
                              </Colxx>
                            </Row>
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="8" xl="9">
                            <GalleryDetail id="galery-detail-1" {...propsToGallery} />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                    <Colxx xxs="12">
                      <ContainerWithLabel label="page.workOrders.detail.manufacturingGallery">
                        <Row>
                          <Colxx className="mb-3" xxs="12" sm="6" lg="4" xl="3">
                            <Row>
                              <Colxx className="mb-3" xxs="12">
                                <Dropzone fnComplete={fnFileUploaded2} />
                              </Colxx>
                            </Row>
                          </Colxx>
                          <Colxx xxs="12" sm="6" lg="8" xl="9">
                            <GalleryDetail id="galery-detail-2" {...propsToGallery2} />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </TabPane>
                <TabPane tabId="3">
                  <Row>
                    <Colxx xxs="12" lg="8">
                      <Row>
                        <Colxx xxs="2" align="left"> </Colxx>
                        <Colxx xxs="5" align="center">
                          <CardTitle className="mb-5">
                            {IntlMessages("page.workOrders.detail.payment.title.invoiceDetail")}
                          </CardTitle>
                        </Colxx>
                        <Colxx xxs="5" align="right">
                          <Button color="primary" style={{ display: paymentGen }} onClick={fnGenerateInvoice}><i className="bi bi-receipt" />
                            {IntlMessages("button.generateInvoice")}
                          </Button>
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <Table bordered hover>
                            <thead>
                              <tr>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.document")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.date")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.customer")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.rtn")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.totalInvoice")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{dataInvoice.setDocument ? dataInvoice.setDocument.name : ""}</td>
                                <td>{dataInvoice.date}</td>
                                <td className="text-right">{dataInvoice.facCliente ? dataInvoice.facCliente.nomcli : ""}</td>
                                <td className="text-right">{dataInvoice.facCliente ? dataInvoice.facCliente.rtn : ""}</td>
                                <td className="text-right">{formatNumber(dataInvoice.total, 'L.', 2)}</td>
                              </tr>
                            </tbody>
                          </Table>
                          <div className="border-bottom pt-3 mb-5" />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="2" align="left">
                          <div className="progress-bar-circle">
                            <CircularProgressbar
                              strokeWidth={4}
                              value={percentPayment}
                              text={`${percentPayment}%`}
                            />
                          </div>
                        </Colxx>
                        <Colxx xxs="5" align="center">
                          <CardTitle className="mb-5">
                            {IntlMessages("page.workOrders.detail.payment.title.paymentDetail")}
                          </CardTitle>
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <Table bordered hover>
                            <thead>
                              <tr>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.number")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.date")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.documentCode")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.value")}</th>
                                <th className="text-center">{IntlMessages("page.workOrders.detail.payment.percent")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dataPayments.map((item, idx) => {
                                return (
                                  <tr id={`tr-table-dataPayments-${item.id}`} key={idx}>
                                    <th scope="row">{idx + 1}</th>
                                    <td>{item.date}</td>
                                    <td>{item.documentCode}</td>
                                    <td className="text-right">{formatNumber(item.value, 'L.', 2)}</td>
                                    <td className="text-right">{(item.value / dataInvoice.total) * 100} %</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr>
                                <th scope="row" colSpan="4">{IntlMessages("page.workOrders.detail.payment.total")}</th>
                                <th className="text-right">{formatNumber(valuePayment, 'L.', 2)}</th>
                              </tr>
                            </tfoot>
                          </Table>
                          <div className="border-bottom pt-3 mb-5" />
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx xxs="12" lg="4">
                      <div className="mb-5" />
                      <Table borderless className="d-flex justify-content-end">
                        <tbody>
                          <tr>
                            <td className="text-semi-muted">{IntlMessages("page.workOrders.detail.payment.subTotalValue")}:</td>
                            <td className="text-right">{formatNumber(dataInvoice.subTotalValue, 'L.', 2)}</td>
                          </tr>
                          <tr>
                            <td className="text-semi-muted">{IntlMessages("page.workOrders.detail.payment.discountValue")} :</td>
                            <td className="text-right">{formatNumber(dataInvoice.discountValue, 'L.', 2)}</td>
                          </tr>
                          <tr>
                            <td className="text-semi-muted">{IntlMessages("page.workOrders.detail.payment.taxValue")}:</td>
                            <td className="text-right">{formatNumber(dataInvoice.taxValue, 'L.', 2)}</td>
                          </tr>
                          <tr className="font-weight-bold">
                            <td className="text-semi-muted">{IntlMessages("page.workOrders.detail.payment.total")}:</td>
                            <td className="text-right">{formatNumber(dataInvoice.total, 'L.', 2)}</td>
                          </tr>
                          <tr>
                            <td className="text-semi-muted">{IntlMessages("page.workOrders.detail.payment.valuePayment")}:</td>
                            <td className="text-right">{formatNumber(valuePayment, 'L.', 2)}</td>
                          </tr>
                          <tr className="font-weight-bold">
                            <td className="text-semi-muted">{IntlMessages("page.workOrders.detail.payment.valueOwed")} :</td>
                            <td className="text-right">{dataInvoice.total ? formatNumber(dataInvoice.total - valuePayment, 'L.', 2) : 0}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Colxx>
                  </Row>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalInvoice} />
      <Button color="secondary" title={IntlMessages("button.back")} className="btn-float" onClick={fnBack}><i className="simple-icon-action-undo" /></Button>
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default ProjectDetail;