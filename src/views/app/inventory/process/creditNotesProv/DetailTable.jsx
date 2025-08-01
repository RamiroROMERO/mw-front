import React from 'react'
import { Button, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { useDetailTable } from './useDetailTable'
import { IntlMessages } from '@/helpers/Utils'
import { InputField } from '@/components/inputFields'
import SearchSelect from '@/components/SearchSelect/SearchSelect'
import { ReactTableEdit } from '@/components/reactTableEdit'

const DetailTable = ({percentDiscount, accountId, invoiceNum, subtotal, discount, tax, total, creditNotesDetail, setCreditNotesDetail, creditNotesDetail2, setCreditNotesDetail2, listAccounts, onInputChange, showDetail1, showDetail2, setOpenModalUnpaidBill, sendForm, formValidation}) => {

  const {table, table2, fnViewInvoices, fnApply} = useDetailTable({creditNotesDetail, setCreditNotesDetail, creditNotesDetail2, setCreditNotesDetail2, setOpenModalUnpaidBill});

  const {totalValid} = formValidation;

  return (
    <>
    <Row style={{display: showDetail1}}>
      <Colxx xxs="12" xs="12" sm="5" lg="8" className="mb-3">
        <Button color="primary" onClick={() => {fnViewInvoices()}}>
          <i className='bi bi-plus' /> {IntlMessages("button.addInvoice")}
        </Button>
      </Colxx>
      <Colxx xxs="12" xs="7" sm="4" lg="2">
        <InputField
          name="percentDiscount"
          label='page.creditNotesProv.input.percentDiscount'
          value={percentDiscount}
          onChange={onInputChange}
          type="text"
        />
      </Colxx>
      <Colxx xxs="12" xs="5" sm="3" lg="2" className="mb-3">
        <Button color="secondary" onClick={() => {fnApply()}}>
          <i className='bi bi-check' /> {IntlMessages("button.apply")}
        </Button>
      </Colxx>
    </Row>
    <Row className='mb-3' style={{display: showDetail1}}>
      <Colxx xxs="12">
        <ReactTableEdit {...table}/>
      </Colxx>
    </Row>
    <Row style={{display: showDetail1}}>
      <Colxx xxs="12" sm="8" lg="6">
        <SearchSelect
          label='select.accountId'
          name='accountId'
          inputValue={accountId}
          options={listAccounts}
          onChange={onInputChange}
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3">
        <InputField
          name="total"
          label='input.total'
          value={total}
          onChange={onInputChange}
          type="text"
          invalid={sendForm && !!totalValid}
          feedbackText={sendForm && (totalValid || null)}
        />
      </Colxx>
    </Row>
    <Row style={{display: showDetail2}}>
      <Colxx xxs="12" xs="6" sm="5" lg="4" xl="3" className="mb-3">
        <Button color="primary" onClick={() => {fnViewInvoices()}}>
          <i className='bi bi-file-earmark-post' /> {IntlMessages("button.selectInvoice")}
        </Button>
      </Colxx>
      <Colxx xxs="12" xs="6" sm="5" lg="3">
        <InputField
          name="invoiceNum"
          label='input.numInvoice'
          value={invoiceNum}
          onChange={onInputChange}
          type="text"
        />
      </Colxx>
    </Row>
    <Row className='mb-3' style={{display: showDetail2}}>
      <Colxx xxs="12">
        <ReactTableEdit {...table2}/>
      </Colxx>
    </Row>
    <Row style={{display: showDetail2}}>
      <Colxx xxs="12" xs="6" sm="4" lg="3">
        <InputField
          name="subtotal"
          label='input.subtotal'
          value={subtotal}
          onChange={onInputChange}
          type="text"
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3">
        <InputField
          name="discount"
          label='input.discount'
          value={discount}
          onChange={onInputChange}
          type="text"
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3">
        <InputField
          name="tax"
          label='input.tax'
          value={tax}
          onChange={onInputChange}
          type="text"
        />
      </Colxx>
      <Colxx xxs="12" xs="6" sm="4" lg="3">
        <InputField
          name="total"
          label='input.total'
          value={total}
          onChange={onInputChange}
          type="text"
          invalid={sendForm && !!totalValid}
          feedbackText={sendForm && (totalValid || null)}
        />
      </Colxx>
    </Row>
    </>
  )
}

export default DetailTable