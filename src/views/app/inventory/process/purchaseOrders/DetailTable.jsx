import { useState } from 'react'
import { Colxx } from '@Components/common/CustomBootstrap'
import { Button, Row, Table } from 'reactstrap'
import { formatNumber, IntlMessages } from '@Helpers/Utils'
import Confirmation from '@Containers/ui/confirmationMsg';
import Modal from "@Components/modal";
import ModalEditItem from './ModalEditItem';

// Legacy Grid1: columnas visibles Código/Nombre/Marca/UM/Cantidad/Precio/Subtotal +
// Editar/Eliminar (Descuento, Impuesto, Total y Descripción existen en el cursor pero
// están ocultas en la grilla, Visible=.F. en Grid1.Column6/7/8/9).
const DetailTable = ({orderDetail, setOrderDetail, fnRecalculateTotals}) => {
  const [dataItem, setDataItem] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);

  const fnDeleteProduct = (itemProd)=>{
    setDataItem(itemProd);
    setOpenMsgDelete(true);
  }

  const fnDeleteOkProduct = () =>{
    const newArray = orderDetail.filter((item) => item.id !== dataItem.id);
    setOrderDetail(newArray);
    fnRecalculateTotals(newArray);
    setOpenMsgDelete(false);
  }

  const fnEditProduct = (itemProd) => {
    setDataItem(itemProd);
    setOpenModalEdit(true);
  }

  const propsToMsgDeleteProd = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnDeleteOkProduct,
    title: "alert.question.title"
  }

  const propsToModalEdit = {
    ModalContent: ModalEditItem,
    title: "page.purchaseOrders.modal.editItem.title",
    open: openModalEdit,
    setOpen: setOpenModalEdit,
    maxWidth: "md",
    data: {
      item: dataItem,
      orderDetail,
      setOrderDetail,
      fnRecalculateTotals
    }
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
              <th className = 'd-xs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.brand")}</th>
              <th className = 'd-xs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.unit")}</th>
              <th className = 'd-xxs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.qty")}</th>
              <th className = 'd-xs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.price")}</th>
              <th>{IntlMessages("page.purchaseOrders.input.subTotal")}</th>
              <th>{IntlMessages("page.invoicing.options")}</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item,idx) =>{
              return (
                <tr id={`tr-table-orderDetail-${item.id}`} key={idx}>
                  <th className = 'd-md-none-table-cell' scope="row">{item.productCode}</th>
                  <th scope="row">{item.nameProduct}</th>
                  <td className = 'd-xs-none-table-cell'>{item.marca}</td>
                  <td className = 'd-xs-none-table-cell'>{item.nameUM}</td>
                  <td className = 'd-xxs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.price)}</td>
                  <td align='right'>{formatNumber(item.subTotal)}</td>
                  <td align='right'>
                    <Button type="button" className="btn-circle-table" color="primary" title="Editar"
                      onClick={() => {fnEditProduct(item)}} key={`buttons-edit-${idx}`}>
                      <i className='bi bi-pencil' />
                    </Button>
                    {' '}
                    <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                      onClick={() => {fnDeleteProduct(item)}} key={`buttons-delete-${idx}`}>
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
    <Modal {...propsToModalEdit} />
    </>
  )
}

export default DetailTable
