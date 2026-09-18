import { Card, CardBody, Row, Button, Input, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import Modal from '@Components/modal';
import Confirmation from '@Containers/ui/confirmationMsg';
import ModalViewProd from '@Views/app/inventory/settings/productsCatalog/ModalViewProd';
import { useCostAdjustment } from './useCostAdjustment';

const CostAdjustment = ({ setLoading }) => {
  const {
    listStores, storeId, fnStoreChange,
    productCode, productName,
    dateFrom, setDateFrom, dateTo, setDateTo,
    rows, searched,
    openModalProducts, setOpenModalProducts, dataProducts, fnViewProducts, fnSelectProduct,
    fnSearch, fnRowChange, fnSave,
    openMsgDelete, setOpenMsgDelete, fnAskDelete, fnOkDelete
  } = useCostAdjustment({ setLoading });

  const propsToModalViewProd = {
    ModalContent: ModalViewProd,
    title: "page.productsCatalog.modal.viewProduct.title",
    open: openModalProducts,
    setOpen: setOpenModalProducts,
    maxWidth: 'lg',
    data: {
      dataProducts,
      fnSelectItem: fnSelectProduct
    }
  }

  const propsToMsgDelete = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnOkDelete,
    title: "page.costAdjustment.msg.deleteLine.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className="mb-3">
            <CardBody>
              <Row>
                <Colxx xxs="12" md="4">
                  <SearchSelect
                    label="select.storeId"
                    name="storeId"
                    inputValue={storeId}
                    options={listStores}
                    onChange={fnStoreChange}
                  />
                </Colxx>
                <Colxx xxs="12" md="5">
                  <InputField
                    label="page.costAdjustment.input.product"
                    name="productName"
                    value={productCode ? `${productCode} - ${productName}` : ''}
                    disabled
                  />
                </Colxx>
                <Colxx xxs="6" md="1" className="div-action-button-container align-items-end">
                  <Button color="secondary" onClick={fnViewProducts}>
                    <i className="bi bi-search" />
                  </Button>
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="6" md="3">
                  <DateCalendar
                    name="dateFrom"
                    label="page.costAdjustment.input.dateFrom"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </Colxx>
                <Colxx xxs="6" md="3">
                  <DateCalendar
                    name="dateTo"
                    label="page.costAdjustment.input.dateTo"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Colxx>
                <Colxx xxs="12" md="6" className="div-action-button-container align-items-end">
                  <Button color="info" onClick={fnSearch}>
                    <i className="bi bi-search" /> {IntlMessages('page.costAdjustment.button.viewDetail')}
                  </Button>
                  <Button color="primary" onClick={fnSave}>
                    <i className="iconsminds-save" /> {IntlMessages('button.save')}
                  </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>

          {searched && (
            <Table bordered hover size="sm" responsive>
              <thead>
                <tr>
                  <th>{IntlMessages('page.costAdjustment.table.date')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.document')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.number')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.type')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.cost')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.debitQty')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.debitValue')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.creditQty')}</th>
                  <th>{IntlMessages('page.costAdjustment.table.creditValue')}</th>
                  <th>{IntlMessages('table.column.options')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.documentCode}</td>
                    <td>{row.documentId}</td>
                    <td>{row.documentType}</td>
                    <td>
                      <Input
                        bsSize="sm"
                        type="number"
                        value={row.costValue}
                        onChange={(e) => fnRowChange(row.id, 'costValue', e.target.value)}
                      />
                    </td>
                    <td>
                      <Input
                        bsSize="sm"
                        type="number"
                        value={row.debitQty}
                        onChange={(e) => fnRowChange(row.id, 'debitQty', e.target.value)}
                      />
                    </td>
                    <td align="right">{formatNumber(row.debitValue)}</td>
                    <td>
                      <Input
                        bsSize="sm"
                        type="number"
                        value={row.creditQty}
                        onChange={(e) => fnRowChange(row.id, 'creditQty', e.target.value)}
                      />
                    </td>
                    <td align="right">{formatNumber(row.creditValue)}</td>
                    <td align="center">
                      <Button type="button" className="btn-circle-table" color="outline-danger" title={IntlMessages('button.delete')}
                        onClick={() => fnAskDelete(row)}>
                        <i className="bi bi-trash" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center">{IntlMessages('table.noDataAvailable')}</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Confirmation {...propsToMsgDelete} />
    </>
  );
}
export default CostAdjustment;
