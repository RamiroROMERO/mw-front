import CardBooking from '@/components/cards/CardBooking'
import { Colxx } from '@/components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import { useReservation } from './useReservation'
import PaginationBackend from '@/components/reactTable/PaginationBackend'

const Content = ({setLoading, screenControl}) => {

  const {dataRooms, currentPage, totalPages, setCurrentPage} = useReservation({setLoading, screenControl});

  return (
    <>
      <Row>
        {
          dataRooms.map((item, idx) =>
            <Colxx xxs={12} md={6} lg={4} key={idx}>
              <CardBooking
                image={item.imageSrc}
                status={item.statusName}
                name={item.name}
                type={item.typeName}
                description={item.description}
                capacity={item.capacity}
                bedNumber={item.bedNumber}
                mealType={item.mealPlanName}
                price={item.rate}
                statusColor={item.statusColor}
                statusId={item.statusId}
              />
            </Colxx>
          )
        }
        </Row>
        <Row>
          <Colxx xxs={12}>
            <Card>
              <CardBody style={{padding: '1rem'}}>
                <PaginationBackend currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}/>
              </CardBody>
            </Card>
          </Colxx>
        </Row>
    </>
  )
}

export default Content