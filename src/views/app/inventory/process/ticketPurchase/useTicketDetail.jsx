import { useMemo, useState } from 'react';
import { useForm } from '@Hooks'
import { emptyLine, toFormValidation, validateLine } from './ticketPurchaseRules';

// Formulario "agregar producto" de la boleta. Las reglas son las de ticketPurchaseRules.js (las mismas del DTO del back): errores por campo
// y la línea no se agrega mientras alguno falle. El catálogo de productos (ModalViewProd) trae sus propias filas por páginas: ya no se
// descarga todo el stock para abrir el buscador.
export const useTicketDetail = ({ accountingActive }) => {
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);

  const { formState: formStateDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, onBulkForm: onBulkFormDeta } = useForm(emptyLine());

  const errorsDeta = useMemo(() => validateLine(formStateDeta, { accountingActive }), [formStateDeta, accountingActive]);
  const formValidationDeta = useMemo(() => toFormValidation(errorsDeta), [errorsDeta]);
  const isFormValidDeta = Object.keys(errorsDeta).length === 0;

  const fnViewProducts = () => setOpenModalProducts(true);

  // La fila es la del catálogo (`code`, `name`): se llena el código y el nombre; el nombre sigue editable (hay boletas de texto libre).
  const fnSelectProduct = (item) => {
    onBulkFormDeta({ productCode: item.code ?? '', nameProduct: item.name ?? '' });
    setOpenModalProducts(false);
  }

  const fnClearProduct = () => onBulkFormDeta({ productCode: '' });

  return (
    {
      formStateDeta,
      onInputChangeDeta,
      fnViewProducts,
      fnSelectProduct,
      fnClearProduct,
      openModalProducts,
      setOpenModalProducts,
      onBulkFormDeta,
      sendFormDeta,
      setSendFormDeta,
      formValidationDeta,
      isFormValidDeta,
      onResetFormDeta
    }
  )
}
