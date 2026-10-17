import ModalMW from '@Components/modal';
import ModalSearchContent from './ModalSearchContent';

// Modal de búsqueda completo: <ModalSearch open setOpen title="..." url columns onSelect />.
// Todo lo que no sea open/setOpen/title/maxWidth viaja en `data` (ver ModalSearchContent).
const ModalSearch = ({ open, setOpen, title, valueTitle, maxWidth = 'lg', ...config }) => (
  <ModalMW
    ModalContent={ModalSearchContent}
    title={title}
    valueTitle={valueTitle}
    open={open}
    setOpen={setOpen}
    maxWidth={maxWidth}
    data={config}
  />
);

export { ModalSearchContent };
export default ModalSearch;
