import React from 'react'
import Modal from '@Components/modal';
import ReactTable from "@Components/reactTable";
import { useQuotes } from './useQuotes'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import ModalNewQuote from './ModalNewQuote';

const Content = ({setLoading, screenControl}) => {

  const {currentPage, currentItem, search, table, listCustomers, listRooms, openModalAdd, propsToViewPDF, setOpenModalAdd, fnGetData, fnPrintPdf} = useQuotes({setLoading, screenControl});

  const propsToNewQuote = {
    ModalContent: ModalNewQuote,
    title: "page.hotel.modal.quote.title",
    open: openModalAdd,
    setOpen: setOpenModalAdd,
    maxWidth: 'lg',
    data: {
      currentPage,
      currentItem,
      search,
      listCustomers,
      listRooms,
      setLoading,
      fnGetData,
      fnPrintPdf
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs={12}>
          <ReactTable {...table} />
        </Colxx>
      </Row>
      <Modal {...propsToNewQuote}/>
      <Modal {...propsToViewPDF}/>
    </>
  )
}

export default Content