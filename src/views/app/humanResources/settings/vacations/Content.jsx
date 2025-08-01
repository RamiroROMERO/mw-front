import { Colxx } from '@Components/common/CustomBootstrap'
import { Row } from 'reactstrap'
import Confirmation from '@Containers/ui/confirmationMsg';
import DetailVacations from './DetailVacations';
import ReactTable from "@Components/reactTable"
import { useVacations } from './useVacations'
import useDetailTable from './useDetailTable';

const Vacations = (props) => {
  const { setLoading } = props;

  const {propsToDetailTable, propsToDetailVacations, propsToMsgDelete} = useVacations({setLoading});

  const {table} = useDetailTable({...propsToDetailTable})

  return (
    <>
      <Row>
        <Colxx xss="12" lg="4">
          <DetailVacations {...propsToDetailVacations} />
        </Colxx>
        <Colxx xsx="12" lg="8">
          <ReactTable {...table}/>
        </Colxx>
      </Row>
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default Vacations;
