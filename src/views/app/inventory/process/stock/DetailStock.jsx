import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { Row } from 'reactstrap';

const noop = () => { };

// Totales del detalle: los calcula el back (kardexRules.buildSummary solo los da formateados).
const FIELDS_LEFT = [['maximumCost', 'input.maximumCost'], ['minimumCost', 'input.minimumCost'], ['averageCost', 'input.averageCost'], ['lastPurchaseCost', 'page.stock.input.lastPurchase']];
const FIELDS_RIGHT = [['currentExistence', 'input.currentExistence'], ['totalInputs', 'input.totalInputs'], ['totalOutputs', 'input.totalOutputs'], ['totalValue', 'page.stock.input.totalValue']];

const DetailStock = ({ summary }) => {
  const renderColumn = (fields) => (
    <Row>
      {fields.map(([name, label]) => (
        <Colxx xxs="12" key={name}>
          <InputField name={name} label={label} value={summary[name]} onChange={noop} type="text" disabled />
        </Colxx>
      ))}
    </Row>
  );

  return (
    <Row>
      <Colxx xxs="12" xs="6">{renderColumn(FIELDS_LEFT)}</Colxx>
      <Colxx xxs="12" xs="6">{renderColumn(FIELDS_RIGHT)}</Colxx>
    </Row>
  )
}

export default DetailStock
