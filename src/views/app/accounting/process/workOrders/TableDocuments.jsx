import { Colxx } from "@/components/common/CustomBootstrap";
import { formatNumber, IntlMessages, validFloat } from "@/helpers/Utils";
import React, { useEffect, useState } from "react";
import { Row, Table } from "reactstrap";

const TableDocuments = (props) =>{
  const {listDocuments} = props;
  const [totalDocuments, setTotalDocuments] = useState(0);

  useEffect(()=>{
    const sumTotal = listDocuments.map(item => validFloat(item.total)).reduce((prev, curr) => prev + curr, 0);
    setTotalDocuments(sumTotal);
  },[listDocuments]);

  return(
    <>
      <Row>
        <Colxx xxs="12">
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>{IntlMessages("page.workOrders.table.documents.date")}</th>
                <th>{IntlMessages("page.workOrders.table.documents.documentCode")}</th>
                <th className = 'd-xs-none-table-cell'>{IntlMessages("page.workOrders.table.documents.documentId")}</th>
                <th className = 'd-sm-none-table-cell'>{IntlMessages("page.workOrders.table.documents.subtotal")}</th>
                <th className = 'd-md-none-table-cell'>{IntlMessages("page.workOrders.table.documents.discount")}</th>
                <th className = 'd-md-none-table-cell'>{IntlMessages("page.workOrders.table.documents.valTax")}</th>
                <th>{IntlMessages("page.workOrders.table.documents.total")}</th>
              </tr>
            </thead>
            <tbody>
              {listDocuments.map((item,idx) =>{
                return (
                  <tr id={`tr-table-orderDetail-${item.id}`} key={idx}>
                    <th scope="row">{item.date}</th>
                    <th scope="row">{item.setDocument.title}</th>
                    <td className = 'd-xs-none-table-cell' >{item.documentId}</td>
                    <td className = 'd-sm-none-table-cell' align='right'>{formatNumber(item.subtotal)}</td>
                    <td className = 'd-md-none-table-cell' align='right'>{formatNumber(item.discount)}</td>
                    <td className = 'd-md-none-table-cell' align='right'>{formatNumber(item.valTax)}</td>
                    <td className = 'd-md-none-table-cell' align='right'>{formatNumber(item.total)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} align='right'><b>TOTAL</b></td>
                <td align="right"><b>{totalDocuments}</b></td>
              </tr>
            </tfoot>
          </Table>
        </Colxx>
      </Row>
    </>
  )
}

export default TableDocuments;