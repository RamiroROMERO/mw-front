import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, Row, } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { ReactTableEdit } from '@/components/reactTableEdit';

const Content = (props) => {
  const { match, setLoading } = props;
  const [dataCustomers, setDataCustomers] = useState([]);
  const [table, setTable] = useState({
    title: IntlMessages("page.store.table.title"),
    columns: [{
      label: "page.customers.table.dni", field: "dni",
      headerStyle: {
        textAlign: 'center',
        width: '25%'
      },
      bodyStyle: {
        width: '25%'
      }
    }, {
      label: "page.customers.table.name", field: "name",
      headerStyle: {
        textAlign: 'center',
        width: '25%'

      },
      bodyStyle: { width: '25%' },
      isEditable: false
    }, {
      label: "page.customers.table.phone", field: "phone", isEditable: true,
      headerStyle: {
        textAlign: 'center',
        width: '25%'
      },
      bodyStyle: {
        width: '25%'
      }
    }, {
      label: "page.customers.table.phone", field: "dateAdmission", isEditable: false,
      headerStyle: {
        textAlign: 'center',
        width: '25%'
      },
      bodyStyle: {
        width: '25%'
      }
    }
    ],
    data: dataCustomers,
    onChangeData: setDataCustomers,
    options: {
      columnActions: "options",
      tableHeight: '300px'
    },
    actions: []
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('facCustomers', (resp) => {
      const data = resp.data.map((item) => {
        const elem = {};
        elem.id = item.id
        elem.typeCustomer = item.setCustomerType ? item.setCustomerType.name : ""
        elem.dni = item.rtn
        elem.name = item.nomcli
        elem.dateAdmission = item.fechai
        elem.phone = item.tel
        return elem;
      });
      setDataCustomers(data);
      setTable({ ...table, data });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const viewRecord40 = () => {
    const record40 = dataCustomers.filter(elem => {
      return validInt(elem.id) === 40;
    })[0];
    console.log(record40);
  }

  useEffect(() => {
    fnGetData();
  }, []);

  return (
    <>
      <Row>
        <Colxx xxs={12}>
          <Card>
            <CardBody>
              <ReactTableEdit {...table} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs={12}>
          <Button onClick={viewRecord40}>
            show
          </Button>
        </Colxx>
      </Row>
    </>
  );
}
export default Content;
