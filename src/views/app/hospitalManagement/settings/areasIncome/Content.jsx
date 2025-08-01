import React from 'react';
import { Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';

const Content = (props) => {
  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody />
          </Card>
        </Colxx>
      </Row>
    </>
  );
}
export default Content;