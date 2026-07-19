import React, { Suspense } from 'react';

const Content = React.lazy(() =>
  import(/* webpackChunkName: "start" */ './Content')
);
const Test = (props) => (
  <Suspense fallback={<div className="loading" />}>
    <Content {...props} />
  </Suspense>
);
export default Test;
