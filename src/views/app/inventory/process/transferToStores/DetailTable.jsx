import React from 'react'
import { Button, Row, Table } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages, formatNumber } from '@/helpers/Utils'
import Confirmation from '@/containers/ui/confirmationMsg';
import { useDetailTable } from './useDetailTable'

const DetailTable = ({transferDetail, setTransferDetail, setBulkFormDeta}) => {

  const {openMsgDelete, setOpenMsgDelete, fnEditProduct, fnDeleteProduct, fnDeleteOkProduct} = useDetailTable({setBulkFormDeta, transferDetail, setTransferDetail});

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
              <th className = 'd-md-none-table-cell'>{IntlMessages("table.column.code")}</th>
              <th>{IntlMessages("table.column.name")}</th>
              <th className = 'd-xs-none-table-cell'>{IntlMessages("table.column.cost")}</th>
              <th className = 'd-xxs-none-table-cell'>{IntlMessages("table.column.qty")}</th>
              <th>{IntlMessages("table.column.total")}</th>
              <th>{IntlMessages("table.column.options")}</th>
            </tr>
          </thead>
          <tbody>
            {transferDetail.map((item,idx) =>{
              return (
                <tr id={`tr-table-transferDetail-${item.id}`} key={idx}>
                  <th className = 'd-md-none-table-cell' scope="row">{item.productCode}</th>
                  <th scope="row">{item.nameProduct}</th>
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.cost)}</td>
                  <td className = 'd-xxs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
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