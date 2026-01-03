import ReactTable from '@Components/reactTable';
import Header from './Header';
import { usePaymentsHistory } from './usePaymentsHistory'

const Content = ({setLoading, adminControl}) => {

  const {table, propsToHeader} = usePaymentsHistory({setLoading, adminControl});

  return (
    <>
      <Header {...propsToHeader}/>
      <ReactTable {...table}/>
    </>
  )
}

export default Content