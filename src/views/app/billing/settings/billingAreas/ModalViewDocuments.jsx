import React from 'react'
import { useTableConfig } from '@Hooks';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable"

const ModalViewDocuments = (props) => {
  const { data, setOpen } = props;
  const { tableData, fnViewDocument } = data;

  const { tableInfo } = useTableConfig({
    title: IntlMessages("page.billingAreas.table.title"),
    columns: [
      { text: IntlMessages("page.billingAreas.table.name"), dataField: "name", headerStyle: { 'width': '55%' } },
      { text: IntlMessages("page.billingAreas.table.active"), dataField: "status", type: 'boolean', headerStyle: { 'width': '20%' } },
    ],
    data: tableData,
    actions: [{
      color: 'primary',
      icon: 'eye',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewDocument
    }],
    options: {
      enabledRowSelection: false
    }
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable
              {...tableInfo}
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

export default ModalViewDocuments