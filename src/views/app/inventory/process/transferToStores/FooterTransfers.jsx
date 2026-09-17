import { Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { InputField } from '@Components/inputFields'

const FooterTransfers = ({notes, onInputChange, disabled}) => {
  return (
    <Row>
      <Colxx xxs="12">
        <InputField
          name="notes"
          label='input.notes'
          value={notes}
          onChange={onInputChange}
          type="textarea"
          disabled={disabled}
        />
      </Colxx>
    </Row>
  )
}

export default FooterTransfers