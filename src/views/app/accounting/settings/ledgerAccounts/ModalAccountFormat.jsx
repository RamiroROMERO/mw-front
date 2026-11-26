import { useEffect, useState } from 'react';
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap';
import { useIntl } from 'react-intl';
import { request } from '@Helpers/core';
import { Colxx } from '@Components/common/CustomBootstrap';
import { InputField } from '@Components/inputFields';
import { LEVEL_FIELDS, buildFormatPayload, mapFormatToForm, validateFormatConfig } from './accountFormatRules';

// Configuración de cuentas (cont_ccc_set.sc2 del legacy): formato completo y máscara de cada nivel. Solo la abre un administrador del sistema; el back vuelve a comprobarlo y, con cuentas
// creadas, no deja cambiar cuántos dígitos tiene cada nivel (solo los separadores).
const ModalAccountFormat = ({ data, setOpen }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { initialFormat, setLoading, onSaved } = data;
  const [form, setForm] = useState(mapFormatToForm(initialFormat));
  const [sendForm, setSendForm] = useState(false);
  const problem = validateFormatConfig(form);

  // Si la configuración llega o cambia con el modal ya montado (carga tardía, o guardada desde otra sesión), el formulario la toma.
  useEffect(() => { setForm(mapFormatToForm(initialFormat)); }, [initialFormat]);

  const onChange = ({ target }) => setForm((prev) => ({ ...prev, [target.name]: target.value.replace(/[^#.-]/g, '') }));

  const fnSave = () => {
    setSendForm(true);
    if (problem) return;
    setLoading(true);
    request.PUT('accounting/settings/accountants/format', buildFormatPayload(form), () => {
      setLoading(false);
      setOpen(false);
      onSaved();
    }, () => setLoading(false));
  };

  const formatError = sendForm && problem === 'format' ? 'page.ledgerAccounts.format.error.format' : null;
  const levelsError = sendForm && problem === 'levels' ? 'page.ledgerAccounts.format.error.levels' : null;

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              value={form.format}
              name="format"
              onChange={onChange}
              type="text"
              maxLength={25}
              label="page.ledgerAccounts.format.input.format"
              invalid={!!formatError}
              feedbackText={formatError}
            />
            <p className="text-muted text-small">{t('page.ledgerAccounts.format.hint')}</p>
          </Colxx>
          {LEVEL_FIELDS.map((field, index) => (
            <Colxx xxs="12" sm="6" key={field}>
              <InputField
                value={form[field]}
                name={field}
                onChange={onChange}
                type="text"
                maxLength={25}
                label={`page.ledgerAccounts.format.input.level${index + 1}`}
                invalid={!!levelsError}
              />
            </Colxx>
          ))}
          {levelsError && (
            <Colxx xxs="12"><div className="invalid-feedback d-block">{t(levelsError)}</div></Colxx>
          )}
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSave}><i className="iconsminds-save" /> {t('button.save')}</Button>
        <Button color="danger" onClick={() => setOpen(false)}><i className="bi bi-box-arrow-right" /> {t('button.exit')}</Button>
      </ModalFooter>
    </>
  );
};

export default ModalAccountFormat;
