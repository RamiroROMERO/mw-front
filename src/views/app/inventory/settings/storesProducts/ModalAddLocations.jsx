import { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import { request } from '@Helpers/core'
import notification from '@Containers/ui/Notifications';

// Equivalente a "El Nombre que desea crear para esta Ubicación ya existe en la base de
// Datos" del legacy (inv_almac_prod_new_location.sc2) — ver InvSetLocationController.
const fnHandleSaveError = (err) => {
  if (err?.messages?.[0]?.message === 'location.alreadyExists') {
    notification('error', 'msg.error.location.alreadyExists', 'alert.error.title');
  } else {
    notification('error', 'msg.save.record.error', 'alert.error.title');
  }
}

const ModalAddLocations = ({ setOpen, data }) => {
  const { setLoading, setListLocations } = data;

  const [nameLocation, setNameLocation] = useState('')

  const fnGetLocations = () => {
    request.GET('inventory/settings/locations', (resp) => {
      const listLoc = resp.data.map((item) => {
        return {
          id: item.id,
          name: item.name
        }
      });
      setListLocations(listLoc);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnSaveLocation = () => {
    if (nameLocation.length < 3) {
      return
    }
    const data = { name: nameLocation };
    setLoading(true);
    request.POST('inventory/settings/locations', data, (resp) => {
      setLoading(false);
      fnGetLocations();
      setOpen(false)
    }, err => {
      fnHandleSaveError(err);
      setLoading(false);
    });
  }

  return (
    <>
      <ModalBody>
        <Row>
          <Colxx xxs="12">
            <InputField
              label="input.name"
              id="nameLocation"
              name="nameLocation"
              value={nameLocation}
              onChange={({ target }) => setNameLocation(target.value)}
            />
          </Colxx>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={fnSaveLocation}>
          <i className="iconsminds-save" /> {IntlMessages("button.save")}
        </Button>
      </ModalFooter>
    </>
  )
}

export default ModalAddLocations