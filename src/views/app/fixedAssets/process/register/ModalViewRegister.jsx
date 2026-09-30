import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable';
import DateHelper from '@Helpers/DateHelper';

export const ModalViewRegister = ({ data, setOpen }) => {
  const { dataList, fnViewRegister } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages('page.fixedAssets.input.code'), dataField: 'code', headerStyle: { width: '25%' } },
      { text: IntlMessages('input.name'), dataField: 'name', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.fixedAssets.input.serial1'), dataField: 'serial1', headerStyle: { width: '20%' } },
      {
        text: IntlMessages('page.fixedAssets.input.dateIn'), dataField: 'dateIn', headerStyle: { width: '15%' },
        cell: ({ row }) => DateHelper.format(row.original.dateIn)
      }
    ],
    actions: [{
      color: 'warning',
      icon: 'eye',
      toolTip: 'button.edit',
      onClick: fnViewRegister
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={dataList || []} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}
