import { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { IntlMessages } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields'
import { request } from '@Helpers/core'

// Como el legacy (inv_almac_prod_new_location.sc2): el nombre lleva al menos 3 caracteres (sin contar espacios
// de los extremos) y la columna admite 20. Que no esté repetido lo decide el back (location.alreadyExists).
const NAME_MIN = 3;
const NAME_MAX = 20;

const ModalAddLocations = ({ setOpen, data }) => {
  const { setLoading, setListLocations } = data;

  const [nameLocation, setNameLocation] = useState('')
  const [sendForm, setSendForm] = useState(false)

  const nameInvalid = sendForm && nameLocation.trim().length < NAME_MIN

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
    }, () => {
      setLoading(false);
    });
  }

  const fnSaveLocation = () => {
    setSendForm(true);
    if (nameLocation.trim().length < NAME_MIN) {
      return
    }
    const data = { name: nameLocation.trim() };
    setLoading(true);
    request.POST('inventory/settings/locations', data, () => {
      setLoading(false);
      fnGetLocations();
      setOpen(false)
    }, () => {
      // request.POST ya muestra el mensaje real del back (por ejemplo location.alreadyExists).
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
              maxLength={NAME_MAX}
              invalid={nameInvalid}
              feedbackText={nameInvalid ? 'page.storesProducts.error.locationName' : undefined}
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