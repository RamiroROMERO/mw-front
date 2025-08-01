import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable";

const ModalViewProv = (props) => {
  const { data, setOpen } = props;
  const { dataProviders, fnSelectItem } = data;

  const [table, setTable] = useState({
    title: IntlMessages("page.providers.modal.viewProv.table.title"),
    columns: [
      { text: IntlMessages("page.providers.modal.viewProv.table.dni"), dataField: "dni", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("page.providers.modal.viewProv.table.name"), dataField: "name", headerStyle: { 'width': '50%' } },
      // { text: IntlMessages("table.column.options"), dataField: "options", headerStyle: { 'width': '15%' }, style: { textAlign: 'right' } }
    ],
    data: dataProviders,
    actions: [{
      color: 'info',
      icon: 'eye',
      toolTip: IntlMessages('button.view'),
      onClick: fnSelectItem
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable
              {...table}
            />
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
  )
}

export default ModalViewProv;