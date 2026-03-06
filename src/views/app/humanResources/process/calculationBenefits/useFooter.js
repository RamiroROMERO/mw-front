import { validFloat } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import React, { useEffect, useState } from 'react'

export const useFooter = ({totalPayments, setOtherPayments, setTotalBenefits}) => {

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    wagesOwed: 0,
    otherPayments: 0,
    overtimePayment: 0,
    educationalVoucherValue: 0,
    paymentSeventhDay: 0,
    salaryAdjustment: 0,
    thirteenthMonthOwed: 0,
    fourteenthMonthOwed: 0,
    vacationBonus: 0,
    pendingVacation: 0,
    holidayBonus: 0,
    pregnancyPayments: 0,
    breastfeedingPayments: 0,
    paymentPrePostNatal: 0,
    holidayPay: 0
  });

  const {wagesOwed, otherPayments, overtimePayment, educationalVoucherValue, paymentSeventhDay, salaryAdjustment, thirteenthMonthOwed, fourteenthMonthOwed, vacationBonus, pendingVacation, holidayBonus, pregnancyPayments, breastfeedingPayments, paymentPrePostNatal, holidayPay} = formState;

  useEffect(()=>{
    const total = validFloat(totalPayments) + validFloat(wagesOwed) + validFloat(otherPayments) + validFloat(overtimePayment) + validFloat(educationalVoucherValue) + validFloat(paymentSeventhDay) + validFloat(salaryAdjustment) + validFloat(thirteenthMonthOwed) + validFloat(fourteenthMonthOwed) + validFloat(vacationBonus) + validFloat(pendingVacation) + validFloat(holidayBonus) + validFloat(pregnancyPayments) + validFloat(breastfeedingPayments) + validFloat(paymentPrePostNatal) + validFloat(holidayPay);
    setTotalBenefits(total);

    setOtherPayments(formState);
  },[wagesOwed, otherPayments, overtimePayment, educationalVoucherValue, paymentSeventhDay, salaryAdjustment, thirteenthMonthOwed, fourteenthMonthOwed, vacationBonus, pendingVacation, holidayBonus, pregnancyPayments, breastfeedingPayments, paymentPrePostNatal, holidayPay, totalPayments]);

  return (
    {
      formState,
      onInputChange
    }
  )
}
