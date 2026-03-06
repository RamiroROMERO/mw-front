import React from 'react'
import { useFooter } from './useFooter'
import { Row } from 'reactstrap';
import { Colxx } from '@/components/common/CustomBootstrap';
import { InputField } from '@/components/inputFields';

const Footer = ({totalPayments, setOtherPayments, setTotalBenefits, totalBenefits}) => {

  const {formState, onInputChange} = useFooter({totalPayments, setOtherPayments, setTotalBenefits});

  const {wagesOwed, otherPayments, overtimePayment, educationalVoucherValue, paymentSeventhDay, salaryAdjustment, thirteenthMonthOwed, fourteenthMonthOwed, vacationBonus, pendingVacation, holidayBonus, pregnancyPayments, breastfeedingPayments, paymentPrePostNatal, holidayPay} = formState

  return (
    <Row>
      <Colxx xxs={12} lg={9} xl={10}>
        <Row>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="wagesOwed"
              label='input.wagesOwed'
              value={wagesOwed}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="otherPayments"
              label='input.otherPayments'
              value={otherPayments}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="overtimePayment"
              label='input.overtimePayment'
              value={overtimePayment}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="educationalVoucherValue"
              label='input.educationalVoucherValue'
              value={educationalVoucherValue}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="paymentSeventhDay"
              label='input.paymentSeventhDay'
              value={paymentSeventhDay}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="salaryAdjustment"
              label='input.salaryAdjustment'
              value={salaryAdjustment}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="thirteenthMonthOwed"
              label='input.thirteenthMonthOwed'
              value={thirteenthMonthOwed}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="fourteenthMonthOwed"
              label='input.fourteenthMonthOwed'
              value={fourteenthMonthOwed}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="vacationBonus"
              label='input.vacationBonus'
              value={vacationBonus}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="pendingVacation"
              label='input.pendingVacation'
              value={pendingVacation}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="holidayBonus"
              label='input.holidayBonus'
              value={holidayBonus}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="pregnancyPayments"
              label='input.pregnancyPayments'
              value={pregnancyPayments}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="breastfeedingPayments"
              label='input.breastfeedingPayments'
              value={breastfeedingPayments}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="paymentPrePostNatal"
              label='input.paymentPrePostNatal'
              value={paymentPrePostNatal}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
          <Colxx xxs={12} sm={6} lg={4} xl={3}>
            <InputField
              name="holidayPay"
              label='input.holidayPay'
              value={holidayPay}
              onChange={onInputChange}
              type="text"
            />
          </Colxx>
        </Row>
      </Colxx>
      <Colxx xxs={12} sm={6} lg={3} xl={2}>
        <InputField
          name="totalBenefits"
          label='input.totalBenefits'
          value={totalBenefits}
          type="text"
          disabled
        />
      </Colxx>
    </Row>
  )
}

export default Footer