import ViewPdf from '@/components/ViewPDF/ViewPdf';
import { API_URLS } from '@/helpers/APIUrl';
import { request } from '@/helpers/core';
import { formatDate, formatNumber, IntlMessages } from '@/helpers/Utils';
import React, { useEffect, useState } from 'react'

export const useQuotes = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [listCustomers, setListCustomers] = useState([]);
  const [listRooms, setListRooms] = useState([]);
  const [listTypesRooms, setListTypesRooms] = useState([]);
  const [currentItem, setCurrentItem] = useState({});

  // paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  // imprimir pdf
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState("");
  const [quoteId, setQuoteId] = useState(0);

  const fnAddQuote = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentItem({});
    setOpenModalAdd(true);
  }

  const fnEditDocument = (item) => {
    if (fnUpdate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setCurrentItem(item);
    setOpenModalAdd(true);
  }

  const fnPrintPdf = (item) => {
    setQuoteId(item.id);
    const dataPrint = {
      id: item.id,
    }

    request.GETPdfUrl(`${API_URLS.HOTEL_PROC_QUOTES}/exportQuotePDF`, dataPrint, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnGetData = (page = currentPage, searchText = search) => {
    setLoading(true);
    request.GET(`${API_URLS.HOTEL_PROC_QUOTES}/paginate?page=${page}&limit=${pageSize}&q=${searchText}`, (resp) => {
      const data = resp.data.map(item => {
        item.customer = `${item?.dni || ""} | ${item?.name || ""}`
        return item
      });
      const pageTotal = resp.pagination.totalPages;
      const tableData = {
        ...table, data, options: { totalPages: pageTotal, currentPage, setCurrentPage, typePagination: 2, setSearch }
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.hotel.quotes"),
    columns: [
      {
        text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { 'width': '10%' },
        cell: ({ row }) => {
          return (formatDate(row.original.date));
        }
      },
      { text: IntlMessages("table.column.customer"), dataField: "customer", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.phone"), dataField: "phone", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.subtotal"), dataField: "subtotal", headerStyle: { 'width': '10%' },
        cell: ({ row }) => {
          return (formatNumber(row.original.subtotal, '', 2));
        }
      },
      { text: IntlMessages("table.column.discount"), dataField: "discount", headerStyle: { 'width': '10%' },
        cell: ({ row }) => {
          return (formatNumber(row.original.discount, '', 2));
        }
      },
      { text: IntlMessages("table.column.valueTax15"), dataField: "valueTax1", headerStyle: { 'width': '10%' },
        cell: ({ row }) => {
          return (formatNumber(row.original.valueTax1, '', 2));
        }
      },
      { text: IntlMessages("table.column.valueTax4"), dataField: "valueTax2", headerStyle: { 'width': '10%' },
        cell: ({ row }) => {
          return (formatNumber(row.original.valueTax2, '', 2));
        }
      },
      { text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { 'width': '10%' },
        cell: ({ row }) => {
          return (formatNumber(row.original.total, '', 2));
        }
      },
    ],
    data: [],
    options: {
      columnActions: 'options',
      typePagination: 2,
      currentPage,
      totalPages: 0,
      setCurrentPage
    },
    actions: [{
      color: 'info',
      onClick: fnPrintPdf,
      icon: 'bi bi-printer'
    }, {
      color: 'warning',
      onClick: fnEditDocument,
      icon: 'pencil'
    }, {
      color: "primary",
      icon: "bi bi-plus",
      onClick: fnAddQuote,
      title: IntlMessages("button.new"),
      isFreeAction: true
    }],
  });

  useEffect(() => {
    fnGetData(currentPage, search);
  }, [currentPage, search]);

  useEffect(() => {
    setLoading(true);
    request.GET('billing/settings/customers/?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli,
          phone: item.tel,
          email: item.email
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('hotel/settings/rooms', (resp) => {
      const rooms = resp.data.map((item) => {
        item.label = item?.typeData?.name || ""
        item.value = item.id
        return item;
      });

      const filterTypeRooms = [
        ...new Map(rooms.map(item => [item.typeId, item])).values()
      ];

      setListTypesRooms(filterTypeRooms);
      setListRooms(rooms);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

  }, []);

  const propsToViewPDF = {
    ModalContent: ViewPdf,
    title: "modal.viewDocument.quote",
    valueTitle: quoteId,
    open: openViewFile,
    setOpen: setOpenViewFile,
    maxWidth: 'xl',
    data: {
      documentPath
    }
  }

  return (
    {
      currentPage,
      currentItem,
      search,
      table,
      listCustomers,
      listRooms,
      listTypesRooms,
      openModalAdd,
      propsToViewPDF,
      setOpenModalAdd,
      fnGetData,
      fnPrintPdf
    }
  )
}
