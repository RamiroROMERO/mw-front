import React from 'react'
import { NavLink } from 'react-router-dom'
import { Row, Card, CardTitle, } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import IntlMessages from '@/helpers/IntlMessages';
import { adminRoot } from '@/constants/defaultValues';

const Content = (props) => {
  return (
    <Row className="h-100">
      <Colxx xxs="12" md="10" className="mx-auto my-auto">
        <Card className="auth-card">
          <div className="form-side">
            <CardTitle className="mb-4">
              <IntlMessages id="pages.notFound-title" />
            </CardTitle>
            {/* <p className="mb-0 text-muted text-small mb-0">
              <IntlMessages id="pages.notFound-code" />
            </p> */}
            <p className="display-1 font-weight-bold mb-5">404</p>
            <NavLink
              to={adminRoot}
              className="btn btn-primary btn-shadow btn-lg"
            >
              <IntlMessages id="pages.go-back-home" />
            </NavLink>
          </div>
        </Card>
      </Colxx>
    </Row>
  )
}

export default Content