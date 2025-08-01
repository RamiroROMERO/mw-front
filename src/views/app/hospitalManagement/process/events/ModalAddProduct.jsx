import React from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { IntlMessages } from '@/helpers/Utils'
import { useModalAddProduct } from './useModalAddProduct';
import { Colxx } from '@/components/common/CustomBootstrap';
import { ReactTableEdit } from '@/components/reactTableEdit'
import SearchSelect from '@/components/SearchSelect/SearchSelect';

const ModalAddProduct = ({data, setOpen}) => {
  const {listAreas, listStores, setLoading, currentItem, fnGetDataDetail} = data;

  const {table, formState, formValidation, sendForm, onInputChange, fnSearchProduct, fnSaveProducts} = useModalAddProduct({setLoading, currentItem, fnGetDataDetail, setOpen});

  const {areaId, storeId} = formState;

  const {areaIdValid, storeIdValid} = formValidation;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs={12} xs={6} md={6} xl={4}>
            <SearchSelect
              name="areaId"
              inputValue={areaId}
              onChange={onInputChange}
              options={listAreas}
              label="select.area"
              invalid={sendForm && !!areaIdValid}
              feedbackText={sendForm && (areaIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} xs={6} md={6} xl={4}>
            <SearchSelect
              name="storeId"
              inputValue={storeId}
              onChange={onInputChange}
              options={listStores}
              label="select.storeId"
              invalid={sendForm && !!storeIdValid}
              feedbackText={sendForm && (storeIdValid || null)}
            />
          </Colxx>
          <Colxx xxs={12} xs={6} md={6} xl={4}>
            <Button color="primary" onClick={fnSearchProduct}>
              <i className="bi bi-filter"/> {IntlMessages("button.filter")}
            </Button>
          </Colxx>
        </Row>
        <Row className='mt-3'>
          <Colxx xxs="12">
            <ReactTableEdit {...table}/>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveProducts}>
          <i className="bi bi-filter"/> {IntlMessages("button.accept")}
        </Button>
        <Button color="danger" onClick={()=>{setOpen(false)}} >
          <i className="bi bi-box-arrow-right"/>{`${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddProduct