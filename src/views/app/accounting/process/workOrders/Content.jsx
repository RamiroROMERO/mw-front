import React, { useEffect, useState } from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import { useForm } from '@/hooks';
import { request } from '@/helpers/core';
import ControlPanel from '@/components/controlPanel';
import Modal from "@/components/modal";
import ModalViewOrders from './ModalViewOrders';
import FormOrder from './FormOrder';
import TableDocuments from './TableDocuments';
import ModalPassAdmin from '../../../inventory/process/purchaseOrders/ModalPassAdmin';

const WorkOrders = (props) => {
  const { setLoading } = props;
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [listDocuments, setListDocuments] = useState([]);
  const [dataWorkOrders, setDataWorkOrders] = useState([]);
  const [openModalViewOrders, setOpenModalViewOrders] = useState(false);
  const [openModalPassAdmin, setOpenModalPassAdmin] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const workOrdersValid = {
    dateIn: [(val) => val !== "", "msg.required.input.date"],
    description: [(val) => val !== "", "msg.required.input.description"],
    idCtaCont: [(val) => val !== "", "msg.required.input.account"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    dateIn: "",
    dateOut: "",
    description: "",
    description2: "",
    idCtaCont: ""
  }, workOrdersValid);

  const { id, dateIn, dateOut, description, description2, idCtaCont } = formState;

  const fnNewWorkOrder = () => {
    onResetForm();
    setSendForm(false);
    setListDocuments([]);
  }

  const fnSearchWorkOrder = () => {
    setLoading(true);
    request.GET('accounting/process/workOrders', (resp) => {
      const workOrders = resp.data.map((item) => {
        item.dateOut = item.dateOut === "1900-01-01" ? "" : item.dateOut
        return item
      });
      setDataWorkOrders(workOrders);
      setOpenModalViewOrders(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveWorkOrder = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      dateIn,
      description,
      description2,
      dateOut: dateOut !== "" ? dateOut : "1900-01-01",
      idCtaCont
    }

    if (id === 0) {
      setLoading(true);
      request.POST('accounting/process/workOrders', newData, (resp) => {
        console.log(resp);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`accounting/process/workOrders/${id}`, newData, (resp) => {
        console.log(resp);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnPrintWorkOrder = () => {
    if (id > 0) {
      request.GETPdf('accounting/process/workOrders/exportPDFOrder', { id, userName: userData.name }, 'Orden de Compra.pdf',
        (err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }

  const fnDeleteWorkOrder = () => { }

  const fnCloseOrder = () => {
    if (id > 0) {
      setOpenModalPassAdmin(true);
    }
  }

  const fnExportOrder = () => { }

  const fnExportDetailOrder = () => { }

  useEffect(() => {
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccount(listAccounts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewWorkOrder,
    fnSearch: fnSearchWorkOrder,
    fnSave: fnSaveWorkOrder,
    fnPrint: fnPrintWorkOrder,
    fnDelete: fnDeleteWorkOrder,
    buttonsHome: [
      {
        title: "button.closeOrder",
        icon: "bi bi-slash-circle",
        onClick: fnCloseOrder
      },
      {
        title: "button.exportOrder",
        icon: "bi bi-file-earmark-excel",
        onClick: fnExportOrder
      },
      {
        title: "button.eportDetailOrder",
        icon: "bi bi-file-earmark-excel-fill",
        onClick: fnExportDetailOrder
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToFormOrder = {
    dateIn,
    dateOut,
    description,
    description2,
    idCtaCont,
    listLedgerAccount,
    onInputChange,
    formValidation,
    sendForm
  }

  const propsToTableDocuments = {
    listDocuments
  }

  const propsToModalViewOrders = {
    ModalContent: ModalViewOrders,
    title: "page.workOrders.modal.viewOrders.title",
    open: openModalViewOrders,
    setOpen: setOpenModalViewOrders,
    maxWidth: 'lg',
    data: {
      setListDocuments,
      dataWorkOrders,
      setBulkForm,
      setLoading
    }
  }

  const propsToModalPassAdmin = {
    ModalContent: ModalPassAdmin,
    title: "page.purchaseOrders.modal.passAdmin.title",
    open: openModalPassAdmin,
    setOpen: setOpenModalPassAdmin,
    maxWidth: "md",
    data: {}
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <FormOrder {...propsToFormOrder} />
              <TableDocuments {...propsToTableDocuments} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewOrders} />
      <Modal {...propsToModalPassAdmin} />
    </>
  );
}
export default WorkOrders;