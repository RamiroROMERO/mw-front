import { useMemo, useState } from 'react'
import { ModalBody, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { ModalSearchContent } from '@Components/modalSearch'
import { IntlMessages, formatNumber } from '@Helpers/Utils'

// "Agregar varios productos" (compartido por Traslados, Requisiciones, Reintegros y Ajustes): busca en el servidor los
// productos del almacén origen, con su existencia; cada clic en el ícono suma la cantidad digitada al detalle (si el
// producto ya está, suma). El modal queda abierto para agregar más. El back (`availableProducts`) pagina de 50 en 50.
// data = { url, storeId, fnAddLine(product, qty) => boolean }
const mapRow = (item) => ({ ...item, costText: formatNumber(item.cost), stockText: formatNumber(item.stock) })

const ModalAddManyProducts = ({ data, setOpen }) => {
  const { url, storeId, fnAddLine } = data
  const [qty, setQty] = useState('1')
  const [added, setAdded] = useState(0)

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textCode = IntlMessages('table.column.code')
  const textName = IntlMessages('table.column.name')
  const textStock = IntlMessages('input.currentExistence')
  const textCost = IntlMessages('table.column.cost')
  const textAdd = IntlMessages('button.add')
  const textAdded = IntlMessages('page.transfersToStores.addMany.added')

  const columns = useMemo(() => [
    { text: textCode, dataField: 'productCode', headerStyle: { width: '20%' } },
    { text: textName, dataField: 'name', headerStyle: { width: '45%' } },
    { text: textStock, dataField: 'stockText', headerStyle: { width: '17%' }, style: { textAlign: 'right' } },
    { text: textCost, dataField: 'costText', headerStyle: { width: '18%' }, style: { textAlign: 'right' } }
  ], [textCode, textName, textStock, textCost])

  const onSelect = (row) => {
    if (fnAddLine(row, qty)) setAdded((count) => count + 1)
  }

  const config = useMemo(() => ({
    url, columns, mapRow, extraParams: { storeId }, onSelect, selectIcon: 'plus', selectToolTip: textAdd
    // onSelect cambia con la cantidad digitada: la tabla debe usar la versión vigente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [url, columns, storeId, textAdd, qty, fnAddLine])

  return (
    <>
      <ModalBody className="pb-0">
        <Row>
          <Colxx xxs="6" sm="3">
            <InputField name="qtyAdd" label="input.qty" value={qty} onChange={(e) => setQty(e.target.value)} type="text" />
          </Colxx>
          <Colxx xxs="6" sm="9" className="d-flex align-items-center">
            <span className="text-muted">{`${textAdded}: ${added}`}</span>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalSearchContent data={config} setOpen={setOpen} />
    </>
  )
}

export default ModalAddManyProducts
