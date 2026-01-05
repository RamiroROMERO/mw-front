import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Button } from 'reactstrap';
import { IntlMessages, formatDate } from "@/helpers/Utils";
import { Colxx } from '@/components/common/CustomBootstrap';
import { request } from '@/helpers/core';
import ReactTable from "@/components/reactTable";
import TableButton from "@/components/tableButtons";
import Modal from "@/components/modal";
import ModalNewProduct from './ModalNewProduct';
import ModalAddMaterial from './ModalAddMaterial';
import ModalViewDetail from './ModalViewDetail';

const RawMaterial = (props) => {
  const { setLoading } = props;
  const [currentItem, setCurrentItem] = useState({});
  const [openModalNew, setOpenModalNew] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalView, setOpenModalView] = useState(false);
  const [type, setType] = useState(0);
  const [titleModaladd, setTitleModalAdd] = useState("page.rawMaterial.modal.modalAdd.title1");
  const [listProducts, setListProducts] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);

  const [table, setTable] = useState({
    title: IntlMessages("page.rawMaterial.table.title"),
    columns: [
      {
        text: IntlMessages("page.rawMaterial.table.name"),
        dataField: "prodProduct.name",
        headerStyle: { 'width': '20%' }
      },
      {
        text: IntlMessages("page.rawMaterial.table.description"),
        dataField: "prodProduct.description",
        headerStyle: { 'heigth': '100%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell'
      },
      {
        text: IntlMessages("page.rawMaterial.table.qtyIn"),
        dataField: "qtyIn",
        headerStyle: { 'width': '15%' },
        align: 'right',
        headerAlign: 'center',
        classes: 'd-xxs-none-table-cell',
        headerClasses: 'd-xxs-none-table-cell'
      },
      {
        text: IntlMessages("page.rawMaterial.table.qtyOut"),
        dataField: "qtyOut",
        headerStyle: { 'width': '15%' },
        align: 'right',
        headerAlign: 'center',
        classes: 'd-xxs-none-table-cell',
        headerClasses: 'd-xxs-none-table-cell'
      },
      {
        text: IntlMessages("page.rawMaterial.table.stock"),
        dataField: "qtyStock",
        headerStyle: { 'width': '15%' },
        align: 'right',
        headerAlign: 'right'
      },
      {
        text: IntlMessages("table.column.options"),
        dataField: "options",
        headerStyle: { 'width': '10%' },
        style: { textAlign: 'right' }
      }
    ],
    data: [],
    actions: []
  });

  const fnViewDetail = (deta) => {
    setCurrentItem(deta);
    setLoading(true);
    request.GET(`prodRMStocks?productId=${deta.id}`, (resp) => {
      const productsDetail = resp.data.map((item) => {
        item.dateIn = formatDate(item.date);
        return item;
      });
      setDataProducts(productsDetail);
      setOpenModalView(true);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('prodRMStocks/getStocks', (resp) => {
      const data = resp.data.map((item) => {
        item.options = <TableButton color='secondary' icon='eye' fnOnClick={() => fnViewDetail(item)} />
        return item;
      })
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGetProducts = () => {
    request.GET('prodProducts', (resp) => {
      const products = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
      products.unshift({ value: '0', label: 'Seleccione' });
      setListProducts(products);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnNewProduct = () => {
    setOpenModalNew(true);
  }

  const fnAddRawMaterial = () => {
    setType(1);
    setTitleModalAdd("page.rawMaterial.modal.modalAdd.title1");
    setOpenModalAdd(true);
  }

  const fnDeducRawMaterial = () => {
    setType(2);
    setTitleModalAdd("page.rawMaterial.modal.modalAdd.title2");
    setOpenModalAdd(true);
  }

  useEffect(() => {
    fnGetData();
    fnGetProducts();
  }, []) // eslint-disable-line react-@/hooks/exhaustive-deps

  const propsToModalNew = {
    ModalContent: ModalNewProduct,
    title: "page.rawMaterial.modal.modalNew.title",
    open: openModalNew,
    setOpen: setOpenModalNew,
    maxWidth: 'md',
    data: {
      fnGetData,
      fnGetProducts,
      setLoading
    }
  }

  const propsToModalAdd = {
    ModalContent: ModalAddMaterial,
    title: titleModaladd,
    open: openModalAdd,
    setOpen: setOpenModalAdd,
    maxWidth: 'md',
    data: {
      fnGetData,
      listProducts,
      type,
      setLoading
    }
  }

  const propsToModalView = {
    ModalContent: ModalViewDetail,
    title: "page.rawMaterial.modal.modalView.title",
    open: openModalView,
    setOpen: setOpenModalView,
    maxWidth: 'md',
    data: {
      dataProducts,
      currentItem,
      setLoading
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card className="mb-3">
            <CardBody>
              <Button className="mr-2" color="success" onClick={fnNewProduct}><i className="bi bi-file-earmark-plus mr-1" />
                {IntlMessages("button.newPoduct")}
              </Button>
              <Button className="mr-2" color="primary" onClick={fnAddRawMaterial}><i className="simple-icon-plus mr-1" />
                {IntlMessages("button.addRawMaterial")}
              </Button>
              <Button className="mr-2" color="danger" onClick={fnDeducRawMaterial}><i className="simple-icon-minus mr-1" />
                {IntlMessages("button.deducRawMaterial")}
              </Button>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12">
          <ReactTable
            {...table}
          />
        </Colxx>
      </Row>
      <Modal {...propsToModalNew} />
      <Modal {...propsToModalAdd} />
      <Modal {...propsToModalView} />
    </>
  );
}
export default RawMaterial;