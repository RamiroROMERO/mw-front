import React from 'react'
import Confirmation from '@/containers/ui/confirmationMsg';
import { Colxx } from '@/components/common/CustomBootstrap'
import { Button, Row, Table } from 'reactstrap'
import { formatNumber, IntlMessages } from '@/helpers/Utils'
import { InputField } from '@/components/inputFields'
import { useDetailTable } from './useDetailTable'

const DetailTable = ({valueTotal, notes, onInputChange, ticketDetail, setTicketDetail, onBulkForm, onBulkFormDeta, sendForm, formValidation}) => {

  const {openMsgDelete, setOpenMsgDelete, fnEditProduct, fnDeleteProduct, fnDeleteOkProduct} = useDetailTable({ticketDetail, setTicketDetail, onBulkForm, onBulkFormDeta});

  const {valueTotalValid} = formValidation;

  const propsToMsgDeleteProd = {
    open: openMsgDelete,
    setOpen: setOpenMsgDelete,
    fnOnOk: fnDeleteOkProduct,
    title: "alert.question.title"
  }

  return (
    <>
    <Row>
      <Colxx xxs="12">
      <Table bordered hover size='sm'>
          <thead>
            <tr>
              <th className = 'd-md-none-table-cell'>{IntlMessages("page.purchaseOrders.input.productCode")}</th>
              <th>{IntlMessages("page.purchaseOrders.input.nameProduct")}</th>
              <th className = 'd-xxs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.qty")}</th>
              <th className = 'd-xs-none-table-cell'>{IntlMessages("page.purchaseOrders.input.price")}</th>
              <th>{IntlMessages("page.purchaseOrders.input.total")}</th>
              <th>{IntlMessages("page.invoicing.options")}</th>
            </tr>
          </thead>
          <tbody>
            {ticketDetail.map((item,idx) =>{
              return (
                <tr id={`tr-table-ticketDetail-${item.id}`} key={idx}>
                  <th className = 'd-md-none-table-cell' scope="row">{item.productCode}</th>
                  <th scope="row">{item.nameProduct}</th>
                  <td className = 'd-xxs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.price)}</td>
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
    <Row>
      <Colxx xxs="12" md="9">
        <InputField
          name="notes"
          label='input.observations'
          value={notes}
          onChange={onInputChange}
          type="textarea"
        />
      </Colxx>
      <Colxx xxs="12" md="3">
        <InputField
          name="valueTotal"
          label='input.total'
          value={formatNumber(valueTotal, "L. ", 2)}
          onChange={onInputChange}
          type="text"
          invalid={sendForm && !!valueTotalValid}
          feedbackText={sendForm && (valueTotalValid || null)}
          disabled
        />
      </Colxx>
    </Row>
    <Confirmation {...propsToMsgDeleteProd}/>
    </>
  )
}

export default DetailTable