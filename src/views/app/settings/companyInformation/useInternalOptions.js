import { useEffect } from 'react'
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';

// Los campos del servidor de correo se guardan solo desde su propio modal (SPEC v2-162-sr): aquí no se reenvían.
const MAIL_FIELDS = ['mailServer', 'mailPort', 'mailSsl', 'mailEmail', 'mailUser', 'mailPass', 'mailCopy1', 'mailCopy2', 'mailCopy3', 'sendMailGenInvoice', 'sendMailGenOC', 'sendMailGenProvPayment', 'hasMailPass'];
const withoutMail = (form) => Object.fromEntries(Object.entries(form).filter(([key]) => !MAIL_FIELDS.includes(key)));

export const useInternalOptions = ({ companyId, setLoading, setOpen }) => {

  const { formState, onInputChange, onBulkForm } = useForm({
    id: 0,
    coffeeControl: false,
    farmsConrol: false,
    activitiesControl: false,
    containerControl: false,
    flourControl: false,
    laboratoryControl: false,
    hospitalControl: false,
    closeControl: false,
    sellerMenu: false,
    inventoryMenu: false,
    accountingMenu: false,
    bankMenu: false,
    taxesMenu: false,
    fixedAssetsMenu: false,
    rrhhMenu: false,
    hospitalMenu: false,
    laboratoryMenu: false,
    radiologyMenu: false,
    exportControl: false,
    comercialControl: false,
    posControl: false,
    payrollSeatControl: false,
    hotelMenu: false,
    percentSAR: '',
    exchangeType: 0,
    formatDate: 'DMY'
  });

  useEffect(() => {
    setLoading(true);
    const url = `admin/companyInternalSettings?companyId=${companyId}`;
    request.GET(url, resp => {
      const { data } = resp;
      let intData = {}
      if (data.length > 0) intData = data[0];
      if (intData.id) {
        onBulkForm(intData);
      }
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }, [])

  const fnSaveIntOptions = () => {
    setLoading(true);
    if (validInt(formState.id) === 0) {

      request.POST('admin/companyInternalSettings', withoutMail(formState), res => {
        setOpen(false);
        setLoading(false);
      }, err => {
        setOpen(false);
        setLoading(false);
      });
    } else {
      request.PUT(`admin/companyInternalSettings/${formState.id}`, withoutMail(formState), res => {
        setOpen(false)
        setLoading(false);
      }, err => {
        setOpen(false)
        setLoading(false);
      })
    }
  }

  return (
    {
      formState,
      onInputChange,
      fnSaveIntOptions
    }
  )
}
