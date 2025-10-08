import React from 'react'
import { ModalBody, ModalFooter, Row, Table } from 'reactstrap'
import { formatNumber, IntlMessages, validFloat } from '@/helpers/Utils';
import { Colxx } from '@/components/common/CustomBootstrap';

export const ModalDetails = (props) => {

  const { data, setOpen } = props;
  const { currentItem: item } = data;

  const totalStock = item.stock.reduce((acc, curr) => {
    acc += validFloat(curr.stock);
    return acc;
  }, 0);

  return (
    <>
      <ModalBody>
        <Table>
          <tbody>
            <tr>
              <th>
                {IntlMessages("common.code")}
              </th>
              <td>
                {item.code}
              </td>
            </tr>
            <tr>
              <th>
                {IntlMessages("common.name")}
              </th>
              <td>
                {item.name}
              </td>
            </tr>
            <tr>
              <th>
                {IntlMessages("common.trademark")}
              </th>
              <td>
                {item.trademarkData?.name}
              </td>
            </tr>
          </tbody>
        </Table>
        <Row>
          <Colxx>
            <h6 className='fw-bolder'>{IntlMessages("common.prices")}</h6>
          </Colxx>
        </Row>
        <Table bordered>
          <thead>
            <tr>
              <th>{IntlMessages("table.column.unit")}</th>
              <th>{IntlMessages("page.productsCatalog.modal.distProduct.table.column.maxPrice")}</th>
              <th>{IntlMessages("page.productsCatalog.modal.distProduct.table.column.medPrice")}</th>
              <th>{IntlMessages("page.productsCatalog.modal.distProduct.table.column.minPrice")}</th>
            </tr>
          </thead>
          <tbody>
            {item.dist.map((ds, idx) => {
              return (
                <tr id={`dist-${idx}`}>
                  <td>{`${ds.undOutName} ${validFloat(ds.valChange) > 1 ? validFloat(ds.valChange, 2) : ''} `}</td>
                  <td className='text-center'>{ds.localMaxPrice}</td>
                  <td className='text-center'>{ds.localMedPrice}</td>
                  <td className='text-center'>{ds.localMinPrice}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
        <Row>
          <Colxx>
            <h6 className='fw-bold'>{IntlMessages("common.warehoused.inventory")}</h6>
          </Colxx>
        </Row>
        <Table bordered>
          <thead>
            <tr>
              <th>{IntlMessages("common.warehouse")}</th>
              <th>{IntlMessages("page.invoicing.input.unitProd")}</th>
              <th>{IntlMessages("page.invoicing.input.qtyProd")}</th>
            </tr>
          </thead>
          <tbody>
            {
              item.stock.map(st => {
                return (

                  item.dist.map((ds, idx) => {
                    return (
                      <tr id={`st-ds-${idx}`}>
                        <td>{st.storeName}</td>
                        <td>{`${ds.undOutName} ${validFloat(ds.valChange) > 1 ? validFloat(ds.valChange, 2) : ''} `}</td>
                        <td className='text-right'>{formatNumber(validFloat(st.stock) / validFloat(ds.valChange), '', 2)}</td>
                      </tr>
                    )
                  })

                )
              })
            }
          </tbody>
        </Table>
        {totalStock > 0 ? <div className="alert alert-success text-right" role="alert">{`${IntlMessages("common.totalStock")}: ${formatNumber(totalStock, '', 2)}`}</div> : <div className="alert alert-danger text-right" role="alert">{`${IntlMessages("common.totalStock")}: 0`}</div>}
      </ModalBody>
      <ModalFooter>
        {/* <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button> */}
      </ModalFooter>
    </>
  )
}
