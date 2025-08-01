import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import { Row, Badge } from 'reactstrap';
import { IntlMessages } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { adminRoot } from '@/constants/defaultValues';
import { request } from '@/helpers/core';
import moment from 'moment'
import ReactTable from "@/components/reactTable";
import Modal from "@/components/modal";
import Confirmation from '@/containers/ui/confirmationMsg';
import ModalNewProject from "./ModalNew";
import ModalStatus from "./ModalStatus";

const WorkOrders = (props) => {
  const { setLoading } = props;
  const history = useNavigate();
  const [modalNewProject, setModalNewProject] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [listCustomers, setListCustomers] = useState([]);
  const [listManagers, setListManagers] = useState([]);
  const [listTypeProducts, setListTypeProducts] = useState([]);
  const [listTypeProjects, setListTypeProjects] = useState([]);
  const [listDestinations, setListDestinations] = useState([]);
  const [listStatus, setListStatus] = useState([]);

  const fnEditItem = (item) => {
    delete item.statusIcon;
    delete item.options;
    history(
      `${adminRoot}/production/process/workOrders/projectDetail`,
      { replace: true, state: item }
    );
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const fnAddNewRecord = () => {
    setCurrentItem({});
    setModalNewProject(true);
  };

  const fnChangeSatatus = (item) => {
    delete item.statusIcon;
    setCurrentItem(item);
    setModalStatus(true);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.workOrders.table.title"),
    columns: [
      { text: IntlMessages("page.workOrders.table.project"), dataField: "project", headerStyle: { 'width': '20%' } },
      {
        text: IntlMessages("page.workOrders.table.startDate"), dataField: "startDate", headerStyle: { 'width': '15%' },
        classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("page.workOrders.table.customer"), dataField: "customer", headerStyle: { 'width': '25%' },
        classes: 'd-xs-none-table-cell', headerClasses: 'd-xs-none-table-cell'
      },
      { text: IntlMessages("page.workOrders.table.time"), dataField: "time", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("page.workOrders.table.status"), dataField: "statusIcon", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '10%' } }
    ],
    data: [],
    options: {
      columnActions: "options"
    },
    actions: [
      {
        color: "primary",
        icon: "bi bi-plus",
        onClick: fnAddNewRecord,
        title: IntlMessages("button.new"),
        isFreeAction: true
      },
      {
        color: "warning",
        icon: "pencil",
        toolTip: IntlMessages("button.edit"),
        onClick: fnEditItem
      },
      {
        color: "danger",
        icon: "trash",
        toolTip: IntlMessages("button.delete"),
        onClick: fnDeleteItem
      }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    let colorStatus = "";
    const today = moment();
    request.GET('prodProjects', (resp) => {
      const data = resp.data.map((item) => {
        const dateStart = moment(item.startDate);
        const daysDiff = today.diff(dateStart, 'days');
        let timeLeft = item.estimatedTime - daysDiff;
        if (item.status === 1) {
          colorStatus = "warning";
        } else if (item.status === 2) {
          colorStatus = "secondary";
        } else if (item.status === 3) {
          colorStatus = "primary";
        } else if (item.status === 4) {
          colorStatus = "info";
        } else if (item.status === 5) {
          colorStatus = "success";
          timeLeft = 0;
        } else {
          colorStatus = "";
        }
        item.project = item.name
        item.customer = item.facCliente ? item.facCliente.nomcli : ""
        item.time = `${timeLeft} Dias`
        item.statusIcon = <Badge title="Cambiar Estado" style={{ cursor: "pointer" }} onClick={() => fnChangeSatatus(item)} color={colorStatus} pill className="mb-1">{item.prodStep.name} </Badge>
        item.colorStatus = colorStatus
        return item;
      });
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('facCustomers/findSL?status=1', (resp) => {
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

    request.GET('prodResponsibles?status=1', (resp) => {
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

    request.GET('prodProductTypes?status=1', (resp) => {
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

    request.GET('prodOrderTypes?status=1', (resp) => {
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

    request.GET('prodDestinations?status=1', (resp) => {
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
      setListStatus(resp.data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    fnGetData();
  }, []);

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`prodProjects/${currentItem.id}`, (resp) => {
      console.log(resp);
      fnGetData();
      setCurrentItem({});
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const propsToModalNew = {
    ModalContent: ModalNewProject,
    title: "page.workOrders.modal.modalNew.title",
    open: modalNewProject,
    setOpen: setModalNewProject,
    maxWidth: 'lg',
    data: {
      currentItem,
      listCustomers,
      listManagers,
      listTypeProducts,
      listTypeProjects,
      listDestinations,
      listStatus,
      fnGetData,
      setLoading
    }
  }

  const propsToModalStatus = {
    ModalContent: ModalStatus,
    title: "page.workOrders.modal.changeStatus.title",
    open: modalStatus,
    setOpen: setModalStatus,
    maxWidth: 'sm',
    data: {
      currentItem,
      listStatus,
      listCustomers,
      fnGetData,
      setLoading
    }
  }

  const propsToMsgDelete = {
    open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title",
    setCurrentItem
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Modal {...propsToModalNew} />
      <Modal {...propsToModalStatus} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default WorkOrders;