import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ModalBody, ModalFooter, Row } from "reactstrap";
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages } from "@Helpers/Utils";
import { request, buildUrl } from "@Helpers/core";
import ReactTable from "@Components/reactTable";
import {
  buildPageParams, countPages, DEFAULT_DEBOUNCE_MS, DEFAULT_PAGE_SIZE, describeRange, isLatestRequest, parsePage
} from "./searchRules";

// Contenido reutilizable de un modal "Buscar documento/registro" con búsqueda incremental y paginación en el servidor.
// Se usa como `ModalContent` de `@Components/modal` o, más simple, con `ModalSearch` (index.js).
//
// data = {
//   url: 'inventory/settings/products',               // GET url?limit=&offset=&search=
//   columns: [{ text, dataField, headerStyle, ... }],  // columnas de ReactTable
//   onSelect: (row) => {},                             // al pulsar el ícono de selección
//   pageSize, debounceMs, searchParam,                 // opcionales
//   extraParams: {},                                   // filtros fijos (ej. { status: 1 })
//   mapRow: (row) => row,                              // adapta cada fila antes de mostrarla
//   parseResponse: (res) => ({ rows, pagination }),    // si el back responde distinto
//   actions: [...], selectIcon, selectToolTip,         // reemplazar/ajustar la acción de selección
//   closeOnSelect: false                               // cierra el modal tras onSelect
// }
const ModalSearchContent = ({ data, setOpen }) => {
  const {
    url, columns = [], onSelect, pageSize = DEFAULT_PAGE_SIZE, debounceMs = DEFAULT_DEBOUNCE_MS, searchParam = 'search',
    extraParams, mapRow, parseResponse, actions: customActions, selectIcon = 'eye', selectToolTip, closeOnSelect = false
  } = data;

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ totalRecords: 0, limit: pageSize, offset: 0 });
  const latest = useRef(0);
  const extraKey = JSON.stringify(extraParams || {});

  useEffect(() => {
    latest.current += 1;
    const requestId = latest.current;
    const params = buildPageParams({ search, page: currentPage, pageSize, searchParam, extraParams: JSON.parse(extraKey) });
    request.GET(buildUrl(url, params), (res) => {
      if (!isLatestRequest(requestId, latest.current)) return;
      const parsed = parseResponse ? parseResponse(res) : parsePage(res, pageSize);
      setRows(mapRow ? parsed.rows.map(mapRow) : parsed.rows);
      setPagination(parsed.pagination);
    }, () => {
      if (!isLatestRequest(requestId, latest.current)) return;
      setRows([]);
    });
    // mapRow/parseResponse suelen ser funciones nuevas en cada render: no deben repetir la consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, search, currentPage, pageSize, searchParam, extraKey]);

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const selectText = IntlMessages('button.view');
  const actions = useMemo(() => customActions || [{
    color: 'info',
    icon: selectIcon,
    toolTip: selectToolTip || selectText,
    onClick: (row) => { onSelect?.(row); if (closeOnSelect) setOpen(false); }
  }], [customActions, selectIcon, selectToolTip, selectText, onSelect, closeOnSelect, setOpen]);

  const summary = describeRange(pagination, rows.length);
  const totalPages = countPages(pagination, pageSize);
  const options = useMemo(() => ({
    typePagination: 2,
    searchFullWidth: true,
    searchAutoFocus: true,
    pageSize,
    searchDebounceMs: debounceMs,
    currentPage,
    totalPages,
    setCurrentPage,
    setSearch,
    paginationSummary: summary
  }), [pageSize, debounceMs, currentPage, totalPages, summary]);

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <ReactTable columns={columns} data={rows} actions={actions} options={options} />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />
          {` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
};

export default ModalSearchContent;
