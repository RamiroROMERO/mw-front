import React, {useState} from 'react'
import { Input, Table } from 'reactstrap'
import { formatNumber, IntlMessages, validFloat, validInt } from '@/helpers/Utils'

export const EditValuesTable = ({ optionsTitle, valuesTitle, totalTitle, listOptions = [], setListValues=null,  setValueCalculate=null, showTotal=false }) => {

  const [totalValue, setTotalValue] = useState(0);

   const valueChange = ({target})=>{

    const {id, value}= target;
    const idItem =  validInt(id.split('-')[1]);
    const list = listOptions.map(elem=>{
      if(validInt(elem.id)===idItem){
        elem.value = value;
      }
      return elem;
    });
    const valSum = list.reduce((prev, curr)=>{
      prev += validFloat(curr.value);
      return prev;
    }, 0)
    setTotalValue(valSum);
    setListValues(list);
    if(typeof setValueCalculate === 'function') setValueCalculate(valSum);
  }

  return (
    <Table bordered size="sm">
      <thead>
        <tr>
          <th
            className='text-center'
            style={{ minWidth: '70%', maxWidth: '70%', width: '70%' }}
          >
            {IntlMessages(optionsTitle)}
          </th>
          <th
            className='text-center'
            style={{ minWidth: '30%', maxWidth: '30%', width: '30%' }}
          >
            {IntlMessages(valuesTitle)}
          </th>
        </tr>
      </thead>
      <tbody>
        {listOptions.map(elem => {
          return (
            <tr key={elem.id}>
              <td> {elem.name} </td>
              <td>
                <Input
                  id={`value-${elem.id}`}
                  name={`value-${elem.id}`}
                  bsSize="sm"
                  type='text'
                  value={elem.value}
                  onChange={valueChange}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
      {
        showTotal && (
          <tfoot>
            <tr>
              <td style={{fontWeight:'bold'}}> {totalTitle && (IntlMessages(totalTitle))} </td>
              <td style={{fontWeight:'bold', textAlign:'right'}}> { formatNumber(totalValue,'',2)} </td>
            </tr>
          </tfoot>
        )
      }
    </Table>
  )
}
