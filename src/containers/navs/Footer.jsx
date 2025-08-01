import React from 'react';
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';

const Footer = () => {
  const fullYear = new Date().getFullYear();
  const companyData = JSON.parse(localStorage.getItem("mw_current_company"));
  return (
    <footer className="page-footer">
      <div className="footer-content">
        <div className="container-fluid">
          <Row>
            <Colxx xxs="12" sm="6">
              <p className="mb-0 text-muted">{`${companyData?.dni} | ${companyData?.name}`}</p>
            </Colxx>
            <Colxx className="col-sm-6 d-none d-sm-block">
              <div className='pt-0 pr-0 float-right'>
                <p className="mb-0 text-muted">{`Multiwork ${fullYear} `}</p>
              </div>
            </Colxx>
          </Row>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
