/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Row } from 'reactstrap';
import IntlMessages from '@/helpers/IntlMessages';
import { adminRoot } from '@/constants/defaultValues';
import { Colxx, Separator } from '@/components/common/CustomBootstrap';

const getMenuTitle = (sub) => {
  if (`/${sub}` === adminRoot) return <IntlMessages id="menu.home" />;
  return <IntlMessages id={`menu.${sub}`} />;
};

const getUrl = (path, sub) => {
  return path.split(sub)[0] + sub;
};

const BreadcrumbContainer = ({ heading, match }) => {
  const { screenTitle, breadCrumbPath: path } = useSelector(state => state.generalData);
  const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
  const [companyLogo, setCompanyLogo] = useState("");

  useEffect(() => {
    if (companyData && companyData.logo2) {
      const nameLogo = companyData.logo2.split('/')[companyData.logo2.split('/').length - 1]
      if (nameLogo) {
        setCompanyLogo(`/assets/logos/${nameLogo}`);
      }
    }
  }, [])


  return (
    <>
      <Row className='row justify-content-between'>
        <Colxx xs={12} sm={8} md={9}>
          {screenTitle && (
            <h1>
              <IntlMessages id={screenTitle} />
            </h1>
          )}
          <BreadcrumbItems path={path} />
        </Colxx>
        <Colxx sm={4} md={3} className="d-none d-sm-block text-right">
          {companyLogo !== "" && <img className='breadcrumb-logo' src={companyLogo} alt="Logo" />}
        </Colxx>
      </Row>
      <Separator className="mb-4" />
    </>
  );
};

const BreadcrumbItems = ({ path }) => {
  path = path.substr(1);
  let paths = path.split('/');
  if (paths[paths.length - 1].indexOf(':') > -1) {
    paths = paths.filter((x) => x.indexOf(':') === -1);
  }
  return (
    <>
      <Breadcrumb className="pt-0 breadcrumb-container d-none d-sm-block d-lg-inline-block">
        {paths.map((sub, index) => {
          return (
            <BreadcrumbItem key={index} active={paths.length === index + 1}>
              {paths.length !== index + 1 ? (
                <NavLink to={`/${getUrl(path, sub, index)}`}>
                  {getMenuTitle(sub)}
                </NavLink>
              ) : (
                getMenuTitle(sub)
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </>
  );
};

export default BreadcrumbContainer;
