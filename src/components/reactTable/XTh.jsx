
const ariaSortMap = { asc: "ascending", desc: "descending" };

export const XTh = ({ columnData, flexRender }) => {
  const canSort = columnData.column.getCanSort();
  const sortHandler = columnData.column.getToggleSortingHandler();

  const onKeyDownSort = e => {
    if ((e.key === 'Enter' || e.key === ' ') && sortHandler) {
      e.preventDefault();
      sortHandler(e);
    }
  }

  return (
    <th
      colSpan={columnData.colSpan}
      onClick={sortHandler}
      onKeyDown={canSort ? onKeyDownSort : undefined}
      role={canSort ? "button" : undefined}
      tabIndex={canSort ? 0 : undefined}
      aria-sort={canSort ? (ariaSortMap[columnData.column.getIsSorted()] ?? "none") : undefined}
      className={columnData.column.columnDef.headerClasses ?? columnData.column.columnDef.headerClasses}
      style={columnData.column.columnDef.headerStyle ?? columnData.column.columnDef.headerStyle}
    >
      {columnData.isPlaceholder
        ? null
        : flexRender(
          columnData.column.columnDef.header || columnData.column.columnDef.text,
          columnData.getContext()
        )}{
        { asc: " ↑", desc: " ↓" }[
        columnData.column.getIsSorted() ?? null
        ]
      }
    </th>
  )
}
