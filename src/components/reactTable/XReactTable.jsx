import React, { useEffect } from "react";
import { Card, CardBody, Label } from "reactstrap";
import PropTypes from 'prop-types';

import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel
} from "@tanstack/react-table";
import DataTablePagination from "@Components/DataTablePagination/DataTablePagination";
import { XReactTableColumns } from './XReactTableColumns'
import { XReactTableHeader } from "./XReactTableHeader";
import { XTable } from "./XTable";
import { XTh } from "./XTh";
import { XTd } from "./XTd";
import PaginationBackend from "./PaginationBackend";

const DataTable = ({ title, columns = [], data = [], options = {}, actions = [], hideShowColumns = {} }) => {
  let { enabledRowSelection, enabledActionButtons, setRowSelected, pageSize, pageSizeOptions, showViewColumns, typePagination = 1, currentPage, totalPages, setCurrentPage, setSearch } = options;

  if (actions.length > 0) enabledActionButtons = true;
  const finalData = data;
  const finalColumnDef = React.useMemo(() => XReactTableColumns({
    columns,
    enabledRowSelection,
    actionButtons: actions,
    enabledActionButtons: enabledActionButtons
  }), [columns]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [sorting, setSorting] = React.useState([])
  const [filtering, setFiltering] = React.useState("");

  const tableInstance = useReactTable({
    columns: finalColumnDef,
    data: finalData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      rowSelection,
      sorting,
      globalFilter: filtering,
      columnVisibility
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChanged: setFiltering,
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: enabledRowSelection
  });

  useEffect(() => {
    if (setRowSelected && typeof setRowSelected === 'function') {
      const rows = tableInstance.getSelectedRowModel().flatRows.map(el => el.original)
      setRowSelected(rows);
    }
  }, [rowSelection]);

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  useEffect(() => {
    tableInstance.setPageSize(pageSize || 10)
  }, [])

  useEffect(() => {
    setColumnVisibility(prev => ({
      ...prev,
      ...hideShowColumns
    }));
  }, [data]);

  return (
    <>
      <Card>
        <CardBody>
          <XReactTableHeader tableInstance={tableInstance} title={title} filtering={filtering} setFiltering={setFiltering} actions={actions} showViewColumns={showViewColumns} setSearch={setSearch} setCurrentPage={setCurrentPage} typePagination={typePagination} />
          <XTable>
            <thead>
              {tableInstance.getHeaderGroups().map((headerEl) => {
                return (
                  <tr key={headerEl.id}>
                    {headerEl.headers.map((columnEl) => {
                      return (
                        <XTh key={columnEl.id} columnData={columnEl} flexRender={flexRender} />
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody>
              {tableInstance.getRowModel().rows.map((rowEl) => {
                return (
                  <tr key={rowEl.id}>
                    {rowEl.getVisibleCells().map((cellEl) => {
                      return (
                        <XTd key={cellEl.id} cellData={cellEl} flexRender={flexRender} />
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </XTable>
          <hr />
          {typePagination === 1 ?
            <>
              <DataTablePagination
                page={tableInstance.options.state.pagination.pageIndex}
                pages={tableInstance.getPageCount() === 1 ? 1 : tableInstance.getPageCount()}
                canPrevious={tableInstance.getCanPreviousPage()}
                canNext={tableInstance.getCanNextPage()}
                pageSizeOptions={pageSizeOptions || [10, 20, 50]}
                showPageSizeOptions
                showPageJump
                defaultPageSize={pageSize || tableInstance.options.state.pagination.pageSize}
                onPageChange={(p) => tableInstance.setPageIndex(p)}
                onPageSizeChange={(s) => tableInstance.setPageSize(s)}
                paginationMaxSize={3}
              />
              <Label> Total Rows {tableInstance.getRowModel().rows.length} </Label>
            </>
            :
            <PaginationBackend currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
          }
        </CardBody>
      </Card>
    </>
  );
};

// props to actions (buttons)
// type TableButton { 
//   icon: string,
//   onClick: function,
//   color: string, ['primary', 'success', 'info', 'warning', 'danger']
//   toolTip: string,
//   isFreeAction: boolean,
//   showInMenu: boolean 
// }

// type TableColumn {
//   accesorKey: string,
//   header: string,
//   headerClasses: string,
//   headerStyle: object,
//   classes: string, 
//   style: object,
//   cell: function ({row})=>{row.original}
// }

// shape({
//   icon: PropTypes.string.isRequired,
//   onClick: PropTypes.func.isRequired,
//   color: PropTypes.oneOf(['primary', 'success', 'info', 'warning', 'danger']).isRequired,
//   toolTip: PropTypes.string
// })

DataTable.propTypes = {
  title: PropTypes.string,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  actions: PropTypes.array,
  options: PropTypes.shape({
    enabledRowSelection: PropTypes.bool,
    setRowSelected: PropTypes.func,
    enabledActionButtons: PropTypes.bool,
    showViewColumns: PropTypes.bool,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.array,
  })
}

export default DataTable;
