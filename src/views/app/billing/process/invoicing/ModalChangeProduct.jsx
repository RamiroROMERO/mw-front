import { useEffect, useState } from "react";
import { Button, ModalBody, ModalFooter, Row, Table, Input } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages, formatNumber } from "@Helpers/Utils";
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { PRODUCTS_PATH } from './invoicingRules';
import { API_PATH, buildChangeProductBody, validateChangeProduct } from './postEditRules';

const DEBOUNCE_MS = 300;

// Cambiar el producto de una línea de una factura fiscal (SPEC v2-72-sr; fac_pos_change_product.sc2). Solo se cambia el producto: el valor de la línea queda igual.
// El servidor exige el mismo impuesto, la misma unidad de salida y el mismo tipo, toma el COSTO ACTUAL del producto nuevo y regenera el kardex de la venta y la
// partida de costo en una transacción. Los productos se buscan en el servidor y solo se listan los que ofrecen la unidad de la línea.
const ModalChangeProduct = (props) => {
  const { data, setOpen } = props;
  const { invoiceId, line, storeId, setLoading, fnSuccess } = data;

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [reason, setReason] = useState('');
  const [send, setSend] = useState(false);

  useEffect(() => {
    if (!line) return undefined;
    setSelectedCode('');
    setReason('');
    setSend(false);
    const timer = setTimeout(() => {
      request.GET(buildUrl(PRODUCTS_PATH, { storeId, search: search.trim(), limit: 50 }), (resp) => {
        setProducts(resp.data || []);
      }, () => {
        setProducts([]);
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, search]);

  const compatible = products.filter((item) => item.code !== line?.productCode
    && String(item.unitName || '').trim().toUpperCase() === String(line?.unitedOut || '').trim().toUpperCase());

  const problem = send ? validateChangeProduct({ selectedCode, currentCode: line?.productCode, reason }) : null;

  const fnConfirm = () => {
    setSend(true);
    const error = validateChangeProduct({ selectedCode, currentCode: line?.productCode, reason });
    if (error) {
      if (error !== 'page.invoicing.modal.postEdit.error.reason') notification('warning', error, 'alert.warning.title');
      return;
    }
    setLoading(true);
    // El mensaje real del back (otro impuesto, unidad, existencia, período...) lo muestra `request.PUT`: aquí solo se libera la pantalla.
    request.PUT(`${API_PATH}/${invoiceId}/changeProduct`, buildChangeProductBody({ detailId: line.id, selectedCode, reason }), (resp) => {
      notification('success', 'page.invoicing.modal.changeProduct.msg.success', 'alert.success.title');
      setLoading(false);
      fnSuccess(line.id, resp.data.productCode, resp.data.productName);
      setOpen(false);
    }, () => {
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row className="mb-2">
          <Colxx xxs="12">
            <strong>{IntlMessages("page.invoicing.modal.changeProduct.currentProduct")}:</strong> {line?.productCode} - {line?.description} ({line?.unitedOut})
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
          <Colxx xxs="12" style={{ maxHeight: 300, overflowY: 'auto' }}>
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
                {compatible.map((item) => (
                  <tr
                    key={`${item.code}-${item.unitId}`}
                    onClick={() => setSelectedCode(item.code)}
                    style={{ cursor: 'pointer', backgroundColor: selectedCode === item.code ? 'rgba(13,110,253,0.15)' : undefined }}
                  >
                    <td>
                      <input type="radio" readOnly checked={selectedCode === item.code} />
                    </td>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td align="right">{formatNumber(item.stock)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
        <Row className="mt-2">
          <Colxx xxs="12">
            <InputField value={reason} name="reason" onChange={(e) => setReason(e.target.value)} type="text" maxLength={200} label="page.invoicing.modal.postEdit.reason"
              invalid={send && problem === 'page.invoicing.modal.postEdit.error.reason'} feedbackText={send && problem === 'page.invoicing.modal.postEdit.error.reason' ? problem : null} />
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
