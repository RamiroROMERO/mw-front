import React from "react";
import IntlMessages from "helpers/IntlMessages";
import {
  Form,
  Label,
  Input,
  Button,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  UncontrolledDropdown,
} from "reactstrap";
import ColumnCheckItem from "./ColumnCheckItem";

function Filter({
  title,
  options,
  actions,
  columns,
  valueFilter,
  fnFilterTable,
  hideColumns,
  showHideColumns,
  setShowHideColumns,
  fnActiveInactiveColumns,
}) {
  return (
    <>
    <div className='table-hw-header' style={{display:"flex", flexWrap:"wrap"}}>
    <div className='table-hw-title m-1' style={{flexGrow:1}}>
      <h4>{title}</h4>
    </div>
    <div className="m-1" style={{flexGrow:0, width:"200px", minWidth:"50px"}} >
      <Form>
        <Label className="form-group has-float-label">
          <Input
            value={valueFilter}
            id="valueFilter"
            name="dtValueFilter"
            onChange={fnFilterTable}
            type="text"
          />
          <span>
            <IntlMessages id="table.search.text" />
          </span>
        </Label>
      </Form>
    </div>
    <div className="container-btn-table m-1">
          {actions
            .filter((act) => act.isFreeAction)
            .map((act,idx) => {
              return (
                <Button
                  key={idx}
                  type="button"
                  color={act.color}
                  className="btn-table-free"
                  onClick={() => {
                    act.onClick();
                  }}
                >
                  <i className={`bi bi-${act.icon}`} />
                  {` ${act.title ? act.title : ""}`}
                </Button>
              );
            })}
          {(() => {
            if (hideColumns) {
              return (
                <UncontrolledDropdown
                  menuRole="listbox"
                  isOpen={showHideColumns}
                  toggle={() => setShowHideColumns(!showHideColumns)}
                  className="mb-2"
                >
                  <DropdownToggle
                    caret
                    className="btn-table-free"
                    color="primary"
                  >
                    <i className="bi bi-filter" />
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem header>
                      {" "}
                      <IntlMessages id="table.list.columns" />
                    </DropdownItem>
                    {/* <DropdownItem divider /> */}
                    {columns
                      .filter((elem) => {
                        return elem.accessor !== options.columnActions;
                      })
                      .map((elem, key) => {
                        return (
                          <ColumnCheckItem
                            key={key}
                            label={elem.Header}
                            name={elem.field}
                            value={elem.showColumn}
                            onChange={fnActiveInactiveColumns}
                          />
                        );
                      })}
                  </DropdownMenu>
                </UncontrolledDropdown>
              );
            } else {
              return <></>;
            }
          })()}
        </div>
    </div>
    </>
  );
}

export default Filter;
