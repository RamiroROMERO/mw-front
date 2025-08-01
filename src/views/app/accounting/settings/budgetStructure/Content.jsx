import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { useBudget } from './useBudget';
import ControlPanel from '@/components/controlPanel';
import { Separator } from '@/components/common/CustomBootstrap';
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