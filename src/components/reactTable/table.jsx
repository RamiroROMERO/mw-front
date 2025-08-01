import React, { useImperativeHandle } from 'react'
import { useTable, usePagination, useSortBy, useGlobalFilter } from "react-table";
import classnames from "classnames";
import PerfectScrollbar from 'react-perfect-scrollbar';
import DataTablePagination from 'components/DataTablePagination/DataTablePagination';

function Table({ columns, data, divided = false, defaultPageSize = 10, options, actions, innerRef }) {
  const instance = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: defaultPageSize },
    },
    useSortBy,
    usePagination,
    useGlobalFilter
  );

  const {
    getTableProps,
    getTableBodyProps,
    prepareRow,
    headerGroups,
    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
    setGlobalFilter
  } = instance;

  // const { globalFilter } = state;

  useImperativeHandle(innerRef, () => instance);

  return (
    <>
      <PerfectScrollbar
        options={{ suppressScrollY: true, wheelPropagation: true }}
      >
        <table
          {...getTableProps()}
          className={`table table-bordered table-hover ${classnames({
            "table-divided": divided,
          })}`}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, columnIndex) => {
                  const { headerStyle, headerClasses } = column;
                  return (<th
                    key={`th_${columnIndex}`}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{ ...headerStyle }}
                    className={(headerClasses ?? headerClasses) + (column.isSorted
                      ? column.isSortedDesc
                        ? "sorted-desc"
                        : "sorted-asc"
                      : "")
                    }
                  >
                    {
                      column.Header
                      /* {column.render("Header")} */
                    }
                    <span />
                  </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell, cellIndex) => {
                    return (
                      <td
                        style={{ ...cell.column.style }}
                        key={`td_${cellIndex}`}
                        className={cell.column.classes}
                        {...cell.getCellProps({
                          className: cell.column.cellClass,
                        })}
                      >
                        {cell.render("Cell")}
                      </td>
                    )
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </PerfectScrollbar>
      <DataTablePagination
        page={pageIndex}
        pages={pageCount}
        canPrevious={canPreviousPage}
        canNext={canNextPage}
        pageSizeOptions={[10, 20, 30, 40, 50]}
        showPageSizeOptions
        showPageJump
        defaultPageSize={pageSize}
        onPageChange={(p) => gotoPage(p)}
        onPageSizeChange={(s) => setPageSize(s)}
        paginationMaxSize={3}
      />
    </>
  );
}

export default Table
