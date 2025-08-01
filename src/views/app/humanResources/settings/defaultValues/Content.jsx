import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardFooter, Row } from 'reactstrap';
import { Colxx, Separator } from '@Components/common/CustomBootstrap';
import { useDefaultValues } from './useDefaultValues';
import { IntlMessages as t } from '@Helpers/Utils'
import { InputField } from '@Components/inputFields';

const DefaultValues = (props) => {

  const { setLoading } = props;

  const { formState, onImputChange, fnSave } = useDefaultValues({ setLoading });

  const { maxHoursDay, maxHoursWeek, maxHoursMonth } = formState


  return (
    <>
      <Row>
        <Colxx xs={12} >
          <Card>
            <CardBody>
              <Row>
                <Colxx sm={12} md={4} lg={3} xl={2}>
                  <InputField
                    label="page.defaultValues.label.maxHoursDay"
                    name="maxHoursDay"
                    value={maxHoursDay}
                    onChange={onImputChange}
                  />
                </Colxx>
              </Row>
            </CardBody>
            <CardFooter>
              <Button className='btn btn-success' onClick={fnSave}><i className="iconsminds-save" /> {t("button.save")} </Button>
            </CardFooter>
          </Card>
        </Colxx>
      </Row>
    </>
  );
}

export default DefaultValues;