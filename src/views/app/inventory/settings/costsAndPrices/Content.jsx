import { Card, CardBody, Row, Button, Input } from 'reactstrap';
import { IntlMessages } from "@Helpers/Utils";
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { SimpleSelect } from '@Components/simpleSelect';
import SearchSelect from '@Components/SearchSelect/SearchSelect';
import ReactTable from '@Components/reactTable';
import useCostsAndPrices from './useCostsAndPrices';

const CostsAndPrices = ({ setLoading }) => {

  const { dataFull, search, setSearch, listClassifications, listMeasurementUnits, listPackagingUnits, listMarks, listTaxPercent,
    fnRowChange, fnSave, fnExport } = useCostsAndPrices({ setLoading });

  const inputCell = (field) => function InputCell({ row }) {
    return (
      <Input
        bsSize="sm"
        type="text"
        value={row.original[field]}
        onChange={(e) => fnRowChange(row.original.rowKey, field, e.target.value)}
      />
    );
  };

  const searchSelectCell = (field, options) => function SearchSelectCell({ row }) {
    return (
      <SearchSelect
        name={field}
        inputValue={row.original[field]}
        options={options}
        onChange={(e) => fnRowChange(row.original.rowKey, field, e.target.value)}
      />
    );
  };

  function TaxCell({ row }) {
    return (
      <input
        type="checkbox"
        checked={row.original.paymentTax}
        onChange={(e) => fnRowChange(row.original.rowKey, 'paymentTax', e.target.checked)}
      />
    );
  }

  function TaxPercentCell({ row }) {
    return (
      <SimpleSelect
        name="percentTax"
        value={row.original.percentTax}
        options={listTaxPercent}
        onChange={(e) => fnRowChange(row.original.rowKey, 'percentTax', e.target.value)}
      />
    );
  }

  const widthStyle = (px) => ({ headerStyle: { minWidth: `${px}px` }, style: { minWidth: `${px}px` } });

  // Código + Nombre quedan fijos a la izquierda al hacer scroll horizontal (como el
  // LockColumns=3 del legacy), igual que se congelaría la primera columna de un Excel.
  const CODE_WIDTH = 100;
  const NAME_WIDTH = 220;
  const stickyStyle = (px, left) => ({
    headerStyle: { minWidth: `${px}px`, position: 'sticky', left: `${left}px`, zIndex: 2, backgroundColor: '#fff' },
    style: { minWidth: `${px}px`, position: 'sticky', left: `${left}px`, zIndex: 1, backgroundColor: '#fff' }
  });

  const columns = [
    { header: IntlMessages("page.costsAndPrices.table.code"), accessorKey: "code", ...stickyStyle(CODE_WIDTH, 0) },
    { header: IntlMessages("page.costsAndPrices.table.name"), accessorKey: "name", cell: inputCell('name'), ...stickyStyle(NAME_WIDTH, CODE_WIDTH) },
    { header: IntlMessages("page.costsAndPrices.table.trademark"), accessorKey: "tradeId", cell: searchSelectCell('tradeId', listMarks), ...widthStyle(240) },
    { header: IntlMessages("page.costsAndPrices.table.classification"), accessorKey: "typeId", cell: searchSelectCell('typeId', listClassifications), ...widthStyle(240) },
    { header: IntlMessages("page.costsAndPrices.table.packaging"), accessorKey: "packId", cell: searchSelectCell('packId', listPackagingUnits), ...widthStyle(240) },
    { header: IntlMessages("page.costsAndPrices.table.submConversion"), accessorKey: "submConversion", cell: inputCell('submConversion'), ...widthStyle(100) },
    { header: IntlMessages("page.costsAndPrices.table.inputUnit"), accessorKey: "undinId", cell: searchSelectCell('undinId', listMeasurementUnits), ...widthStyle(240) },
    { header: IntlMessages("page.costsAndPrices.table.tax"), accessorKey: "paymentTax", cell: TaxCell, ...widthStyle(60) },
    { header: IntlMessages("page.costsAndPrices.table.taxPercent"), accessorKey: "percentTax", cell: TaxPercentCell, ...widthStyle(110) },
    { header: IntlMessages("page.costsAndPrices.table.cost"), accessorKey: "costValue", cell: inputCell('costValue'), ...widthStyle(110) },
    { header: IntlMessages("page.costsAndPrices.table.outputUnit"), accessorKey: "undoutId", cell: searchSelectCell('undoutId', listMeasurementUnits), ...widthStyle(240) },
    { header: IntlMessages("page.costsAndPrices.table.valChange"), accessorKey: "valChange", cell: inputCell('valChange'), ...widthStyle(110) },
    { header: IntlMessages("page.costsAndPrices.table.price1"), accessorKey: "localMinPrice", cell: inputCell('localMinPrice'), ...widthStyle(110) },
    { header: IntlMessages("page.costsAndPrices.table.price2"), accessorKey: "localMedPrice", cell: inputCell('localMedPrice'), ...widthStyle(110) },
    { header: IntlMessages("page.costsAndPrices.table.price3"), accessorKey: "localMaxPrice", cell: inputCell('localMaxPrice'), ...widthStyle(110) },
    { header: IntlMessages("page.costsAndPrices.table.price1Foran"), accessorKey: "foranMinPrice", cell: inputCell('foranMinPrice'), ...widthStyle(130) },
    { header: IntlMessages("page.costsAndPrices.table.price2Foran"), accessorKey: "foranMedPrice", cell: inputCell('foranMedPrice'), ...widthStyle(130) },
    { header: IntlMessages("page.costsAndPrices.table.price3Foran"), accessorKey: "foranMaxPrice", cell: inputCell('foranMaxPrice'), ...widthStyle(130) }
  ];

  return (
    <Row>
      <Colxx xxs="12">
        <Card className="mb-3">
          <CardBody>
            <Row>
              <Colxx xxs="12" sm="6" lg="4">
                <InputField
                  label="page.costsAndPrices.input.search"
                  name="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Colxx>
              <Colxx xxs="12" sm="6" lg="8" className="div-action-button-container">
                <Button color="info" onClick={fnExport}><i className="bi bi-file-earmark-excel" /> {IntlMessages("button.export")}</Button>
                <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {IntlMessages("button.save")}</Button>
              </Colxx>
            </Row>
          </CardBody>
        </Card>
        <ReactTable
          columns={columns}
          data={dataFull}
          options={{ pageSize: 10, pageSizeOptions: [10, 20, 50] }}
        />
      </Colxx>
    </Row>
  );
}

export default CostsAndPrices;
