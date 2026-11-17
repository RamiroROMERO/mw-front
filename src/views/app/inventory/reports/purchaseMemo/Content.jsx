import MemoScreen from '../memos/MemoScreen';

// Memorándum de compras (SPEC v2-59-sr): la pantalla común con el tipo `purchase`.
const PurchaseMemo = ({ setLoading }) => <MemoScreen setLoading={setLoading} kind="purchase" />;

export default PurchaseMemo;
