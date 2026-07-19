import { Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from "@Components/inputFields";
import { formatNumber } from '@Helpers/Utils'

const FooterOrder = ({ total, onInputChangeIndex, setBulkFormIndex }) => {
  return (
    <Row>
      <Colxx xxs="12" xs="8" md="9" lg="10"> </Colxx>
      <Colxx xxs="12" xs="4" md="3" lg="2">
        <InputField
          value={formatNumber(total)}
          name="total"
          disabled
          onChange={onInputChangeIndex}
          type="text"
          label="page.retentionReceipt.input.total"
        />
      </Colxx>
    </Row>
  )
}

export default FooterOrder;