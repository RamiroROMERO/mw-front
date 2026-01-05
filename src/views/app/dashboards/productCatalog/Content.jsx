import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardBody, Row } from 'reactstrap';
import { CardProduct } from '@/components/cards';
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import { IntlMessagesFn, validFloat } from '@/helpers/Utils';
import Modal from "@/components/modal";
import { InputField } from '@/components/inputFields';
import PaginationBackend from '@/components/reactTable/PaginationBackend';
import { useContent } from './useContent';


const Content = ({ setLoading }) => {

  const { propsToModalDetail, currentPage, setCurrentPage, totalPages, searchText, setSearchText, fnBtnSearch, productList, fnViewDetail, fnViewPrices } = useContent({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs={12}>
          <Card className='mb-3'>
            <CardBody>
              <Row>
                <Colxx xxs={12} sm={8} md={6}>
                  <InputField
                    label='button.search'
                    name="searchText"
                    value={searchText}
                    onChange={({ target }) => setSearchText(target.value)}
                  />
                </Colxx>
                <Colxx xxs={12} sm={4} md={4}>
                  <Button color='info' onClick={() => fnBtnSearch()} ><i className='bi bi-search' /> {IntlMessagesFn("button.search")} </Button>
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        {productList.length <= 0 && <Colxx xxs={12}>
          <Alert color="warning">
            {IntlMessagesFn("msg.dasboardProduct.notProducts")}
          </Alert>
        </Colxx>}
        {productList.map(prod => {
          return (
            <Colxx xxs={12} sm={6} lg={4} xl={3}>
              <CardProduct
                id={prod.id}
                productName={prod.name.toProperCase()}
                trademark={prod.trademarkData?.name.toProperCase() || ''}
                imageName={prod.namePicture}
                totalStock={prod.totalStock}
                fnViewDetail={fnViewDetail}
                fnViewPrices={fnViewPrices}
              />
            </Colxx>
          )
        })}
      </Row>
      <Row>
        <Colxx xxs={12}>
          <Card>
            <CardBody>
              <PaginationBackend currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalDetail} />
    </>
  )
}


export default Content;