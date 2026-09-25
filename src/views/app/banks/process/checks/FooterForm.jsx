import { Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from "@Components/inputFields";
import { validFloat } from "@Helpers/Utils";

export const FooterForm = ({ lines }) => {
  const totalDebit = (lines || []).reduce((sum, l) => sum + (validFloat(l.valueDebit) || 0), 0);
  const totalCredit = (lines || []).reduce((sum, l) => sum + (validFloat(l.valueCredit) || 0), 0);
  const diference = validFloat(totalDebit - totalCredit);

  return (
    <Row>
      <Colxx xxs="12" sm="4">
        <InputField
          value={totalDebit.toFixed(2)}
          name="total"
          label="page.checks.input.totalDebit"
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" sm="4">
        <InputField
          value={totalCredit.toFixed(2)}
          name="totalValue"
          label="page.checks.input.totalCredit"
          type="text"
          disabled
        />
      </Colxx>
      <Colxx xxs="12" sm="4">
        <InputField
          value={diference.toFixed(2)}
          name="diference"
          onChange={() => { }}
          label="page.checks.input.diference"
          type="text"
          disabled
        />
      </Colxx>
    </Row>
  )
}
