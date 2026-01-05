import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ReactTable from '@/components/reactTable';
import { IntlMessages } from '@/helpers/Utils';
import { request } from '@/helpers/core';

const ModalViewOrders = ({ data, setOpen }) => {
  const { setListDocuments, dataWorkOrders, setBulkForm, setLoading } = data;

  const fnViewOrder = (itemOrder) => {
    setBulkForm(itemOrder);
    setLoading(true);
    request.GET(`accounting/process/workOrderDetail?fatherId=${itemOrder.id}`, (resp) => {
      const ordersDeta = resp.data;
      setListDocuments(ordersDeta);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setOpen(false);
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.workOrders.modal.viewOrder.table.title"),
    columns: [
      {
        text: IntlMessages("page.workOrders.modal.viewOrder.table.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("page.workOrders.modal.viewOrder.table.description"),
        dataField: "description",
        headerStyle: { width: "60%" }
      },
      {
        text: IntlMessages("page.workOrders.modal.viewOrder.table.dateOut"),
        dataField: "dateOut",
        headerStyle: { width: "15%" }
      }
    ],
    data: dataWorkOrders,
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewOrder,
      }
    ]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalViewOrders