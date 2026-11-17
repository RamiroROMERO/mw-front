import { Button, Row, Table } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages, formatNumber } from '@Helpers/Utils'
import Confirmation from '@Containers/ui/confirmationMsg';
import { useDetailTable } from './useDetailTable'

const DetailTable = ({transferDetail, setTransferDetail, setBulkFormDeta, disabled, showEmployee, showLot, hideEdit}) => {

  const {openMsgDelete, setOpenMsgDelete, fnEditProduct, fnDeleteProduct, fnDeleteOkProduct} = useDetailTable({setBulkFormDeta, transferDetail, setTransferDetail});

  // IntlMessages es un hook: se llama siempre, no dentro de la condición.
  const textEmployee = IntlMessages("page.requisitions.table.column.employee");

  const textLot = IntlMessages("input.lotCode");

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
              {showEmployee && <th>{textEmployee}</th>}
              {showLot && <th>{textLot}</th>}
              <th className = 'd-xs-none-table-cell'>{IntlMessages("table.column.cost")}</th>
              <th className = 'd-xxs-none-table-cell'>{IntlMessages("table.column.qty")}</th>
              <th>{IntlMessages("table.column.total")}</th>
              {!disabled && <th>{IntlMessages("table.column.options")}</th>}
            </tr>
          </thead>
          <tbody>
            {transferDetail.map((item,idx) =>{
              return (
                <tr id={`tr-table-transferDetail-${item.id}`} key={idx}>
                  <th className = 'd-md-none-table-cell' scope="row">{item.productCode}</th>
                  <th scope="row">{item.nameProduct}</th>
                  {showEmployee && <td>{item.employeeName || ''}</td>}
                  {showLot && <td>{[item.lotCode, item.expirationDate && item.expirationDate !== '1900-01-01' ? item.expirationDate : ''].filter(Boolean).join(' / ')}</td>}
                  <td className = 'd-xs-none-table-cell' align='right'>{formatNumber(item.cost)}</td>
                  <td className = 'd-xxs-none-table-cell' align='right'>{formatNumber(item.qty)}</td>
                  <td align='right'>{formatNumber(item.total)}</td>
                  {!disabled && (
                    <td align='right'>
                      {!hideEdit && <Button type="button" className="btn-circle-table" color="outline-warning" title="Editar"
                        onClick={() => {fnEditProduct(item)}} key={`button1-${idx}`}>
                        <i className='bi bi-pencil' />
                      </Button>}
                      <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar"
                        onClick={() => {fnDeleteProduct(item)}} key={`button2-${idx}`}>
                        <i className='bi bi-trash' />
                      </Button>
                    </td>
                  )}
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