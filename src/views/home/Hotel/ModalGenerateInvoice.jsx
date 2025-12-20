import TextTitle from '@/components/textTitle/TextTitle'
import { Colxx } from '@/components/common/CustomBootstrap'
import { formatNumber, IntlMessages, validFloat } from '@/helpers/Utils'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import createNotification from "@/containers/ui/Notifications";
import { useForm } from '@/hooks'
import { InputField } from '@/components/inputFields'
import { useState } from 'react'
import { ReactTableEdit } from '@/components/reactTableEdit'
import { request } from '@/helpers/core';

const ModalGenerateInvoice = ({data, setOpen}) => {
  const {bookingId, totalValPayments, totalValServices, listTypePayments, setListTypePayments, dataInvoice, creditDays, roomId, subtotal, billingToCompany, setLoading} = data;

  const { invoiceDate, documentCode, cashId, cashierId, documentType, price, discountPercent, discountValue, taxPercent, taxValue, otherTaxPercent, otherTaxValue, total } = dataInvoice;

  const totalInvoice = (totalValServices + validFloat(price || 0)) - totalValPayments;

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    valueCustomer: 0,
    valueRestore: 0,
  });

  const { valueCustomer, valueRestore } = formState;

  const [table, setTable] = useState({
    title: "",
    columns: [
      {
        label: "page.pointSales.modal.payment.title.paymentMethod", field: "name",
        headerStyle: {
          textAlign: 'center',
          width: '50%'
        },
        bodyStyle: {
          width: '50%'
        }
      },
      {
        label: "page.hotel.modal.invoice.paymentDetail.reference", field: "reference", isEditable: true,
        headerStyle: {
          textAlign: 'center',
          width: '25%'
        },
        bodyStyle: {
          width: '25%'
        }
      },
      {
        label: "page.pointSales.modal.payment.title.value", field: "value", isEditable: true,
        headerStyle: {
          textAlign: 'center',
          width: '25%'
        },
        bodyStyle: {
          width: '25%'
        }
      }
    ],
    data: listTypePayments,
    onChangeData: setListTypePayments,
    options: {
      columnActions: "options",
      tableHeight: '300px'
    },
    showHeader: false
  });

  const handleInputChange = e => {
    const totalRestore = validFloat(e.target.value) - validFloat(totalInvoice);
    const newValue = {
      valueCustomer: e.target.value,
      valueRestore: formatNumber(totalRestore, 'L. ', 2)
    }
    setBulkForm(newValue);
  }

  const fnAcceptPay = () => {
    const totalPayMethod = listTypePayments.map(item => validFloat(item.value)).reduce((prev, curr) => prev + curr, 0);
    if (totalPayMethod !== validFloat(totalInvoice)) {
      createNotification('warning', 'msg.required.input.totalPayMethod', 'alert.warning.title');
      return;
    }
    if (valueCustomer === 0) {
      createNotification('warning', 'msg.required.input.totalCustomer', 'alert.warning.title');
      return;
    }
    const invoiceData = {
      documentCode,
      bookingId,
      cashId,
      cashierId,
      invoiceDate,
      billingToCompany,
      isCredit: documentType===1? false : true,
      creditDays,
      detailRoom:{
        roomId,
        qty: 1,
        price,
        subtotal,
        discountPercent,
        discountValue,
        taxPercent,
        taxValue,
        otherTaxPercent,
        otherTaxValue,
        total
      },
      totalCustomer: valueCustomer,
      totalRest: validFloat(valueRestore),
    }

    const filterPayments = listTypePayments.filter(item => item.value > 0);

    const paymentData = filterPayments.map((item) => {
      return {
        paymentTypeId: item.id,
        reference: item.reference,
        total: item.value
      }
    });

    const data = {
      invoiceData,
      paymentData
    }

    setLoading(true);
    request.POST('hotel/process/bookings/generateInvoice', data, (resp) => {
      setOpen(false);
      setLoading(false);
    },(err)=>{
      console.error(err);
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={6} style={{ fontSize: '18px' }}>
            <TextTitle
              title='input.totalToPay'
              subTitle={formatNumber(totalInvoice, 'L.', 2)}
            />
          </Colxx>
        </Row>
        <Row className='mb-3'>
          <Colxx xxs={12}>
            <ReactTableEdit {...table} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={6} style={{ fontSize: '18px' }}>
            <InputField
              name="valueCustomer"
              label="page.pointSales.modal.payment.input.valueCustomer"
              value={valueCustomer}
              onChange={handleInputChange}
              type="text"
              style={{ fontSize: '18px' }}
            />
          </Colxx>
          <Colxx xxs={6} style={{ fontSize: '18px' }}>
            <InputField
              name="valueRestore"
              label="page.pointSales.modal.payment.input.valueRestore"
              value={valueRestore}
              onChange={onInputChange}
              type="text"
              disabled
              style={{ fontSize: '18px' }}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnAcceptPay}>
          <i className="bi bi-check-lg" />{IntlMessages("button.accept")}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalGenerateInvoice