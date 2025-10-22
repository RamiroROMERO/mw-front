import { Colxx, Separator } from '@Components/common/CustomBootstrap'
import { Card, CardBody, Row } from 'reactstrap'
import ControlPanel from '@Components/controlPanel'
import Confirmation from '@Containers/ui/confirmationMsg';
import ReactTable from '@Components/reactTable'
import Modal from '@Components/modal';
import DetailPayment from './DetailPayment'
import DetailTable from './DetailTable'
import ModalViewPayPlans from './ModalViewPayPlans'
import SearchSelect from '@Components/SearchSelect/SearchSelect'
import { usePaymentPlans } from './usePaymentPlans'

const PaymentPlans = ({ setLoading, screenControl }) => {

  const {projectId, listProjects, dataPaymentPlans, table, setBulkForm, openModalPaymentPlans, setOpenModalPaymentPlans, onProjectChange, setDataPayPlanDetail, fnViewPaymentPlans, propsToControlPanel, propsToDetailPayment, propsToDetailTable, propsToMsgCancel, propsToMsgDelete} = usePaymentPlans({setLoading, screenControl})

  const propsToModalPaymentPlan = {
    ModalContent: ModalViewPayPlans,
    title: "page.paymentPlans.modal.viewPaymentPlans.title",
    open: openModalPaymentPlans,
    setOpen: setOpenModalPaymentPlans,
    maxWidth: 'lg',
    data: {
      dataPaymentPlans,
      setBulkForm,
      setDataPayPlanDetail,
      setLoading,
      fnViewPaymentPlans
    }
  }

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Card>
            <CardBody>
              <ControlPanel {...propsToControlPanel} />
              <Separator className="mt-2 mb-5" />
              <Row>
                <Colxx xxs="12">
                  <DetailPayment {...propsToDetailPayment} />
                </Colxx>
              </Row>
              <Row>
                <Colxx xxs="12" lg="6" xl="5" className="mb-3">
                  <Row>
                    <Colxx xxs={12}>
                      <SearchSelect
                        label='select.project'
                        name='projectId'
                        inputValue={projectId}
                        options={listProjects}
                        onChange={onProjectChange}
                      />
                    </Colxx>
                    <Colxx xxs={12}>
                      <ReactTable {...table}/>
                    </Colxx>
                  </Row>
                </Colxx>
                <Colxx xxs="12" lg="6" xl="7">
                  <DetailTable {...propsToDetailTable} />
                </Colxx>
              </Row>
            </CardBody>
          </Card>
        </Colxx>
      </Row>
      <Modal {...propsToModalPaymentPlan} />
      <Confirmation {...propsToMsgCancel} />
      <Confirmation {...propsToMsgDelete} />
    </>
  )
}

export default PaymentPlans