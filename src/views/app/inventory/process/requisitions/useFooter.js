
export const useFooter = ({onBulkForm, setShowWorkOrder}) => {

  const onAssignOTChange = e => {
    // Bug real corregido: negaba e.target.checked, así que marcar el checkbox
    // desmarcaba isWorkOrder y ocultaba el selector de Orden de Trabajo (al revés).
    const assign = e.target.checked;

    setShowWorkOrder(assign ? "block" : "none");

    onBulkForm({ isWorkOrder: assign ? 1 : 0, workOrderId: 0 });
  }

  return (
    {
      onAssignOTChange
    }
  )
}
