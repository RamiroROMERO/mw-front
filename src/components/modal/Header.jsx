import { IntlMessagesFn } from "@Helpers/Utils";
import { ModalHeader } from "reactstrap";

const Header = ({ title, valueTitle, fnClose }) => {
  const noRefCheck = () => { fnClose(false) };
  const closeBtn = (
    <button className="close" onClick={noRefCheck} type="button" aria-label="Close">
      <span aria-hidden="true" className="strong" >x</span>
    </button>
  );
  return (
    <ModalHeader id="mw-modal-title" toggle={noRefCheck} close={closeBtn}  >
      {`${IntlMessagesFn(title)} ${valueTitle}`}
    </ModalHeader>
  )
}

export default Header;