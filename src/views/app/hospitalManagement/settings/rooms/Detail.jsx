import React from 'react';
import { Button, Card, CardBody, Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import { useDetail } from './useDetail';

const Detail = ({currentItem, fnGetData, setLoading, setCurrentItem}) => {
  const {formState, onInputChange, formValidation, sendForm, fnSaveDocument, IntlMessages, fnClear} = useDetail({currentItem, fnGetData, setLoading, setCurrentItem});

  const {code, name, descrip, price, status} = formState;

  const {codeValid, nameValid} = formValidation;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} sm={4} lg={8}>
            <InputField
              name="code"
              label="input.code"
              onChange={onInputChange}
              value={code}
              invalid={sendForm && !!codeValid}
              feedbackText={sendForm && (codeValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} sm={8} lg={12}>
            <InputField
              name="name"
              label="input.name"
              onChange={onInputChange}
              value={name}
              invalid={sendForm && !!nameValid}
              feedbackText={sendForm && (nameValid || null)}
            />
          </Colxx>
          <Colxx xxs={12}>
            <InputField
              name="descrip"
              label="input.description"
              onChange={onInputChange}
              value={descrip}
              type="textarea"
            />
          </Colxx>
          <Colxx xxs={12} sm={4} lg={6}>
            <InputField
              name="price"
              label="input.price"
              onChange={onInputChange}
              value={price}
              type="number"
            />
          </Colxx>
          <Colxx xxs={12} align="right">
            <Checkbox
              name="status"
              label="check.status"
              value={status}
              onChange={onInputChange}
            />
          </Colxx>
        </Row>
        <hr/>
        <Row>
          <Colxx xxs="12" className="div-action-button-container">
            <Button
              color="secondary" onClick={fnClear}><i className="bi bi-stars" /> {IntlMessages("button.clear")}
            </Button>
            <Button
              color="primary" onClick={fnSaveDocument}><i className="iconsminds-save" /> {IntlMessages("button.save")}
            </Button>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail