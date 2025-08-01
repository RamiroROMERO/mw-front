import React, { useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages, validInt } from "@/helpers/Utils";
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { SimpleSelect } from "@/components/simpleSelect";
import { RadioGroup } from "@/components/radioGroup";
import { InputField } from "@/components/inputFields";
import DateCalendar from "@/components/dateCalendar";
import notification from "@/containers/ui/Notifications";
import moment from "moment";

const ModalCashOpening = (props) => {
  const { data, setOpen } = props;
  const { listCashBoxes, listAreas, setBulkFormDetail, setBulkFormIndex, setLoading, userData } = data;
  const [sendForm, setSendForm] = useState(false);

  const cashOpeningValid = {
    cashBox: [(val) => validInt(val) > 0, "msg.required.select.cashBox"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkform } = useForm({
    cashBox: 1,
    dateCashOpen: moment(new Date()).format("YYYY-MM-DD"),
    cashierPass: '',
    typePrint: 1
  }, cashOpeningValid);

  const { cashBox, dateCashOpen, cashierPass, typePrint } = formState;

  const { cashBoxValid } = formValidation;

  const fnSaveCashBox = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    const filterCash = listCashBoxes.filter((item) => {
      return item.id === validInt(cashBox);
    });

    let valueStore = "0";
    let typePricelocal = 2;
    let documentCode = "";
    let areaId = 0;
    if (filterCash[0].billingAreaId > 0) {
      const dataArea = listAreas.filter((item) => {
        return item.id === parseInt(filterCash[0].billingAreaId, 10);
      });
      valueStore = dataArea[0].invStore !== null ? dataArea[0].invStore.id : "0";
      typePricelocal = dataArea[0].localPriceType;
      documentCode = dataArea[0].codeDocument;
      areaId = filterCash[0].billingAreaId
    } else {
      valueStore = "0";
      typePricelocal = 2;
    }

    const dataCashBox = {
      cashId: cashBox,
      cashierId: userData.id,
      areaId,
      storeId: valueStore,
      typePrice: typePricelocal,
      documentCode,
      dateInProcess: dateCashOpen,
      printType: typePrint
    }

    const formDetail = {
      areaId,
      storeId: valueStore,
      typePrice: typePricelocal
    }
    const formIndex = {
      documentCode,
      dateInProcess: dateCashOpen,
      printType: typePrint
    }

    localStorage.setItem('dataCashBox_current', JSON.stringify({}));
    setLoading(true);
    request.POST('validCashier', { email: userData.email, password: cashierPass }, (resp) => {
      console.log(resp);
      localStorage.setItem('dataCashBox_current', JSON.stringify(dataCashBox));
      setBulkFormDetail(formDetail);
      setBulkFormIndex(formIndex);
      setOpen(false);
      setLoading(false);
    }, (err) => {
      console.error(err);
      notification('error', 'msg.error.userPass', 'alert.error.title');
      setLoading(false);
    }, false);
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <SimpleSelect
              name="cashBox"
              label="page.pointSales.modal.cashOpening.select.cashBox"
              value={cashBox}
              onChange={onInputChange}
              options={listCashBoxes}
              invalid={sendForm && !!cashBoxValid}
              feedbackText={sendForm && (cashBoxValid || null)}
            />
          </Colxx>
          <Colxx xxs="12">
            <DateCalendar
              value={dateCashOpen}
              name="dateCashOpen"
              label="page.invoicing.input.dateInProcess"
              onChange={onInputChange}
            />
          </Colxx>
          <Colxx xxs="12">
            <InputField
              value={cashierPass}
              id="cashierPass"
              name="cashierPass"
              onChange={onInputChange}
              type="password"
              label="page.pointSales.modal.cashOpening.input.cashierPass"
            />
          </Colxx>
          <Colxx xxs="12">
            <RadioGroup
              label="page.pointSales.modal.cashOpening.input.invoiceFormat"
              name="typePrint"
              value={typePrint}
              onChange={onInputChange}
              options={
                [
                  { id: 1, label: "page.pointSales.modal.cashOpening.radio.pos" },
                  { id: 2, label: "page.pointSales.modal.cashOpening.radio.halfLetter" },
                  { id: 3, label: "page.pointSales.modal.cashOpening.radio.letter" }
                ]
              }
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveCashBox}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalCashOpening;