import { Button, ModalBody, ModalFooter } from 'reactstrap';
import { InputField } from '@Components/inputFields';
import { IntlMessages } from '@Helpers/Utils';
import { isIgnoreReasonValid } from './entryBalancingRules';

export const ModalIgnore = ({ data, setOpen }) => {
  const { ignoreReason, setIgnoreReason, fnIgnore, selectedItems, busy, t } = data;
  return (
    <>
      <ModalBody>
        <p>{t('page.entryBalancing.ignore.count', { count: selectedItems.length })}</p>
        <InputField
          name="reason"
          label="page.entryBalancing.ignore.reason"
          value={ignoreReason}
          onChange={(e) => setIgnoreReason(e.target.value)}
          type="text"
          maxLength={200}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={() => setOpen(false)}>{IntlMessages('page.entryBalancing.button.cancel')}</Button>
        <Button color="primary" disabled={busy || !isIgnoreReasonValid(ignoreReason)} onClick={fnIgnore}>
          {IntlMessages('page.entryBalancing.button.ignore')}
        </Button>
      </ModalFooter>
    </>
  );
};
