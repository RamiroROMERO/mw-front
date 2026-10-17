import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import { request, buildUrl } from "@Helpers/core";
import ReactTable from "@Components/reactTable";
import { buildSearchPageParams, describePage, isLatestRequest, SEARCH_DEBOUNCE_MS } from "./pagingRules";

const PRODUCTS_URL = 'inventory/settings/products';

// Buscar (SPEC v2-18-sr): el catálogo se pide por páginas de 50 con búsqueda en el servidor (código, nombre o descripción);
// ya no se descarga completo al abrir. Una respuesta vieja nunca pisa a una más nueva.
const ModalViewProd = (props) => {
  const { data, setOpen } = props;
  const { fnSelectItem } = data;

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ totalRecords: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(false);
  const latest = useRef(0);

  // El texto se aplica 300 ms después de dejar de escribir y vuelve a la primera página.
  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPageIndex(0); }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    latest.current += 1;
    const requestId = latest.current;
    setLoading(true);
    request.GET(buildUrl(PRODUCTS_URL, buildSearchPageParams(debounced, pageIndex)), (res) => {
      if (!isLatestRequest(requestId, latest.current)) return;
      setRows((res?.data || []).map((item) => ({ ...item, presentation: item.submission })));
      setPagination(res?.pagination || { totalRecords: 0, limit: 50, offset: 0 });
      setLoading(false);
    }, () => {
      if (!isLatestRequest(requestId, latest.current)) return;
      setRows([]);
      setLoading(false);
    });
  }, [debounced, pageIndex]);

  const page = useMemo(() => describePage(pagination, rows.length), [pagination, rows.length]);

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textCode = IntlMessages("page.productsCatalog.table.code");
  const textName = IntlMessages("page.productsCatalog.table.name");
  const textPresentation = IntlMessages("page.productsCatalog.table.presentation");
  const textInputUnit = IntlMessages("page.productsCatalog.table.inputUnit");
  const textView = IntlMessages('button.view');
  const placeholder = IntlMessages('page.productsCatalog.search.placeholder');

  const columns = useMemo(() => [
    { text: textCode, dataField: "code", headerStyle: { 'width': '20%' } },
    { text: textName, dataField: "name", headerStyle: { 'width': '30%' } },
    {
      text: textPresentation, dataField: "presentation", headerStyle: { 'width': '15%' },
      classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell'
    },
    {
      text: textInputUnit, dataField: "inputUnit", headerStyle: { 'width': '15%' },
      classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell'
    }
  ], [textCode, textName, textPresentation, textInputUnit]);
  const actions = useMemo(() => [{
    color: 'info',
    icon: 'eye',
    toolTip: textView,
    onClick: fnSelectItem
  }], [fnSelectItem, textView]);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12" className="mb-2">
            <Input type="search" value={search} placeholder={placeholder} onChange={(event) => setSearch(event.target.value)} maxLength={100} />
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs="12">
            <ReactTable columns={columns} data={rows} actions={actions} />
          </Colxx>
        </Row>
        <Row className="mt-2 align-items-center">
          <Colxx xxs="12" className="d-flex justify-content-between align-items-center">
            <Button color="light" size="sm" disabled={loading || !page.hasPrev} onClick={() => setPageIndex((index) => Math.max(0, index - 1))}>
              <i className="bi bi-chevron-left" />
            </Button>
            <span data-testid="products-page-range">{`${page.from}-${page.to} / ${page.total}`}</span>
            <Button color="light" size="sm" disabled={loading || !page.hasNext} onClick={() => setPageIndex((index) => index + 1)}>
              <i className="bi bi-chevron-right" />
            </Button>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => { setOpen(false) }} >
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalViewProd;
