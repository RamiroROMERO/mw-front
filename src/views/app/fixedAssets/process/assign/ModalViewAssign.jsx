import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable';
import DateHelper from '@Helpers/DateHelper';

export const ModalViewAssign = ({ data, setOpen }) => {
  const { dataList, fnViewAssign } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', headerStyle: { width: '15%' }, cell: ({ row }) => DateHelper.format(row.original.date) },
      { text: IntlMessages('page.fixedAssets.title.asset'), dataField: 'assetName', headerStyle: { width: '35%' } },
      { text: IntlMessages('page.fixedAssets.select.responsible'), dataField: 'responsibleName', headerStyle: { width: '25%' } },
      { text: IntlMessages('page.fixedAssets.select.area'), dataField: 'areaName', headerStyle: { width: '25%' } }
    ],
    actions: [{
      color: 'warning',
      icon: 'view',
      toolTip: 'button.edit',
      onClick: fnViewAssign
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
