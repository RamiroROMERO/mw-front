import React from 'react';
import { Card, CardBody, TabContent, TabPane, Nav, NavItem, NavLink, Row, Table, Button } from 'reactstrap';
import { IntlMessages, validInt } from "@/helpers/Utils";
import { Colxx, Separator } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';
import { Checkbox } from '@/components/checkbox';
import { RadioGroup } from '@/components/radioGroup';
import { SimpleSelect } from '@/components/simpleSelect';
import { ContainerWithLabel } from '@/components/containerWithLabel';
import ControlPanel from '@/components/controlPanel';
import classnames from 'classnames';
import Confirmation from '@/containers/ui/confirmationMsg';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import Modal from "@/components/modal";
import useProductsCatalog from './useProductsCatalog';

const ProductsCatalog = (props) => {
  const { setLoading } = props;

  const { formState,
    formValidation,
    onInputChange,
    propsToControlPanel,
    propsToMsgDeleteProduct,
    propsToMsgCode,
    propsToModalViewProd,
    listClassifications,
    listMarks,
    listMeasurementUnits,
    listPackagingUnits,
    listTaxPercent,
    activeTab,
    setActiveTab,
    activeTabPrices,
    setActiveTabPrices,
    sendForm,
    fnConfirmGenerateCode,
    listProducts,
    dataStock,
    propsToModalDistProduct, propsToModalAddTrademarks, propsToModalCompProduct } = useProductsCatalog({ setLoading });

  const { id, code, name, status, description, submConversion, type, costValue, maxCostValue, lastCostValue, percentTax, taxValue,
    typeCalculatePrice, typeCalculateCost, percentLocalPriceMin, valuePercentLocalPriceMin, priceLocalMin, percentLocalPriceMid,
    valuePercentLocalPriceMid, priceLocalMid, percentLocalPriceMax, valuePercentLocalPriceMax, priceLocalMax, percentOutsidePriceMin,
    valuePercentOutsidePriceMin, priceOutsideMin, percentOutsidePriceMid, valuePercentOutsidePriceMid, priceOutsideMid, percentOutsidePriceMax,
    valuePercentOutsidePriceMax, priceOutsideMax, parentProduct, notes, enableForPurchase, enableForSale, paymentTax, requireExpLot,
    validToSale, paymentComiss, priceIncludeTax, dateLastPurchase, numLastPurchase, provLastPurchase, typeId, undinId, undoutId, packId, tradeId } = formState;

  const { codeValid, nameValid, typeIdValid, typeValid, packValid, undinIdValid, undoutIdValid, costValueValid,
    typeCalculateCostValid, typeCalculatePriceValid } = formValidation;

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-3" />
              <Nav tabs className="separator-tabs ml-0 mb-4">
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === '1',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTab('1')}
                  >
                    {IntlMessages("page.productsCatalog.modal.newProduct.title.generalData")}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === '2',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTab('2')}
                  >
                    {IntlMessages("page.productsCatalog.modal.newProduct.title.prices")}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: activeTab === '3',
                      'nav-link': true,
                    })}
                    onClick={() => setActiveTab('3')}
                  >
                    {IntlMessages("page.productsCatalog.modal.newProduct.title.options")}
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <Row>
                    <Colxx xxs="12" xs="12" sm="12" md="7" lg="7">
                      <Row>
                        <Colxx xxs="6">
                          <InputField
                            label="page.productsCatalog.modal.newProduct.input.code"
                            name="code"
                            type="text"
                            value={code}
                            onChange={onInputChange}
                            disabled={validInt(id) > 0 ? true : false}
                            invalid={sendForm && !!codeValid}
                            feedbackText={sendForm && (codeValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="6" align="right">
                          <Button
                            disabled={validInt(id) > 0 ? true : false}
                            color="info"
                            onClick={fnConfirmGenerateCode}>
                            <i className="bi bi-arrow-clockwise" />
                            {IntlMessages("button.generateCode")}
                          </Button>
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="8">
                          <InputField
                            value={name}
                            name="name"
                            onChange={onInputChange}
                            type="text"
                            label="page.productsCatalog.modal.newProduct.input.name"
                            invalid={sendForm && !!nameValid}
                            feedbackText={sendForm && (nameValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="4">
                          <Checkbox
                            onChange={onInputChange}
                            name="status"
                            value={status}
                            label="check.status.inactive"
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <InputField
                            value={description}
                            name="description"
                            onChange={onInputChange}
                            type="textarea"
                            label="page.productsCatalog.modal.newProduct.input.description"
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" md="12" lg="6">
                          <SearchSelect
                            label="page.productsCatalog.modal.newProduct.select.classification"
                            name="typeId"
                            onChange={onInputChange}
                            inputValue={typeId}
                            options={listClassifications}
                            invalid={sendForm && !!typeIdValid}
                            feedbackText={sendForm && (typeIdValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" md="12" lg="6">
                          <SearchSelect
                            label="page.productsCatalog.modal.newProduct.select.packaging"
                            name="packId"
                            onChange={onInputChange}
                            inputValue={packId}
                            options={listPackagingUnits}
                            invalid={sendForm && !!packValid}
                            feedbackText={sendForm && (packValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" md="12" lg="6">
                          <InputField
                            value={submConversion}
                            name="submConversion"
                            onChange={onInputChange}
                            type="text"
                            label="page.productsCatalog.modal.newProduct.input.conversion"
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" md="12" lg="6">
                          <SearchSelect
                            label="page.productsCatalog.modal.newProduct.select.inputUnit"
                            name="undinId"
                            inputValue={undinId}
                            onChange={onInputChange}
                            options={listMeasurementUnits}
                            invalid={sendForm && !!undinIdValid}
                            feedbackText={sendForm && (undinIdValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" sm="6" md="12" lg="6">
                          <SearchSelect
                            name="undoutId"
                            inputValue={undoutId}
                            onChange={onInputChange}
                            options={listMeasurementUnits}
                            label="page.productsCatalog.modal.newProduct.select.outputUnit"
                            invalid={sendForm && !!undoutIdValid}
                            feedbackText={sendForm && (undoutIdValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs="12" sm="6" md="12" lg="6">
                          <SearchSelect
                            name="tradeId"
                            inputValue={tradeId}
                            onChange={onInputChange}
                            options={listMarks}
                            label="page.productsCatalog.modal.newProduct.select.tradeMark"
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx xxs="12" xs="12" sm="12" md="5" lg="5">
                      <Row>
                        <Colxx xxs="12">
                          <RadioGroup
                            label="page.productsCatalog.modal.newProduct.title.type"
                            name="type"
                            value={type}
                            onChange={onInputChange}
                            display="flex"
                            options={
                              [
                                { id: 1, label: "page.productsCatalog.modal.newProduct.radio.product" },
                                { id: 2, label: "page.productsCatalog.modal.newProduct.radio.service" },
                                { id: 3, label: "page.productsCatalog.modal.newProduct.radio.rawMaterial" }
                              ]
                            }
                            invalid={sendForm && !!typeValid}
                            feedbackText={sendForm && (typeValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12">
                          <ContainerWithLabel label="page.productsCatalog.modal.newProduct.title.costs">
                            <Row>
                              <Colxx xxs="12" sm="6" md="12" lg="6">
                                <InputField
                                  value={costValue}
                                  id="costValue"
                                  name="costValue"
                                  onChange={onInputChange}
                                  type="text"
                                  label="page.productsCatalog.modal.newProduct.input.averageCost"
                                  invalid={sendForm && !!costValueValid}
                                  feedbackText={sendForm && (costValueValid || null)}
                                />
                              </Colxx>
                              <Colxx xxs="12" sm="6" md="12" lg="6">
                                <InputField
                                  value={maxCostValue}
                                  name="maxCostValue"
                                  onChange={onInputChange}
                                  type="text"
                                  label="page.productsCatalog.modal.newProduct.input.maxCost"
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs="12" sm="6" md="12" lg="6">
                                <InputField
                                  value={lastCostValue}
                                  name="lastCostValue"
                                  onChange={onInputChange}
                                  type="text"
                                  label="page.productsCatalog.modal.newProduct.input.lastPrice"
                                />
                              </Colxx>
                              <Colxx xxs="12" sm="6" md="12" lg="6">
                                <SimpleSelect
                                  value={percentTax}
                                  name="percentTax"
                                  onChange={onInputChange}
                                  options={listTaxPercent}
                                  label="page.productsCatalog.modal.newProduct.input.taxPecent"
                                />
                              </Colxx>
                            </Row>
                            <Row>
                              <Colxx xxs="12" sm="6" md="12" lg="6">
                                <InputField
                                  value={taxValue}
                                  name="taxValue"
                                  onChange={onInputChange}
                                  disabled
                                  type="text"
                                  label="page.productsCatalog.modal.newProduct.input.taxValue"
                                />
                              </Colxx>
                            </Row>
                          </ContainerWithLabel>
                        </Colxx>
                      </Row>
                    </Colxx>
                  </Row>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="2">
                  <Row>
                    <Colxx xxs="12" lg="6">
                      <Row>
                        <Colxx xxs={12} sm={6}>
                          <RadioGroup
                            label="page.productsCatalog.modal.newProduct.title.salesPriceOpt"
                            name="typeCalculatePrice"
                            value={typeCalculatePrice}
                            onChange={onInputChange}
                            options={
                              [
                                { id: 1, label: "page.productsCatalog.modal.newProduct.input.averageCost" },
                                { id: 2, label: "page.productsCatalog.modal.newProduct.input.maxCost" },
                                { id: 3, label: "page.productsCatalog.modal.newProduct.radio.lastPrice" }
                              ]
                            }
                            invalid={sendForm && !!typeCalculatePriceValid}
                            feedbackText={sendForm && (typeCalculatePriceValid || null)}
                          />
                        </Colxx>
                        <Colxx xxs={12} sm={6}>
                          <RadioGroup
                            label="page.productsCatalog.modal.newProduct.title.inventoryCostOpt"
                            name="typeCalculateCost"
                            value={typeCalculateCost}
                            onChange={onInputChange}
                            options={
                              [
                                { id: 1, label: "page.productsCatalog.modal.newProduct.input.averageCost" },
                                { id: 2, label: "page.productsCatalog.modal.newProduct.input.maxCost" },
                                { id: 3, label: "page.productsCatalog.modal.newProduct.radio.lastPrice" }
                              ]
                            }
                            invalid={sendForm && !!typeCalculateCostValid}
                            feedbackText={sendForm && (typeCalculateCostValid || null)}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" className='mb-2'>
                          <SearchSelect
                            label="page.productsCatalog.modal.newProduct.select.parentProduct"
                            disabled={validInt(id) === 0 ? false : true}
                            name="parentProduct"
                            inputValue={parentProduct}
                            onChange={onInputChange}
                            options={listProducts}
                          />
                        </Colxx>
                      </Row>
                      <Row>
                        <Colxx xxs="12" className='mb-2'>
                          <InputField
                            value={notes}
                            name="notes"
                            onChange={onInputChange}
                            type="textarea"
                            label="page.productsCatalog.modal.newProduct.input.observations"
                          />
                        </Colxx>
                      </Row>
                    </Colxx>
                    <Colxx xxs="12" lg="6">
                      <ContainerWithLabel label="page.productsCatalog.modal.newProduct.title.salesPrices">
                        <Nav tabs className="separator-tabs mt-0 mb-2">
                          <NavItem>
                            <NavLink
                              className={classnames({
                                active: activeTabPrices === '1',
                                'nav-link': true,
                              })}
                              onClick={() => setActiveTabPrices('1')}
                            >
                              {IntlMessages("page.productsCatalog.modal.newProduct.title.localPrice")}
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              className={classnames({
                                active: activeTabPrices === '2',
                                'nav-link': true,
                              })}
                              onClick={() => setActiveTabPrices('2')}
                            >
                              {IntlMessages("page.productsCatalog.modal.newProduct.title.foreignPrice")}
                            </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTabPrices}>
                          <TabPane tabId="1">
                            <Row>
                              <Colxx xxs="12">
                                <Table bordered hover size='sm'>
                                  <thead>
                                    <tr>
                                      <th> </th>
                                      <th className="text-center">{IntlMessages("page.productsCatalog.modal.newProduct.column.profit")}</th>
                                      <th className="text-center">{IntlMessages("page.productsCatalog.modal.newProduct.column.salesValue")}</th>
                                      <th className="text-center">{IntlMessages("page.productsCatalog.modal.newProduct.column.totalPrice")}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>{IntlMessages("page.productsCatalog.modal.newProduct.column.min")}</td>
                                      <td>
                                        <InputField
                                          value={percentLocalPriceMin}
                                          name="percentLocalPriceMin"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-center">
                                        <InputField
                                          value={valuePercentLocalPriceMin}
                                          name="valuePercentLocalPriceMin"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-right">
                                        <InputField
                                          value={priceLocalMin}
                                          name="priceLocalMin"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>{IntlMessages("page.productsCatalog.modal.newProduct.column.med")}</td>
                                      <td>
                                        <InputField
                                          value={percentLocalPriceMid}
                                          name="percentLocalPriceMid"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-center">
                                        <InputField
                                          value={valuePercentLocalPriceMid}
                                          name="valuePercentLocalPriceMid"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-right">
                                        <InputField
                                          value={priceLocalMid}
                                          name="priceLocalMid"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>{IntlMessages("page.productsCatalog.modal.newProduct.column.max")}</td>
                                      <td>
                                        <InputField
                                          value={percentLocalPriceMax}
                                          name="percentLocalPriceMax"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-center">
                                        <InputField
                                          value={valuePercentLocalPriceMax}
                                          name="valuePercentLocalPriceMax"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-right">
                                        <InputField
                                          value={priceLocalMax}
                                          name="priceLocalMax"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </Colxx>
                            </Row>
                          </TabPane>
                        </TabContent>
                        <TabContent activeTab={activeTabPrices}>
                          <TabPane tabId="2">
                            <Row>
                              <Colxx xxs="12">
                                <Table bordered hover size='sm'>
                                  <thead>
                                    <tr>
                                      <th> </th>
                                      <th className="text-center">{IntlMessages("page.productsCatalog.modal.newProduct.column.profit")}</th>
                                      <th className="text-center">{IntlMessages("page.productsCatalog.modal.newProduct.column.salesValue")}</th>
                                      <th className="text-center">{IntlMessages("page.productsCatalog.modal.newProduct.column.totalPrice")}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td>{IntlMessages("page.productsCatalog.modal.newProduct.column.min")}</td>
                                      <td>
                                        <InputField
                                          value={percentOutsidePriceMin}
                                          name="percentOutsidePriceMin"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-center">
                                        <InputField
                                          value={valuePercentOutsidePriceMin}
                                          name="valuePercentOutsidePriceMin"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-right">
                                        <InputField
                                          value={priceOutsideMin}
                                          name="priceOutsideMin"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>{IntlMessages("page.productsCatalog.modal.newProduct.column.med")}</td>
                                      <td>
                                        <InputField
                                          value={percentOutsidePriceMid}
                                          name="percentOutsidePriceMid"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-center">
                                        <InputField
                                          value={valuePercentOutsidePriceMid}
                                          name="valuePercentOutsidePriceMid"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-right">
                                        <InputField
                                          value={priceOutsideMid}
                                          name="priceOutsideMid"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>{IntlMessages("page.productsCatalog.modal.newProduct.column.max")}</td>
                                      <td>
                                        <InputField
                                          value={percentOutsidePriceMax}
                                          name="percentOutsidePriceMax"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-center">
                                        <InputField
                                          value={valuePercentOutsidePriceMax}
                                          name="valuePercentOutsidePriceMax"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                      <td className="text-right">
                                        <InputField
                                          value={priceOutsideMax}
                                          name="priceOutsideMax"
                                          onChange={onInputChange}
                                          type="text"
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </Colxx>
                            </Row>
                          </TabPane>
                        </TabContent>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="3">
                  <Row>
                    <Colxx className="mb-3" xxs="12">
                      <ContainerWithLabel label="page.productsCatalog.modal.newProduct.title.options">
                        <Row>
                          <Colxx xxs="12" sm="6" md="6" lg="4" xl="3">
                            <Checkbox
                              onChange={onInputChange}
                              name="enableForPurchase"
                              value={enableForPurchase}
                              label="page.productsCatalog.modal.newProduct.check.enabledForPurchase"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="6" lg="4" xl="3">
                            <Checkbox
                              onChange={onInputChange}
                              name="enableForSale"
                              value={enableForSale}
                              label="page.productsCatalog.modal.newProduct.check.enabledForSale"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="6" lg="4" xl="3">
                            <Checkbox
                              onChange={onInputChange}
                              name="paymentTax"
                              value={paymentTax}
                              label="page.productsCatalog.modal.newProduct.check.applyISV"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="6" lg="4" xl="3">
                            <Checkbox
                              onChange={onInputChange}
                              name="requireExpLot"
                              value={requireExpLot}
                              label="page.productsCatalog.modal.newProduct.check.controlExpiration"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="6" lg="4" xl="3">
                            <Checkbox
                              onChange={onInputChange}
                              name="validToSale"
                              value={validToSale}
                              label="page.productsCatalog.modal.newProduct.check.requestValidation"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="6" lg="4" xl="3">
                            <Checkbox
                              onChange={onInputChange}
                              name="paymentComiss"
                              value={paymentComiss}
                              label="page.productsCatalog.modal.newProduct.check.applyCommission"
                            />
                          </Colxx>
                          <Colxx xxs="12" sm="6" md="6" lg="4" xl="3">
                            <Checkbox
                              onChange={onInputChange}
                              name="priceIncludeTax"
                              value={priceIncludeTax}
                              label="page.productsCatalog.modal.newProduct.check.priceIncludeTax"
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                  <Row>
                    <Colxx className="mb-3" xxs="12" xs="12" sm="12" md="6" lg="6">
                      <ContainerWithLabel label="page.productsCatalog.modal.newProduct.title.stock">
                        <Row>
                          <Colxx xxs="12">
                            <Table bordered hover>
                              <thead>
                                <tr>
                                  <th>{IntlMessages("page.productsCatalog.modal.newProduct.stock.store")}</th>
                                  <th>{IntlMessages("page.productsCatalog.modal.newProduct.stock.qty")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dataStock.map((item, idx) => {
                                  return (
                                    <tr id={`tr-table-dataStock-${item.id}`} key={idx}>
                                      <th scope="row">{item.store}</th>
                                      <td>{item.qty}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <th scope="row" colSpan="2">Total</th>
                                  <th className="text-right">00.00</th>
                                </tr>
                              </tfoot>
                            </Table>
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                    <Colxx xxs="12" xs="12" sm="12" md="6" lg="6">
                      <ContainerWithLabel label="page.productsCatalog.modal.newProduct.title.lastPurchase">
                        <Row>
                          <Colxx xxs="12" xs="6" md="12" lg="5" xl="3">
                            <InputField
                              value={dateLastPurchase}
                              name="dateLastPurchase"
                              onChange={onInputChange}
                              label="page.productsCatalog.modal.newProduct.input.dateLastPurchase"
                              type="text"
                              disabled
                            />
                          </Colxx>
                          <Colxx xxs="12" xs="6" md="12" lg="7" xl="4">
                            <InputField
                              value={numLastPurchase}
                              name="numLastPurchase"
                              onChange={onInputChange}
                              type="text"
                              disabled
                              label="page.productsCatalog.modal.newProduct.input.numLastPurchase"
                            />
                          </Colxx>
                          <Colxx xxs="12" xs="6" md="12" xl="5">
                            <InputField
                              value={provLastPurchase}
                              name="provLastPurchase"
                              onChange={onInputChange}
                              type="text"
                              disabled
                              label="page.productsCatalog.modal.newProduct.input.provLastPurchase"
                            />
                          </Colxx>
                        </Row>
                      </ContainerWithLabel>
                    </Colxx>
                  </Row>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalViewProd} />
      <Modal {...propsToModalDistProduct} />
      <Modal {...propsToModalAddTrademarks} />
      <Modal {...propsToModalCompProduct} />
      <Confirmation {...propsToMsgCode} />
      <Confirmation {...propsToMsgDeleteProduct} />
    </>
  );
}
export default ProductsCatalog;