import { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Table, Input } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

// Equivalente a fac_pos_change_product.sc2: cambia el producto de una línea de una
// factura ya con documento fiscal generado. A pedido explícito del usuario, solo se
// puede cambiar el producto — precio/cantidad/total de la línea no son editables acá
// (a diferencia del legacy), porque el valor del documento fiscal ya no puede variar.
const ModalChangeProduct = (props) => {
  const { data, setOpen } = props;
  const { invoiceId, line, storeId, setLoading, fnSuccess } = data;

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState('');

  useEffect(() => {
    if (!line) return;
    setSelectedCode('');
    setSearch('');
    setLoading(true);
    request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId, enableForSale: 1 }), (resp) => {
      setProducts(resp.data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  const filtered = products.filter((item) => {
    if (item.productCode === line?.productCode) return false;
    if (search === '') return true;
    const term = search.toLowerCase();
    return item.productCode.toLowerCase().includes(term) || (item.productName || '').toLowerCase().includes(term);
  });

  const fnConfirm = () => {
    if (!selectedCode) {
      notification('warning', 'page.invoicing.modal.changeProduct.msg.selectProduct', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`billing/process/invoices/changeProduct/${invoiceId}`, { detailId: line.id, newProductCode: selectedCode }, (resp) => {
      notification('success', 'page.invoicing.modal.changeProduct.msg.success', 'alert.success.title');
      setLoading(false);
      fnSuccess(line.id, resp.data.productCode, resp.data.productName);
      setOpen(false);
    }, (err) => {
      const errorCode = err?.messages?.[0]?.description?.name;
      if (errorCode === 'stock.insufficient') {
        notification('error', 'msg.error.insufficientStock', 'alert.error.title');
      } else {
        notification('error', 'page.invoicing.modal.changeProduct.msg.error', 'alert.error.title');
      }
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="12">
            <strong>{IntlMessages("page.invoicing.modal.changeProduct.currentProduct")}:</strong> {line?.productCode} - {line?.description}
          </Colxx>
        </Row>
        <Row className="mb-2">
          <Colxx xxs="12">
            <Input
              type="text"
              placeholder={IntlMessages("page.invoicing.modal.changeProduct.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12" style={{ maxHeight: 350, overflowY: 'auto' }}>
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th></th>
                  <th>{IntlMessages("page.invoicing.modal.products.table.code")}</th>
                  <th>{IntlMessages("page.invoicing.modal.products.table.name")}</th>
                  <th>{IntlMessages("page.invoicing.modal.products.table.stock")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.productCode}
                    onClick={() => setSelectedCode(item.productCode)}
                    style={{ cursor: 'pointer', backgroundColor: selectedCode === item.productCode ? 'rgba(13,110,253,0.15)' : undefined }}
                  >
                    <td>
                      <input type="radio" readOnly checked={selectedCode === item.productCode} />
                    </td>
                    <td>{item.productCode}</td>
                    <td>{item.productName}</td>
                    <td align="right">{formatNumber(item.qtyStock)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnConfirm}><i className="bi bi-check-lg" /> {IntlMessages("button.accept")}</Button>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}

export default ModalChangeProduct;
