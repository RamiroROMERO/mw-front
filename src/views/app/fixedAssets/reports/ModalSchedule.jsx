import { useEffect, useState } from 'react';
import { ModalBody, ModalFooter, Button, Row, Table } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { request } from '@Helpers/core';

export const ModalSchedule = ({ data, setOpen }) => {
  const { assetId, setLoading } = data;
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    request.GET(`fixedAssets/reports/depreciationSchedule/${assetId}`, (resp) => {
      setLines(resp.data);
      setLoading(false);
    }, () => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  return (
    <>
      <ModalBody style={{ maxHeight: 420, overflowY: 'auto' }}>
        <Row>
          <Colxx xxs="12">
            <Table bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>{IntlMessages('table.column.date')}</th>
                  <th>{IntlMessages('page.fixedAssets.table.month')}</th>
                  <th>{IntlMessages('page.fixedAssets.table.year')}</th>
                  <th align="right">{IntlMessages('table.column.value')}</th>
                  <th>{IntlMessages('page.fixedAssets.title.status')}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td>{line.date}</td>
                    <td>{line.monthName}</td>
                    <td>{line.year}</td>
                    <td align="right">{formatNumber(line.value)}</td>
                    <td>{line.statusName}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => setOpen(false)}>
          <i className="bi bi-box-arrow-right" />{` ${IntlMessages('button.exit')}`}
        </Button>
      </ModalFooter>
    </>
  );
}
