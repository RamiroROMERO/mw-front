import { Row, Form, Button, Table, Input } from 'reactstrap';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import { Colxx } from '@Components/common/CustomBootstrap';
import { ContainerWithLabel } from '@Components/containerWithLabel';
import { InputField } from '@Components/inputFields';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import DateCalendar from '@Components/dateCalendar';
import { sumMixed } from './creditNoteRules';

// Nota de crédito MIXTA (SPEC v2-47-sr): una devolución cuyos productos se digitan (almacén, producto, cantidad, costo, lote y vencimiento)
// en vez de salir de una compra. El total de cada línea se calcula con las mismas reglas del back (el impuesto es el de la ficha). La compra
// origen es opcional: solo sirve para elegir la cuenta por pagar a rebajar.
const CreditNoteMixedTable = (props) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const {
    detail2, draft, listStores, productOptions, onProductSearch, onDraftChange, onDraftProductChange, fnAddMixedLine, onChangeMixedField,
    fnDeleteMixedRow, originPurchase, fnSeekOriginPurchase, fnClearOrigin, detailError, disabled
  } = props;

  const storeName = (storeId) => (listStores.find((item) => Number(item.value) === Number(storeId)) || {}).label || storeId;
  const total = sumMixed(detail2);

  return (
    <Form>
      <Row className="mb-2">
        <Colxx xxs="12" sm="6" lg="4">
          {!disabled && (
            <Button color="primary" onClick={fnSeekOriginPurchase}>
              <i className="bi bi-file-earmark-post" /> {t('button.selectInvoice')}
            </Button>
          )}
        </Colxx>
        <Colxx xxs="12" sm="6" lg="8">
          {originPurchase ? (
            <span>
              <strong>{t('page.creditNotesProv.input.originPurchase')}:</strong> {originPurchase.invoiceNumber}
              {!disabled && (
                <Button type="button" size="xs" color="link" onClick={fnClearOrigin}>{t('page.creditNotesProv.button.clearOrigin')}</Button>
              )}
            </span>
          ) : (
            <small className="text-muted">{t('page.creditNotesProv.mixed.originHelp')}</small>
          )}
        </Colxx>
      </Row>

      {!disabled && (
        <Row>
          <Colxx xxs="12" lg="3">
            <SearchSelect label="select.storeId" name="storeId" inputValue={draft.storeId} options={listStores} onChange={onDraftChange} />
          </Colxx>
          <Colxx xxs="12" lg="4">
            <SearchSelect
              label="select.productId"
              name="productCode"
              inputValue={draft.productCode}
              options={productOptions}
              onChange={onDraftProductChange}
              onInputChange={onProductSearch}
              filterOption={null}
            />
          </Colxx>
          <Colxx xxs="6" lg="1">
            <InputField name="quantity" label="table.column.qty" type="text" value={draft.quantity} onChange={onDraftChange} />
          </Colxx>
          <Colxx xxs="6" lg="2">
            <InputField name="cost" label="page.creditNotesProv.input.cost" type="text" value={draft.cost} onChange={onDraftChange} />
          </Colxx>
          <Colxx xxs="6" lg="2">
            <InputField name="lotCode" label="page.creditNotesProv.input.lot" type="text" value={draft.lotCode} onChange={onDraftChange} />
          </Colxx>
          <Colxx xxs="6" lg="3">
            <DateCalendar name="dateExp" label="page.creditNotesProv.input.dateExp" value={draft.dateExp} onChange={onDraftChange} />
          </Colxx>
          <Colxx xxs="12" lg="3">
            <Button color="primary" type="button" onClick={fnAddMixedLine}>
              <i className="bi bi-plus-circle" /> {t('page.creditNotesProv.button.addProduct')}
            </Button>
          </Colxx>
        </Row>
      )}

      <Row>
        <Colxx xxs="12">
          <ContainerWithLabel label="page.creditNotesProv.title.mixedDetail">
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>{t('select.storeId')}</th>
                  <th>{t('table.column.code')}</th>
                  <th>{t('table.column.description')}</th>
                  <th>{t('table.column.qty')}</th>
                  <th>{t('page.creditNotesProv.input.cost')}</th>
                  <th>{t('page.creditNotesProv.input.lot')}</th>
                  <th>{t('page.creditNotesProv.input.dateExp')}</th>
                  <th>{t('input.subtotal')}</th>
                  <th>{t('input.tax')}</th>
                  <th>{t('table.column.total')}</th>
                  {!disabled && <th>{t('table.column.options')}</th>}
                </tr>
              </thead>
              <tbody>
                {detail2.map((item) => (
                  <tr key={item.id}>
                    <td>{storeName(item.storeId)}</td>
                    <td>{item.productCode}</td>
                    <td>{item.description}</td>
                    <td align="right">
                      {disabled ? formatNumber(item.quantity) : (
                        <Input bsSize="sm" type="text" value={item.quantity} onChange={(e) => onChangeMixedField(item.id, 'quantity', e.target.value)} />
                      )}
                    </td>
                    <td align="right">
                      {disabled ? formatNumber(item.cost) : (
                        <Input bsSize="sm" type="text" value={item.cost} onChange={(e) => onChangeMixedField(item.id, 'cost', e.target.value)} />
                      )}
                    </td>
                    <td>{item.lotCode}</td>
                    <td>{item.dateExp}</td>
                    <td align="right">{formatNumber(item.subtotal)}</td>
                    <td align="right">{formatNumber(item.taxValue)}</td>
                    <td align="right">{formatNumber(item.total)}</td>
                    {!disabled && (
                      <td align="right">
                        <Button type="button" className="btn-circle-table" color="outline-danger" title="Eliminar" onClick={() => fnDeleteMixedRow(item.id)}>
                          <i className="bi bi-trash" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={9} align="right">{t('input.total')}</th>
                  <th align="right">{formatNumber(total, 'L.')}</th>
                  {!disabled && <th />}
                </tr>
              </tfoot>
            </Table>
            {detailError && <div className="invalid-feedback d-block">{t(detailError)}</div>}
          </ContainerWithLabel>
        </Colxx>
      </Row>
    </Form>
  );
};

export default CreditNoteMixedTable;
