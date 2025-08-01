
export const useFooter = ({onBulkForm, setShowWorkOrder}) => {

  const onAssignOTChange = e =>{
    const assign = !e.target.checked;

    if(assign !== true){
      setShowWorkOrder("block");
    }else{
      setShowWorkOrder("none");
    }

    onBulkForm({isWorkOrder: assign, workOrderId: 0});
  }

  return (
    {
      onAssignOTChange
    }
  )
}
