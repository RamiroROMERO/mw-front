import { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import ReactTable from "@Components/reactTable";

export const ModalViewLittleCash = (props) => {
  const { data, setOpen } = props;
  const { dataList, fnViewLittleCash } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { width: '15%' } },
      { text: IntlMessages("page.littleCash.input.beneficiary"), dataField: "providerName", headerStyle: { width: '35%' } },
      { text: IntlMessages("page.littleCash.input.concept"), dataField: "description", headerStyle: { width: '30%' } },
      { text: IntlMessages("table.column.value"), dataField: "valuePayment", headerStyle: { width: '20%' } }
    ],
    data: dataList || [],
    actions: [{
      color: 'info',
      icon: 'eye',
      toolTip: IntlMessages('button.view'),
      onClick: fnViewLittleCash
    }]
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
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}
