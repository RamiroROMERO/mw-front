import { useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from '@Helpers/Utils';
import ReactTable from '@Components/reactTable';

export const ModalSelectAsset = ({ data, setOpen }) => {
  const { assetList, fnSelectAsset } = data;

  const [table] = useState({
    columns: [
      { text: IntlMessages('page.fixedAssets.input.code'), dataField: 'code', headerStyle: { width: '25%' } },
      { text: IntlMessages('input.name'), dataField: 'name', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.fixedAssets.input.serial1'), dataField: 'serial1', headerStyle: { width: '20%' } },
      { text: IntlMessages('table.column.value'), dataField: 'currentValue', headerStyle: { width: '15%' } }
    ],
    actions: [{
      color: 'primary',
      icon: 'check-lg',
      toolTip: 'button.accept',
      onClick: fnSelectAsset
    }]
  });

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} data={assetList || []} />
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
