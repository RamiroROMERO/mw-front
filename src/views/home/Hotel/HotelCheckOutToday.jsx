import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, CardBody, CardTitle, Col, Row, Table } from 'reactstrap'
import DateCalendar from '@Components/dateCalendar';
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request } from '@/helpers/core';
import Modal from '@Components/modal';
import ModalInvoice from './ModalInvoice';
import ViewPdf from '@/components/ViewPDF/ViewPdf';
import DateHelper from '@/helpers/DateHelper';

export const HotelCheckOutToday = ({ setLoading }) => {

  const [currentDate, setCurrentDate] = useState(DateHelper.getDate());
  const [dataCurrentCheckOut, setDataCurrentCheckOut] = useState([]);
  const [totalCheckOut, setTotalCheckOut] = useState(0);
  const [bookingId, setBookingId] = useState(0);
  const [dataBooking, setDataBooking] = useState([]);
  const [openModalInvoice, setOpenModalInvoice] = useState(false);

  //print invoice
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");
  const [invoiceId, setInvoiceId] = useState(0);

  const fnRefreshTable = () => {
    setLoading(true);
    request.GET(`hotel/dashboard/getCheckOutToday?currentDate=${currentDate}`, resp => {
      setLoading(false);
      const { data } = resp;
      setDataCurrentCheckOut(data);
      setTotalCheckOut(data.length || 0);
    }, err => {
      setLoading(false);
      setDataCurrentCheckOut([]);
      setTotalCheckOut(0);
    })
  }

  const fnGetBooking = (id) => {
    setLoading(true);
    request.GET(`hotel/process/bookings/${id}`, (resp) => {
      setDataBooking(resp.data);
      const invoiceId = resp?.data?.invoiceId || 0;
      if (validInt(invoiceId) > 0) {
        fnPrintInvoice(invoiceId);
        setInvoiceId(invoiceId);
      } else {
        setOpenModalInvoice(true);
      }
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGotoViewBooking = (bookingId) => {
    setBookingId(bookingId);
    fnGetBooking(bookingId);
  }

  const fnPrintInvoice = (idInvoice) => {
    setInvoiceId(idInvoice);

    // imprimir factura
    const dataPrint = {
      id: idInvoice,
      userName: userData.name,
      typePrint: 1
    }

    request.GETPdfUrl('hotel/process/bookings/exportInvoicePDF', dataPrint, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
    }, (err) => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fnRefreshTable()
  }, []);

  const propsToModalInvoice = {
    ModalContent: ModalInvoice,
    title: "page.hotel.modal.invoice.title",
    open: openModalInvoice,
    setOpen: setOpenModalInvoice,
    maxWidth: 'xl',
    data: {
      dataBooking,
      setLoading,
      setOpenModalInvoice,
      fnPrintInvoice
    }
  }

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.invoice",
    valueTitle: invoiceId,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  return (
    <>
      <Row>
        <Col xs={12}>
          <Card className='mb-3'>
            <CardBody>
              <CardTitle tag="h4">
                Salidas de Hoy <Badge className='text-white' color='info'>{totalCheckOut}</Badge>
              </CardTitle>
              <Row>
                <Col xs={8} md={7} lg={8}>
                  <DateCalendar
                    name="currentDate"
                    value={currentDate}
                    label='select.date'
                    onChange={({ target }) => setCurrentDate(target.value)}
                  />
                </Col>
                <Col xs={4} md={5} lg={4}>
                  <Button color='info' onClick={fnRefreshTable}> <i className='bi bi-search'></i> {IntlMessages("button.search")} </Button>
                </Col>
              </Row>
              <Table hover
                responsive
                bordered
                size="sm">
                <thead>
                  <tr>
                    <th>
                      # Hab.
                    </th>
                    <th>
                      Cliente
                    </th>
                    <th>Estancia (dias)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dataCurrentCheckOut.length > 0 ? dataCurrentCheckOut.map((item, idx) => {
                    return (<tr>
                      <td>{item.roomCode}</td>
                      <td>{item.customerName}</td>
                      <td>{item.currentDays}</td>
                      <td><Button color='info' onClick={() => fnGotoViewBooking(item.bookingId)} ><i className='bi bi-receipt'></i></Button></td>
                    </tr>)
                  }) : <tr><td className='text-center' colSpan={4}>No Hay Datos Disponibles</td></tr>}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Modal {...propsToModalInvoice} />
      <Modal {...propsToViewPDF} />
    </>
  )
}
