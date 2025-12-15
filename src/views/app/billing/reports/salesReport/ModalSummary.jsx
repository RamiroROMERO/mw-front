import ReactTable from '@/components/reactTable'
import { Colxx } from '@/components/common/CustomBootstrap';
import { formatNumber, IntlMessages } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { InputField } from '@/components/inputFields';

const ModalSummary = ({setOpen, data}) => {
  const {tableSummary, totalsSummary} = data;

  const {subtotal, discount, tax, total, costValue, saleDiff} = totalsSummary;

  return (
    <>
      <ModalBody>
        <Row className='mb-3'>
          <Colxx xxs="12">
            <ReactTable {...tableSummary} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: subtotal !== undefined ? 'block' : 'none' }}>
            <InputField
              name="subtotal"
              label='input.subtotal'
              value={formatNumber(subtotal)}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: discount !== undefined ? 'block' : 'none' }}>
            <InputField
              name="discount"
              label='input.discount'
              value={formatNumber(discount)}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: tax !== undefined ? 'block' : 'none' }}>
            <InputField
              name="tax"
              label='input.tax'
              value={formatNumber(tax)}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: total !== undefined ? 'block' : 'none' }}>
            <InputField
              name="total"
              label='input.total'
              value={formatNumber(total)}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: costValue !== undefined ? 'block' : 'none' }}>
            <InputField
              name="costValue"
              label='input.cost'
              value={formatNumber(costValue)}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: saleDiff !== undefined ? 'block' : 'none' }}>
            <InputField
              name="saleDiffValue"
              label='input.saleDiff'
              value={formatNumber(saleDiff)}
              type="text"
              disabled
            />
          </Colxx>
          <Colxx xxs="12" xs="6" sm="4" lg="3" xxl="2" style={{ display: saleDiff !== undefined ? 'block' : 'none' }}>
            <InputField
              name="salePercent"
              label='page.overtime.input.percentValue'
              value={formatNumber((saleDiff / total) * 100, '', 2)}
              type="text"
              disabled
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={()=>{setOpen(false)}}>
          <i className="bi bi-box-arrow-right"/> {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSummary