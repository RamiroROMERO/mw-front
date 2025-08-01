import React from 'react'
import { Colxx } from '@/components/common/CustomBootstrap'
import { Button, Row, Table } from 'reactstrap'
import { formatNumber, IntlMessages } from '@/helpers/Utils'
import Confirmation from '@/containers/ui/confirmationMsg';
import useDetailTable from './useDetailTable';

const DetailTable = ({purchaseDetail, setPurchaseDetail, setBulkForm, setBulkFormDeta}) => {

  const {openMsgDelete, setOpenMsgDelete, fnEditProduct, fnDeleteProduct, fnDeleteOkProduct} = useDetailTable({purchaseDetail, setPurchaseDetail, setBulkForm, setBulkFormDeta});

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
            {purchaseDetail.map((item,idx) =>{
              return (
                <tr id={`tr-table-purchaseDetail-${item.id}`} key={idx}>
                  <th className = 'd-md-none-table-cell' scope="row">{item.productCode}</th>
                  <th scope="row">{item.nameProduct}</th>
                  <td className = 'd-xxs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.price)}</td>
                  <td className = 'd-md-none-table-cell' align='right'>{formatNumber(item.subTotal)}</td>
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.discount)}</td>
                  <td className = 'd-md-none-table-cell' align='right'>{formatNumber(item.tax)}</td>
                  <td align='right'>{formatNumber(item.total)}</td>
                  <td align='right'>
                    <Button type="button" className="btn-circle-table" color="outline-warning" title="Editar"
                      onClick={() => {fnEditProduct(item)}} key={`button1-${idx}`}>
                      <i className='bi bi-pencil' />
                    </Button>
                    <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar"
                      onClick={() => {fnDeleteProduct(item)}} key={`button2-${idx}`}>
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