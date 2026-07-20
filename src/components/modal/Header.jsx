import { IntlMessagesFn } from "@Helpers/Utils";
import { ModalHeader } from "reactstrap";

const Header = ({ title, valueTitle, fnClose }) => {
  const noRefCheck = () => { fnClose(false) };
  return (
    <ModalHeader id="mw-modal-title" toggle={noRefCheck}>
      {`${IntlMessagesFn(title)} ${valueTitle}`}
    </ModalHeader>
  )
}

export default Header;