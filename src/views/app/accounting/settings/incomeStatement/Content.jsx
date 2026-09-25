import { Button, Row } from 'reactstrap';
import { Colxx } from '@Components/common/CustomBootstrap';
import Modal from '@Components/modal';
import { IntlMessages } from '@Helpers/Utils';
import GroupCard from './GroupCard';
import { useIncomeStatementStructure, TYPE_GROUPS } from './useIncomeStatementStructure';

const DISCOUNTS_HINT = 'page.incomeStatementStructure.group.discounts.hint';

const IncomeStatement = ({ setLoading }) => {
  const { groups, fnOpenAdd, fnRemoveAccount, fnSave, propsToModalAddAccounts } = useIncomeStatementStructure({ setLoading });

  return (
    <>
      <Row>
        <Colxx xxs="12" className="div-action-button-container mb-3">
          <Button color="primary" onClick={fnSave}>
            <i className="bi bi-save-fill" /> {IntlMessages('button.save')}
          </Button>
        </Colxx>
      </Row>
      <Row>
        {TYPE_GROUPS.map((g) => (
          <Colxx xxs="12" md="6" key={g.type}>
            <GroupCard
              label={g.label}
              hint={g.type === 7 ? DISCOUNTS_HINT : null}
              rows={groups[g.type]}
              onAdd={() => fnOpenAdd(g.type)}
              onRemove={(accountNumber) => fnRemoveAccount(g.type, accountNumber)}
            />
          </Colxx>
        ))}
      </Row>
      <Modal {...propsToModalAddAccounts} />
    </>
  );
}
export default IncomeStatement;
