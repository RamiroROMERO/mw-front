import React from 'react'
import useTableConf from './useTableConf';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@/helpers/Utils";
import ReactTable from "@/components/reactTable"

const ModalViewDocuments = (props) => {
  const { data, setOpen } = props;
  const { tableData, fnViewDocument } = data;

  const { tableInfo } = useTableConf(tableData, fnViewDocument);

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