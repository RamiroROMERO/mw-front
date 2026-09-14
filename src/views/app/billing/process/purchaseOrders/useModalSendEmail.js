import { useEffect, useState } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { IntlMessagesFn } from '@Helpers/Utils';
import { NotificationManager } from '@Components/common/react-notifications';

export const useModalSendEmail = ({ data, setOpen }) => {
  const { setLoading, sendUrl, documentId, attachmentName, defaultTo, defaultSubject, defaultBody } = data;

  const [sending, setSending] = useState(false);

  // IntlMessages* usa useIntl() (un hook) por dentro, así que se resuelve acá arriba
  // (durante el render del hook), no dentro del callback async de fnSendEmail.
  const successMessage = IntlMessagesFn('msg.email.sent.success');
  const errorMessage = IntlMessagesFn('msg.email.sent.error');

  const { formState, onInputChange, onBulkForm } = useForm({
    to: '',
    subject: '',
    body: ''
  });

  useEffect(() => {
    onBulkForm({ to: defaultTo || '', subject: defaultSubject || '', body: defaultBody || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, defaultTo, defaultSubject, defaultBody]);

  const fnSendEmail = () => {
    if (!formState.to || sending) return;
    setSending(true);
    setLoading(true);
    request.POST(sendUrl, {
      id: documentId,
      to: formState.to,
      subject: formState.subject,
      body: formState.body
    }, () => {
      setSending(false);
      setLoading(false);
      NotificationManager.success(successMessage, '', 3000, null, null, '');
      setOpen(false);
    }, () => {
      setSending(false);
      setLoading(false);
      NotificationManager.error(errorMessage, '', 4000, null, null, '');
    });
  }

  return {
    formState,
    onInputChange,
    sending,
    attachmentName,
    fnSendEmail
  }
}
