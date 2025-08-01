import React from 'react'
import { Button, Form, Input, Label, Row } from 'reactstrap';
import IntlMessages from '@Helpers/IntlMessages';
import { Colxx } from '@Components/common/CustomBootstrap';
import DropdownSelect from '@Components/DropdownSelect/DropdownSelect';

export const XReactTableHeader = ({ title, filtering, setFiltering, actions, tableInstance, showViewColumns }) => {

  const qtyActionButtons = actions.filter(action => action.isFreeAction).length;
  const filterRandomId = Math.round(Math.random() * 1000000)
  return (
    <div>
      <div className='table-hw-title m-1' style={{ flexGrow: 1 }}>
        <h4>{title}</h4>
      </div>
      <div className='table-hw-header' style={{ display: "flex", flexWrap: "wrap" }}>
        <div className="m-1" style={{ flexGrow: 0, width: "200px", minWidth: "50px" }} >
          <Form>
            <Label className="form-group has-float-label">
              <Input
                value={filtering}
                id={`valueFilter-${filterRandomId}`}
                name="dtValueFilter"
                onChange={({ target }) => setFiltering(target.value)}
                type="text"
              />
              <span>
                <IntlMessages id="table.search.text" />
              </span>
            </Label>
          </Form>
        </div>
        <div className="m-1 d-flex justify-content-end" style={{ flexGrow: 1, alignContent: "right", alignItems: 'right' }}>
          <div style={{ marginRight: '10px' }}>
            {actions.filter(action => action.isFreeAction).map((act, idx) => {
              return (
                <Button outline
                  key={idx}
                  color={act.color}
                  className="btn-table-free"
                  // size='sm'
                  onClick={() => {
                    act.onClick();
                  }}
                >
                  <i className={`bi bi-${act.icon}`} />
                  {` ${act.title ? act.title : ""}`}
                </Button>
              );
            })
            }
          </div>
          {showViewColumns && <div>
            <DropdownSelect tableInstance={tableInstance} />
          </div>}
        </div>
      </div>
    </div>

  )
}
