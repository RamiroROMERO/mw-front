import MemoScreen from '../memos/MemoScreen';

// Memorándum de documentos de inventario (SPEC v2-59-sr): la pantalla común con el tipo `inventory`.
const InventoryMemo = ({ setLoading }) => <MemoScreen setLoading={setLoading} kind="inventory" />;

export default InventoryMemo;
