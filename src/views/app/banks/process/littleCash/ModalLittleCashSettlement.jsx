import { Button, ModalBody, ModalFooter, Row, Label } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import DateCalendar from '@Components/dateCalendar';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import ReactTable from "@Components/reactTable";
import Confirmation from '@Containers/ui/confirmationMsg';
import { IntlMessages } from "@Helpers/Utils";
import { useLittleCashSettlement } from './useLittleCashSettlement';

export const ModalLittleCashSettlement = (props) => {
  const { data, setOpen } = props;
  const { idCch, setLoading } = data;

  const {
    dateIn, dateOut, bankCode, documentCode, onInputChange,
    listBanks, listDocto, table, totals,
    fnCalculate, fnSaveSettlement, propsToMsgClose, propsToMsgDelete
  } = useLittleCashSettlement({ idCch, setLoading });

  return (
    <>
      <ModalBody>
        <Row className="mb-3">
          <Colxx xxs="12" md="3">
            <DateCalendar name="dateIn" label="select.dateStart" value={dateIn} onChange={onInputChange} />
          </Colxx>
          <Colxx xxs="12" md="3">
            <DateCalendar name="dateOut" label="select.dateEnd" value={dateOut} onChange={onInputChange} />
          </Colxx>
          <Colxx xxs="12" md="6" className="div-action-button-container">
            <Button color="secondary" onClick={fnCalculate}>
              <i className="bi bi-calculator" /> {IntlMessages("page.littleCashSettlement.button.calculate")}
            </Button>
            <Button color="primary" onClick={fnSaveSettlement}>
              <i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
        <Row className="mb-3">
          <Colxx xxs="12" xs="4">
            <InputField name="valDoctos" value={totals.valDoctos} label="page.littleCashSettlement.table.valDoctos" type="text" bold disabled />
          </Colxx>
          <Colxx xxs="12" xs="4">
            <InputField name="liqPend" value={totals.liqPend} label="page.littleCashSettlement.input.liqPend" type="text" disabled />
          </Colxx>
          <Colxx xxs="12" xs="4">
            <InputField name="valueCash" value={totals.valueCash} label="page.littleCashSettlement.input.valueCash" type="text" bold disabled />
          </Colxx>
        </Row>
        <hr />
        <Row className="mb-2">
          <Colxx xxs="12">
            <Label>{IntlMessages("page.littleCashSettlement.section.pending")}</Label>
          </Colxx>
          <Colxx xxs="12" md="6">
            <SearchSelect
              name="bankCode"
              inputValue={bankCode}
              onChange={onInputChange}
              label="select.bankCode"
              options={listBanks}
            />
          </Colxx>
          <Colxx xxs="12" md="6">
            <SearchSelect
              name="documentCode"
              inputValue={documentCode}
              onChange={onInputChange}
              label="input.document"
              options={listDocto}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable {...table} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
      <Confirmation {...propsToMsgClose} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}
