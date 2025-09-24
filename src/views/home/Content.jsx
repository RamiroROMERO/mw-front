import React from 'react';
const ContentHotel = React.lazy(() => import('./ContentHotel'));
const ContentHR = React.lazy(() => import('./ContentHR'));
import dashboards from '../../constants/dashboards';

const Content = (props) => {
  const { setLoading } = props;

  return (
    <>
      {/* <ContentHR setLoading={setLoading} /> */}
      <ContentHotel setLoading={setLoading} />

    </>
  );
}
export default Content;