import { Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';

export const ModalSearchConciliation = ({ data }) => {
  const { dataList, fnSelectConciliation } = data;

  return (
    <Row>
      <Colxx xxs="12">
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>{IntlMessages('table.column.date')}</th>
              <th>{IntlMessages('page.bankConciliation.input.periodName')}</th>
              <th>{IntlMessages('select.bankCode')}</th>
              <th align="right">{IntlMessages('page.bankConciliation.input.valueBank')}</th>
              <th align="right">{IntlMessages('page.bankConciliation.input.valueBook')}</th>
            </tr>
          </thead>
          <tbody>
            {dataList.map((row) => (
              <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => fnSelectConciliation(row)}>
                <td>{DateHelper.format(row.date)}</td>
                <td>{`${(row.month || '').toUpperCase()}-${row.year}`}</td>
                <td>{row.bankName}</td>
                <td align="right">{formatNumber(row.valueBank)}</td>
                <td align="right">{formatNumber(row.valueBook)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Colxx>
    </Row>
  );
}
