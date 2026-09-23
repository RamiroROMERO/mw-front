import { validInt, IntlMessagesFn } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks'
import { useState, useEffect } from 'react'
import createNotification from '@Containers/ui/Notifications';
import { NotificationManager } from '@Components/common/react-notifications';

export const useMailOptionsModal = ({ data, setOpen }) => {
  const { companyId, setLoading } = data;
  const [sendingTest, setSendingTest] = useState(false);

  const testMailSuccessMessage = IntlMessagesFn('msg.email.sent.success');
  const testMailErrorMessage = IntlMessagesFn('msg.email.sent.error');

  const { formState, onInputChange, onBulkForm } = useForm({
    id: 0,
    companyId,
    mailServer: "",
    mailPort: "",
    mailSsl: false,
    mailEmail: "",
    mailUser: "",
    mailPass: "",
    mailCopy1: "",
    mailCopy2: "",
    mailCopy3: "",
    sendMailGenInvoice: false,
    sendMailGenOC: false,
    sendMailGenProvPayment: false
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

      request.POST('admin/companyInternalSettings', formState, res => {
        setOpen(false);
        setLoading(false);
      }, err => {
        setOpen(false);
        setLoading(false);
      });
    } else {
      request.PUT(`admin/companyInternalSettings/${formState.id}`, formState, res => {
        setOpen(false)
        setLoading(false);
      }, err => {
        setOpen(false)
        setLoading(false);
      })
    }
  }

  const fnTestMail = () => {
    if (!formState.mailServer) {
      createNotification('warning', 'msg.required.input.mailServer', 'alert.warning.title');
      return;
    }
    if (!formState.mailEmail) {
      createNotification('warning', 'msg.required.input.mailEmail', 'alert.warning.title');
      return;
    }
    if (!formState.mailPass) {
      createNotification('warning', 'msg.required.input.mailPass', 'alert.warning.title');
      return;
    }
    if (!formState.mailPort) {
      createNotification('warning', 'msg.required.input.mailPort', 'alert.warning.title');
      return;
    }
    if (!formState.mailCopy1) {
      createNotification('warning', 'msg.required.input.mailCopy1', 'alert.warning.title');
      return;
    }

    setSendingTest(true);
    setLoading(true);
    request.POST('admin/companyInternalSettings/testMail', formState, () => {
      setSendingTest(false);
      setLoading(false);
      NotificationManager.success(testMailSuccessMessage, '', 3000, null, null, '');
    }, () => {
      setSendingTest(false);
      setLoading(false);
      NotificationManager.error(testMailErrorMessage, '', 4000, null, null, '');
    }, false);
  }

  return {
    formState, onInputChange, fnSaveIntOptions, fnTestMail, sendingTest
  }
}
