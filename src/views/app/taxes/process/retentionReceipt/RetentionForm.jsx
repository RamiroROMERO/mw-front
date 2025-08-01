import React from 'react';
import { Row } from 'reactstrap';
import SearchSelect from '@/components/SearchSelect/SearchSelect';
import { Colxx } from '@/components/common/CustomBootstrap';
import DateCalendar from '@/components/dateCalendar';
import { InputField } from '@/components/inputFields';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import { useRetentionForm } from './useRetentionForm';

const RetentionForm = (props) => {
  const { date, documentCode, listDocto, documentId, cai, numberCAI, limitDate,
    listProvider, providerId, rangeCAI, setBulkFormIndex, onInputChangeIndex, formValidationIndex, sendForm } = props;

    const { dateValid, documentCodeValid, providerIdValid } = formValidationIndex;

  const {onCodeChange} = useRetentionForm({setBulkFormIndex, listDocto});
 
  return (
    <>
      <Row className='mb-2'>
        <Colxx xxs="12" xs="6" lg="6">
          <ContainerWithLabel label="page.retentionReceipt.title.DocumentInt">
            <Row>
              <Colxx xss="12" xs="12" lg="12">
                <DateCalendar
                  name="date"
                  value={date}
                  label="page.retentionReceipt.input.dateIn"
                  onChange={onInputChangeIndex}
                  invalid={sendForm && !!dateValid}
                  feedbackText={sendForm && dateValid || null}
                />
              </Colxx>
              <Colxx xss="12" xs="12" lg="12">
                <SearchSelect
                  name="documentCode"
                  label="page.retentionReceipt.select.documentCode"
                  inputValue={documentCode}
                  onChange={onCodeChange}
                  invalid={sendForm && !!documentCodeValid}
                  feedbackText={sendForm && documentCodeValid || null}
                  options={listDocto}
                />
              </Colxx>
              <Colxx xss="12" xs="12" lg="12">
                <InputField
                  name="documentId"
                  value={documentId}
                  label="page.retentionReceipt.input.numInt"
                  onChange={onInputChangeIndex}
                  type="text"
                  disabled
                />
              </Colxx>
              <Colxx xss="12" xs="12" lg="12">
                <SearchSelect
                  name="providerId"
                  inputValue={providerId}
                  onChange={onInputChangeIndex}
                  label="page.retentionReceipt.select.provider"
                  invalid={sendForm && !!providerIdValid}
                  feedbackText={sendForm && providerIdValid || null}
                  options={listProvider}
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx xxs="12" xs="6" lg="6">
          <ContainerWithLabel label="page.retentionReceipt.title.DocumentFix">
            <Row>
              <Colxx xss="12" xs="12" lg="12">
                <InputField
                  name="cai"
                  value={cai}
                  onChange={onInputChangeIndex}
                  type="text"
                  label="page.retentionReceipt.input.cai"
                  disabled
                />
              </Colxx>
              <Colxx xss="12" xs="12" lg="12">
                <InputField
                  name="numberCAI"
                  value={numberCAI}
                  onChange={onInputChangeIndex}
                  type="text"
                  label="page.retentionReceipt.input.numberCai"
                  disabled
                />
              </Colxx>
              <Colxx xss="12" xs="12" lg="12">
                <InputField
                  name="rangeCAI"
                  value={rangeCAI}
                  onChange={onInputChangeIndex}
                  type="text"
                  label="page.retentionReceipt.input.rangeCai"
                  disabled
                />
              </Colxx>
              <Colxx xss="12" xs="12" lg="12">
                <DateCalendar
                  name="limitDate"
                  value={limitDate}
                  label="page.retentionReceipt.input.limitDate"
                  onChange={onInputChangeIndex}
                  disabled
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </>
  )
}
export default RetentionForm;