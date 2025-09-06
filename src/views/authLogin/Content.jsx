import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import { Row, Card, Label, FormGroup, Button } from 'reactstrap';
import { NavLink, useNavigate } from 'react-router-dom';

import { NotificationManager } from '@Components/common/react-notifications';
import { loginUser } from '@Redux/actions';
import { Colxx } from '@Components/common/CustomBootstrap';
import IntlMessages from '@Helpers/IntlMessages';

const validatePassword = (value) => {
  let error;
  if (!value) {
    error = 'user.login.validEmptyPassword';
  } else if (value.length < 4) {
    error = 'user.login.validLegthPassword';
  }
  return error;
};

const validateEmail = (value) => {
  let error;
  if (!value) {
    error = 'user.login.validEmptyEmail';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    error = 'user.login.validEmail';
  }
  return error;
};

const Login = ({ loading, error, loginUserAction }) => {
  const history = useNavigate();

  const [companyId, setCompanyId] = useState(1);
  const [moduleId, setModuleId] = useState(0);
  const [email] = useState('');
  const [password] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (error) {
      setErrors(error);
      NotificationManager.warning(error, 'Login Error', 3000, null, null, '');
    }
    console.log(error);
  }, [error]);

  const onUserLogin = (values) => {
    if (!loading) {
      values.companyId = companyId;
      if (values.companyId !== 0 && values.email !== '' && values.password !== '') {
        loginUserAction(values, history);
      }
    }
  };

  const initialValues = { companyId, moduleId, email, password };

  return (
    <Row className="h-100">
      <Colxx xxs="12" md="10" lg="8" xl="8" className="mx-auto my-auto">
        <Card className="auth-card">
          <div className="position-relative image-side">
            <span className="logo-single-white" />
            <div className='d-none d-md-block'>
              <h3 className="text-white">
                <IntlMessages id="user.login.welcome" />
              </h3>
              <p className="white mb-0">
                <IntlMessages id="user.login.messageToLogin" />
              </p>
            </div>
          </div>
          <div className="form-side">
            <h2 className="mb-4 text-center">
              <IntlMessages id="user.login-title" />
            </h2>
            <hr className='mb-4' />
            <Formik initialValues={initialValues} onSubmit={onUserLogin}>
              <Form className="av-tooltip tooltip-label-bottom">

                <div className='container container-login-form'>
                  <FormGroup className="form-group has-float-label">
                    <Label>
                      <IntlMessages id="user.email" />
                    </Label>
                    <Field
                      className="form-control"
                      name="email"
                      validate={validateEmail}
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">
                        {errors.email}
                      </div>
                    )}
                  </FormGroup>
                  <FormGroup className="form-group has-float-label">
                    <Label>
                      <IntlMessages id="user.password" />
                    </Label>
                    <Field
                      className="form-control"
                      type="password"
                      name="password"
                      validate={validatePassword}
                    />
                    {errors.password && (
                      <div className="invalid-feedback d-block">
                        {errors.password}
                      </div>
                    )}
                  </FormGroup>
                  <div className='mb-4'>
                    <NavLink to="/forgotPassword">
                      <IntlMessages id="user.forgot-password-question" />
                    </NavLink>
                  </div>
                  <div>
                    {errors.password && (
                      <div className="invalid-feedback d-block">
                        {errors.password}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Button
                      color="primary"
                      className={`btn-shadow btn-multiple-state ${loading ? 'show-spinner' : ''
                        }`}
                      size="lg"
                    >
                      <span className="spinner d-inline-block">
                        <span className="bounce1" />
                        <span className="bounce2" />
                        <span className="bounce3" />
                      </span>
                      <span className="label">
                        <IntlMessages id="user.login-button" />
                      </span>
                    </Button>
                  </div>
                </div>
              </Form>
            </Formik>
          </div>
        </Card>
      </Colxx>
    </Row>
  );
};
const mapStateToProps = ({ authUser }) => {
  const { loading, error } = authUser;
  return { loading, error };
};

export default connect(mapStateToProps, {
  loginUserAction: loginUser,
})(Login);
