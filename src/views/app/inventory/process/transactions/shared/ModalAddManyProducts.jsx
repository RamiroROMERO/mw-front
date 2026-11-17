import { useMemo, useRef, useState } from 'react'
import { ModalBody, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'
import { ModalSearchContent } from '@Components/modalSearch'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { IntlMessages, formatNumber } from '@Helpers/Utils'

// "Agregar varios productos" (compartido por Traslados, Requisiciones, Reintegros y Ajustes): busca en el servidor los
// productos del almacén origen, con su existencia; cada clic en el ícono suma la cantidad digitada al detalle (si el
// producto ya está, suma). El modal queda abierto para agregar más. El back (`availableProducts`) pagina de 50 en 50.
// data = { url, storeId, employees?, onEmployeeSearch?, fnAddLine(product, qty, employee?) => boolean }; `employees` ([{ value, label }]) solo en Requisiciones con RRHH activo.
const mapRow = (item) => ({ ...item, costText: formatNumber(item.cost), stockText: formatNumber(item.stock) })

const ModalAddManyProducts = ({ data, setOpen }) => {
  const { url, storeId, fnAddLine, employees, onEmployeeSearch } = data
  const [qty, setQty] = useState('1')
  const [employeeId, setEmployeeId] = useState(0)
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

  // La tabla puede conservar el `onSelect` de un render anterior: cantidad, empleado y la función de agregar se leen de una ref
  // que siempre tiene lo vigente.
  const current = useRef({})
  current.current = { qty, employeeId, employees, fnAddLine }

  const onSelect = (row) => {
    const { qty: currentQty, employeeId: currentEmployee, employees: list, fnAddLine: addLine } = current.current
    const employee = list ? list.find((item) => item.value === currentEmployee) : null
    if (addLine(row, currentQty, employee ? { id: employee.value, name: employee.label } : null)) setAdded((count) => count + 1)
  }

  const config = useMemo(() => ({
    url, columns, mapRow, extraParams: { storeId }, onSelect, selectIcon: 'plus', selectToolTip: textAdd
    // onSelect cambia con la cantidad digitada: la tabla debe usar la versión vigente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [url, columns, storeId, textAdd, qty, fnAddLine, employeeId, employees])

  return (
    <>
      <ModalBody className="pb-0">
        <Row>
          <Colxx xxs="6" sm="3">
            <InputField name="qtyAdd" label="input.qty" value={qty} onChange={(e) => setQty(e.target.value)} type="text" />
          </Colxx>
          {Array.isArray(employees) && (
            <Colxx xxs="12" sm="6">
              <SearchSelect
                label="page.requisitions.select.employee"
                name="employeeId"
                inputValue={employeeId}
                options={employees}
                onInputChange={onEmployeeSearch}
                onChange={(e) => setEmployeeId(Number(e.target.value) || 0)}
              />
            </Colxx>
          )}
          <Colxx xxs="6" sm={Array.isArray(employees) ? '3' : '9'} className="d-flex align-items-center">
            <span className="text-muted">{`${textAdded}: ${added}`}</span>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalSearchContent data={config} setOpen={setOpen} />
    </>
  )
}

export default ModalAddManyProducts
