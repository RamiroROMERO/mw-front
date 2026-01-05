import React, { useEffect, useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { Colxx } from '@/components/common/CustomBootstrap'
import { request } from '@/helpers/core'
import ReactTable from '@/components/reactTable'
import { formatDate } from '@Helpers/Utils'

const ModalSearch = ({ data, setOpen }) => {
  const { setLoading, onBulkForm, setListCities, fnGetEvents } = data;

  const fnViewFile = (row) => {
    setLoading(true);
    request.GET(`admin/locateMunic?codeDepto=${row.estateCode}`, (resp) => {
      const munic = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: item.name,
          codeDepto: item.codeDepto
        }
      });
      setListCities(munic);
      onBulkForm(row);
      setOpen(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    fnGetEvents(row.id);
  }

  const [table, setTable] = useState({
    title: IntlMessages("menu.hospitalManagement.patientFiles"),
    columns: [
      { text: IntlMessages("input.codePhysic"), dataField: "code", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.dni"), dataField: "dni", headerStyle: { 'width': '25%' } },
      { text: IntlMessages("table.column.name"), dataField: "name", headerStyle: { 'width': '45%' } },
      {
        text: IntlMessages("table.column.dateIn"), dataField: "dateIn", headerStyle: { 'width': '15%' },
        cell: ({ row }) => {
          return (formatDate(row.original.dateIn));
        }
      }
    ],
    data: [],
    options: {
      columnActions: 'options'
    },
    actions: [
      {
        color: "primary",
        icon: "eye",
        toolTip: IntlMessages("button.view"),
        onClick: fnViewFile
      }
    ]
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('hospital/process/expedients', (resp) => {
      const data = resp.data;
      setTable({ ...table, data });
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
  }, []);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalSearch