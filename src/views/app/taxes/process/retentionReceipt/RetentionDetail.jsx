import React from 'react';
import { Row, Button, Table } from 'reactstrap';
import { IntlMessages, formatNumber } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import Confirmation from '@/containers/ui/confirmationMsg';
import { useDetailForm } from './useDetailForm';

const RetentionDetail = (props) => {
  const { documentCode, description, listTypesRetention, isFormValidDeta, setSendFormDeta, baseValue, percentValue, totalValue, setRetentionDetail, onInputDetaChange, fnViewCxp, retentionDetail, setBulkFormDetail, setBulkFormIndex, sendFormDeta, formValidationDetail } = props;

  const { documentCodeValid, descriptionValid } = formValidationDetail;

  const {onDescriptionChange, fnAddReceipt, openMsgDeleteItem, setOpenMsgDeleteItem,  fnDeleteReceipt, fnDeleteOkReceipt}= useDetailForm({setBulkFormDetail, listTypesRetention, setBulkFormIndex, baseValue, retentionDetail, isFormValidDeta, setRetentionDetail, setSendFormDeta, description, documentCode, percentValue, totalValue});

  const propsToMsgDeleteReceipt = {
    open: openMsgDeleteItem,
    setOpen: setOpenMsgDeleteItem,
    fnOnOk: fnDeleteOkReceipt,
    title: "alert.question.title"
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.retentionReceipt.title.Detail">
            <Row>
              <Colxx xxs="12" xs="6" sm="6" md="6" lg="6">
                <InputField
                  value={documentCode}
                  name="documentCode"
                  readOnly
                  onClick={fnViewCxp}
                  onChange={onInputDetaChange}
                  invalid={sendFormDeta && !!documentCodeValid}
                  feedbackText={sendFormDeta && documentCodeValid || null}
                  type="text"
                  label="page.retentionReceipt.input.documentCode"
                />
              </Colxx>
              <Colxx xss="12" xs="6" sm="6" md="6" lg="6">
                <SearchSelect
                  name="description"
                  label="page.retentionReceipt.select.description"
                  inputValue={description}
                  onChange={onDescriptionChange}
                  invalid={sendFormDeta && !!descriptionValid}
                  feedbackText={sendFormDeta && descriptionValid || null}
                  options={listTypesRetention}
                />
              </Colxx>
              <Colxx xxs="12" xs="4" sm="4" md="3" lg="3">
                <InputField
                  value={baseValue}
                  name="baseValue"
                  disabled
                  onChange={onInputDetaChange}
                  type="text"
                  label="page.retentionReceipt.input.baseValue"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" sm="4" md="3" lg="3">
                <InputField
                  value={percentValue}
                  name="percentValue"
                  disabled
                  onChange={onInputDetaChange}
                  type="text"
                  label="page.retentionReceipt.input.percentValue"
                />
              </Colxx>
              <Colxx xxs="12" xs="4" sm="4" md="3" lg="3">
                <InputField
                  value={formatNumber(totalValue)}
                  name="totalValue"
                  onChange={onInputDetaChange}
                  type="text"
                  label="page.retentionReceipt.input.totalValue"
                  disabled
                />
              </Colxx>
              <Colxx align="right">
                <Button color="primary" title={IntlMessages("button.add")}
                  onClick={() => { fnAddReceipt() }}>
                  <i className='bi bi-plus' /> {IntlMessages("button.add")}
                </Button>
              </Colxx>
            </Row>
          </ContainerWithLabel>
          <Row>
            <Colxx xxs="12">
              <Table bordered hover>
                <thead>
                  <tr>
                    <th className='d-xs-none-table-cell'>{IntlMessages("page.retentionReceipt.table.Documentcode")}</th>
                    <th>{IntlMessages("page.retentionReceipt.table.description")}</th>
                    <th className='d-sm-none-table-cell'>{IntlMessages("page.retentionReceipt.input.baseValue")}</th>
                    <th className='d-sm-none-table-cell'>{IntlMessages("page.retentionReceipt.input.percentValue")}</th>
                    <th>{IntlMessages("page.retentionReceipt.input.totalValue")}</th>
                    <th>{IntlMessages("page.retentionReceipt.options")}</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionDetail.map((item, idx) => {
                    return (
                      <tr id={`tr-table-retentionDetail-${item.documentCode}`} key={idx}>
                        <th className='d-xs-none-table-cell' align='right'>{item.documentCode}</th>
                        <td>{(item.description)}</td>
                        <td className='d-sm-none-table-cell' align='right'>{formatNumber(item.baseValue)}</td>
                        <td className='d-sm-none-table-cell' align='right'>{formatNumber(item.percentValue)}</td>
                        <td>{formatNumber(item.totalValue)}</td>
                        <td align='right'>
                          <Button type="button" className="btn-circle-table" color="danger" title="Eliminar"
                            onClick={() => { fnDeleteReceipt(item) }} key={`buttons-${idx}`}>
                            <i className='bi bi-trash' />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Colxx>
          </Row>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDeleteReceipt} />
    </>
  )
}
export default RetentionDetail;