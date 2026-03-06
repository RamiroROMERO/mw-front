import { Colxx } from '@/components/common/CustomBootstrap'
import { ContainerWithLabel } from '@/components/containerWithLabel'
import { InputField } from '@/components/inputFields'
import { formatNumber, IntlMessages } from '@/helpers/Utils'
import { Card, CardBody, Row, Table } from 'reactstrap'
import Footer from './Footer'

const Detail = ({dataBenefits, setOtherPayments, totalBenefits, setTotalBenefits}) => {
  const dataCalculations = dataBenefits?.dataCalculations || [];

  const totalPayments = dataBenefits?.totalPayments || 0;

  return (
    <Card className='mb-3'>
      <CardBody>
        <Row>
          <Colxx xxs={12} lg={5}>
            <Row>
              <Colxx xxs={12}>
                <ContainerWithLabel label="page.calculationBenefits.label.timeWorked">
                  <Row>
                    <Colxx xxs={12} sm={4} lg={4}>
                      <InputField
                        name="yearsWorked"
                        label='input.years'
                        value={dataBenefits.yearsWorked}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={4} lg={4}>
                      <InputField
                        name="monthsWorked"
                        label='input.months'
                        value={dataBenefits.monthsWorked}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={4} lg={4}>
                      <InputField
                        name="daysWorked"
                        label='input.days'
                        value={dataBenefits.daysWorked}
                        type="text"
                        disabled
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
              <Colxx xxs={12}>
                <ContainerWithLabel label="page.calculationBenefits.label.salaries">
                  <Row>
                    <Colxx xxs={12} sm={6} lg={12} xl={6}>
                      <InputField
                        name="monthlyBaseSalary"
                        label='input.monthlyBaseSalary'
                        value={dataBenefits.monthlyBaseSalary}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={6} lg={12} xl={6}>
                      <InputField
                        name="dailyBaseSalary"
                        label='input.dailyBaseSalary'
                        value={dataBenefits.dailyBaseSalary}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={6} lg={12} xl={6}>
                      <InputField
                        name="averageMonthlySalary"
                        label='input.averageMonthlySalary'
                        value={dataBenefits.averageMonthlySalary}
                        type="text"
                        disabled
                      />
                    </Colxx>
                    <Colxx xxs={12} sm={6} lg={12} xl={6}>
                      <InputField
                        name="averageDailySalary"
                        label='input.averageDailySalary'
                        value={dataBenefits.averageDailySalary}
                        type="text"
                        disabled
                      />
                    </Colxx>
                  </Row>
                </ContainerWithLabel>
              </Colxx>
            </Row>
          </Colxx>
          <Colxx xxs={12} lg={7}>
            <Table bordered hover size='sm'>
              <thead>
                <tr>
                  <th width="30%">{IntlMessages('table.column.calculation')}</th>
                  <th width="10%">{IntlMessages('table.column.time')}</th>
                  <th width="10%">{IntlMessages('table.column.factor')}</th>
                  <th width="10%">{IntlMessages('table.column.total')}</th>
                </tr>
              </thead>
              <tbody>
                {dataCalculations.map((item,idx) =>{
                  return (
                    <tr id={`tr-table-calculations-${item.id}`} key={idx}>
                      <td>{item.calculation}</td>
                      <td align='right'>{formatNumber(item.time, '', 2)}</td>
                      <td align='right'>{formatNumber(item.factor, '', 2)}</td>
                      <td align='right'>{formatNumber(item.total, 'L. ', 2)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><b>Total</b></td>
                  <td></td>
                  <td></td>
                  <td align='right'><b>{formatNumber(dataBenefits.totalPayments, 'L. ', 2)}</b></td>
                </tr>
              </tfoot>
            </Table>
          </Colxx>
        </Row>
        <Row>
          <Colxx xxs={12} lg={12}>
            <ContainerWithLabel label="page.calculationBenefits.label.otherPayments">
              <Footer totalPayments={totalPayments} setOtherPayments={setOtherPayments} totalBenefits={totalBenefits} setTotalBenefits={setTotalBenefits}/>
            </ContainerWithLabel>
          </Colxx>
        </Row>
      </CardBody>
    </Card>
  )
}

export default Detail