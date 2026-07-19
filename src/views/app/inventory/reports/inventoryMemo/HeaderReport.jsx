import { Button, Row } from 'reactstrap'
import { Colxx } from '@Components/common/CustomBootstrap'
import { ContainerWithLabel } from '@Components/containerWithLabel'
import { InputField } from '@Components/inputFields'
import { IntlMessages } from '@Helpers/Utils'
import DateCalendar from '@Components/dateCalendar'

const HeaderReport = ({formState, onInputChange, fnMarkReported, fnPrintPrevious}) => {
  const {nameFor1, nameFor2, nameFrom1, nameFrom2, date, subject} = formState;

  return (
    <>
      <Row>
        <Colxx className="order-xs-2 order-xl-1" xxs="12" sm="6" xl="5">
          <ContainerWithLabel label="label.title.for">
            <Row>
              <Colxx xxs="12">
                <InputField
                  name="nameFor1"
                  label='input.name'
                  value={nameFor1}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="nameFor2"
                  label='input.name'
                  value={nameFor2}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx className="order-xs-3 order-xl-2" xxs="12" sm="6" xl="5">
          <ContainerWithLabel label="label.title.from">
            <Row>
              <Colxx xxs="12">
                <InputField
                  name="nameFrom1"
                  label='input.name'
                  value={nameFrom1}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
              <Colxx xxs="12">
                <InputField
                  name="nameFrom2"
                  label='input.name'
                  value={nameFrom2}
                  onChange={onInputChange}
                  type="text"
                />
              </Colxx>
            </Row>
          </ContainerWithLabel>
        </Colxx>
        <Colxx className="order-xs-1 order-xl-3" xxs="12" xl="2">
          <Row>
            <Colxx xxs="12" xs="6" md="4" xl="12">
              <DateCalendar
                name="date"
                label='select.date'
                value={date}
                onChange={onInputChange}
              />
            </Colxx>
          </Row>
        </Colxx>
        <Colxx className="order-xs-4 order-xl-4" xxs="12" xl="10">
          <InputField
            name="subject"
            label='input.subject'
            value={subject}
            onChange={onInputChange}
            type="text"
          />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="div-action-button-container">
          <Button color="primary" onClick={() => {fnMarkReported()}}>
            <i className='bi bi-check-lg' /> {IntlMessages("button.markReported")}
          </Button>
          <Button color="info" onClick={() => {fnPrintPrevious()}}>
            <i className='bi bi-printer' /> {IntlMessages("button.printPrevious")}
          </Button>
        </Colxx>
      </Row>
    </>
  )
}

export default HeaderReport