import React, { useState } from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { Button, Row, Table } from 'reactstrap'
import { formatNumber, IntlMessages, validFloat } from '@/helpers/Utils'
import Confirmation from '@/containers/ui/confirmationMsg';

const DetailTable = ({orderDetail, setOrderDetail, setBulkForm}) => {
  const [dataItem, setDataItem] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  const fnDeleteProduct = (itemProd)=>{
    setDataItem(itemProd);
    setOpenMsgDelete(true);
  }

  const fnDeleteOkProduct = () =>{
    const newArray = orderDetail.filter((item) => item.id !== dataItem.id);
    setOrderDetail(newArray);

    const sumDiscount = newArray.map(item => validFloat(item.discount)).reduce((prev, curr) => prev + curr, 0);
    const sumExempt = newArray.map(item => validFloat(item.subTotExeValue)).reduce((prev, curr) => prev + curr, 0);

    const sumTaxes = newArray.map(item => validFloat(item.tax)).reduce((prev, curr) => prev + curr, 0);
    const sumTaxed = newArray.map(item => validFloat(item.subtotTaxValue)).reduce((prev, curr) => prev + curr, 0);
    const sumTotal = newArray.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);

    const deleteProduct = {
      valueExcent: sumExempt,
      valueTaxed: sumTaxed,
      valueTax: sumTaxes,
      valueDiscount: sumDiscount,
      valueTotal: sumTotal
    }
    setBulkForm(deleteProduct);
    setOpenMsgDelete(false);
  }

  const propsToMsgDeleteProd = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnDeleteOkProduct,
    title: "alert.question.title"
  }

  return (
    <>
    <Row className='mt-3'>
      <Colxx xxs="12">
        <Table bordered hover size='sm'>
          <thead>
            <tr>
              <th className = 'd-md-none-table-cell'>{IntlMessages("page.purchaseOrders.input.productCode")}</th>
              <th>{IntlMessages("page.purchaseOrders.input.nameProduct")}</th>
              <th className = 'd-xxs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.qty")}</th>
              <th className = 'd-xs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.price")}</th>
              <th className = 'd-md-none-table-cell'>{IntlMessages("page.purchaseOrders.input.subTotal")}</th>
              <th className = 'd-xs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.discount")}</th>
              <th className = 'd-md-none-table-cell'>{IntlMessages("page.purchaseOrders.input.tax")}</th>
              <th>{IntlMessages("page.purchaseOrders.input.total")}</th>
              <th>{IntlMessages("page.invoicing.options")}</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item,idx) =>{
              return (
                <tr id={`tr-table-orderDetail-${item.id}`} key={idx}>
                  <th className = 'd-md-none-table-cell' scope="row">{item.productCode}</th>
                  <th scope="row">{item.nameProduct}</th>
                  <td className = 'd-xxs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.price)}</td>
                  <td className = 'd-md-none-table-cell' align='right'>{formatNumber(item.subTotal)}</td>
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.discount)}</td>
                  <td className = 'd-md-none-table-cell' align='right'>{formatNumber(item.tax)}</td>
                  <td align='right'>{formatNumber(item.total)}</td>
                  <td align='right'>
                    <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                      onClick={() => {fnDeleteProduct(item)}} key={`buttons-${idx}`}>
                      <i className='bi bi-trash' />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Colxx>
    </Row>
    <Confirmation {...propsToMsgDeleteProd}/>
    </>
  )
}

export default DetailTable