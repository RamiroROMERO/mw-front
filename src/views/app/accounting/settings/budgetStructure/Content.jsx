import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { useBudget } from './useBudget';
import ControlPanel from '@Components/controlPanel';
import { Separator } from '@Components/common/CustomBootstrap';
import FormBudget from './FormBudget';

const BudgetStructure = (props) => {

  const { propsToControlPanel, formState, onInputChange } = useBudget({});

  const propsToFormBudget = {
    formState,
    onInputChange
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-4" />
              <FormBudget {...propsToFormBudget} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default BudgetStructure;