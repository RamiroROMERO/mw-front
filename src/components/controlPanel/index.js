import React, { useState } from "react";
import { TabPane, Nav, NavItem, NavLink, TabContent, Button } from "reactstrap";
import { IntlMessages } from "@/helpers/Utils";
import classnames from 'classnames';
import { SeparatorV } from '../common/CustomBootstrap';


const ControlPanel = (props) => {
  const { fnNew = null, fnSearch = null, fnSave = null, fnPrint = null, fnDelete = null, fnCancel = null, buttonsHome = [], buttonsOptions = [],
    buttonsAdmin = [], activeTabDefault = '1', disableTab = [false, false, false], btnDeleteForDisable = false } = props;
  const [activeTab, setActiveTab] = useState(activeTabDefault);
  const iconForDelete = btnDeleteForDisable ? "bi-bi-ban" : "bi bi-trash";
  const labelForDelete = btnDeleteForDisable ? "button.disable" : "button.delete"
  return (
    <>
      <Nav tabs className="separator-tabs ml-0 mb-2">
        <NavItem>
          <NavLink
            className={classnames({
              active: activeTab === '1',
              'nav-link': true,
            })}
            onClick={() => setActiveTab('1')}
            disabled={disableTab[0]}
          >
            <i className="bi bi-house" />
            {` ${IntlMessages("menu.controlpanel.tab.home")}`}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({
              active: activeTab === '2',
              'nav-link': true,
            })}
            onClick={() => setActiveTab('2')}
            disabled={disableTab[1]}
          >
            <i className="bi bi-list-ul" />
            {` ${IntlMessages("menu.controlpanel.tab.options")}`}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({
              active: activeTab === '3',
              'nav-link': true,
            })}
            onClick={() => setActiveTab('3')}
            disabled={disableTab[2]}
          >
            <i className="bi bi-shield-lock" />
            {` ${IntlMessages("menu.controlpanel.tab.admin")}`}
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {fnNew ? <Button color="light" className="btn-control-panel" onClick={fnNew}><i className="bi bi-file-earmark-plus" /><br /> {IntlMessages('button.new')}</Button> : ''}
          {fnSearch ? <Button color="light" className="btn-control-panel" onClick={fnSearch}><i className="bi bi-folder2-open" /><br /> {IntlMessages('button.search')}</Button> : ''}
          {fnSave ? <Button color="light" className="btn-control-panel" onClick={fnSave}><i className="bi bi-floppy" /><br /> {IntlMessages('button.save')}</Button> : ''}
          {fnPrint ? <Button color="light" className="btn-control-panel" onClick={fnPrint}><i className="bi bi-printer" /><br /> {IntlMessages('button.print')}</Button> : ''}
          {fnDelete ? <Button color="light" className="btn-control-panel" onClick={fnDelete}><i className={iconForDelete} /><br /> {IntlMessages(labelForDelete)}</Button> : ""}
          {fnCancel ? <Button color="light" className="btn-control-panel" onClick={fnCancel}><i className="bi bi-x-circle" /><br /> {IntlMessages('button.cancel2')}</Button> : ""}
          {(fnNew || fnSearch || fnSave || fnPrint || fnDelete || fnCancel) ? <SeparatorV /> : ''}
          {buttonsHome.map((item, key) => {
            return (
              item ? <Button color="light" className="btn-control-panel" key={`buttonsHome-${key}`} onClick={item.onClick}><i className={item.icon} /><br /> {IntlMessages(item.title)}</Button> : ""
            )
          })}
        </TabPane>
        <TabPane tabId="2">
          {buttonsOptions.map((item, key) => {
            return (
              item ? <Button color="light" className="btn-control-panel" key={`buttonsOptions-${key}`} onClick={item.onClick}><i className={item.icon} /><br /> {IntlMessages(item.title)}</Button> : ""
            )
          })}
        </TabPane>
        <TabPane tabId="3">
          {buttonsAdmin.map((item, key) => {
            return (
              item ? <Button color="light" className="btn-control-panel" key={`buttonsAdmin-${key}`} onClick={item.onClick}><i className={item.icon} /><br /> {IntlMessages(item.title)}</Button> : ""
            )
          })}
        </TabPane>
      </TabContent>
    </>
  )
}

export default ControlPanel;