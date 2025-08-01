import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import { Row, Card, Label, FormGroup, Button } from 'reactstrap';
import { NavLink, useNavigate } from 'react-router-dom';

import { NotificationManager } from '@Components/common/react-notifications';
import { loginUser } from '@Redux/actions';
import { Colxx } from '@Components/common/CustomBootstrap';
import IntlMessages from '@Helpers/IntlMessages';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';

const validatePassword = (value) => {
  let error;
  if (!value) {
    error = 'Please enter your password';
  } else if (value.length < 4) {
    error = 'Value must be longer than 3 characters';
  }
  return error;
};

const validateEmail = (value) => {
  let error;
  if (!value) {
    error = 'Please enter your email address';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    error = 'Invalid email address';
  }
  return error;
};

const Login = ({ loading, error, loginUserAction }) => {
  const history = useNavigate();

  const [companyList, setCompanyList] = useState([]);
  const [moduleList, setModuleList] = useState([]);
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
  }, [error]);

  const fnGetCompanyList = () => {
    request.GET('getCompanyList', resp => {
      const { data } = resp;
      const newData = data.map(elem => {
        elem.name = elem.name2;
        return elem;
      });
      setCompanyList(newData);
    }, err => {
      console.log(err)
    })
  }

  const fnGetModuleList = (e) => {
    // console.log("target", e);
    setCompanyId(e);
    setModuleList([]);
    if (validInt(e) === 0) return;
    request.GET(`getModuleList?companyId=${e}`, resp => {
      const { data } = resp;
      setModuleList(data);
    }, err => {
      console.log(err);
    })
  }

  useEffect(() => {
    fnGetCompanyList();
  }, [])

  const onUserLogin = (values) => {
    if (!loading) {
      values.companyId = companyId;
      if (values.companyId !== 0 && values.email !== '' && values.password !== '') {
        loginUserAction(values, history);
      }
    }
  };

  // const companyList = [{
  //   id:1,
  //   name: 'SOMESINSA',
  //   image: 'assets/logos/cmcc'
  // }, {
  //   id:2,
  //   name: 'LAMECO',
  //   image: 'assets/logos/lameco'
  // }, {
  //   id:3,
  //   name: 'SOMEIMSA',
  //   image: 'assets/logos/someimsa'
  // }];

  const initialValues = { companyId, moduleId, email, password };

  return (
    <Row className="h-100">
      <Colxx xxs="12" md="10" lg="8" xl="8" className="mx-auto my-auto">
        <Card className="auth-card">
          <div className="position-relative image-side">
            <span className="logo-single-white" />
            {/* <NavLink to="#" className="white">
            </NavLink> */}
            <div className='d-none d-md-block'>
              <h3 className="text-white">BIENVENIDO</h3>
              <p className="white mb-0">
                Utilice sus credenciales para iniciar sesión.
              </p>
            </div>
          </div>
          <div className="form-side">
            <h2 className="mb-4 text-center">
              <IntlMessages id="user.login-title" />
            </h2>
            <hr className='mb-4' />
            {/* <CustomRadio 
              title={"user.login.selectCompany"}
              fnExecute = {fnGetModuleList}
              name="companyId"
              list={companyList} /> */}
            <Formik initialValues={initialValues} onSubmit={onUserLogin}>
              {/* {({ errors, touched }) => ( */}
              <Form className="av-tooltip tooltip-label-bottom">

                <div className='container container-login-form'>
                  {/* <SimpleSelect
                      label="user.login.module"
                      name="moduleId"
                      id="moduleId"
                      value={moduleId}
                      onChange= {(e)=>setModuleId(e.target.value)}
                      options = {moduleList}
                    /> */}
                  <FormGroup className="form-group has-float-label">
                    <Label>
                      <IntlMessages id="user.email" />
                    </Label>
                    <Field
                      className="form-control"
                      name="email"
                      validate={validateEmail}
                    />
                    {/* {errors.email && touched.email && ( */}
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
                    {/* errors.password && touched.password &&  */}
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
                  <div className="text-right">
                    {/* <div className="d-flex justify-content-between align-items-center"> */}

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
