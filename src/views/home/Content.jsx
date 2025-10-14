import React from 'react';
const ContentHotel = React.lazy(() => import('./ContentHotel'));
const ContentHR = React.lazy(() => import('./ContentHR'));
import dashboards from '../../constants/dashboards';

const Content = (props) => {
  const { setLoading } = props;

  const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
  if (companyData) {
    const { enableBankMenu, enableContabMenu, enableFixedAssetsMenu, enableHospitalMenu, enableInventoryMenu, enableInvoiceMenu,
      enableLabMenu, enableLoansMenu, enableRRHHMenu, enableTaxMenu, enableHotelMenu } = companyData;
    if (enableHotelMenu) {
      return (
        <>
          <ContentHotel setLoading={setLoading} />
        </>
      )
    } else {
      return (
        <>
          <ContentHR setLoading={setLoading} />

        </>
      )
    }
  }

  return (<></>)
}
export default Content;