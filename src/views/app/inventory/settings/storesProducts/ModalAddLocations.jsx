import React, { useState } from 'react'
import { Button, ModalBody, ModalFooter, Row } from 'reactstrap'
import { Colxx } from '@/components/common/CustomBootstrap'
import { IntlMessages } from '@/helpers/Utils'
import { InputField } from '@/components/inputFields'
import { request } from '@/helpers/core'

const ModalAddLocations = ({ setOpen, data }) => {
  const { setLoading, setListLocations } = data;

  const [nameLocation, setNameLocation] = useState('')

  const fnGetLocations = () => {
    request.GET('inventory/settings/locations', (resp) => {
      const listLoc = resp.data.map((item) => {
        return {
          id: item.name,
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
      setLoading(false);
      setOpen(false);
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