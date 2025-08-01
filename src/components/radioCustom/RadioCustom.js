
import { Colxx } from '@/components/common/CustomBootstrap';
import { IntlMessages } from '@/helpers/Utils';
import React, { useState } from 'react'
import { RadioItem } from './RadioItem';

export const CustomRadio = (props) => {
  const { title = "", list = [], fnExecute = undefined, display } = props;

  const [selectedIndex, setSelectedIndex] = useState(1);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    if (fnExecute) {
      fnExecute(index);
    }
  };

  return (
    <>
      {title !== "" && (<><h6>{IntlMessages(title)}</h6><hr /></>)}
      <Colxx className="mb-4 radio-custom-container">
        {list.map((item, key) => {
          return (
            <RadioItem
              key={key}
              id={item.id}
              caption={item.name}
              image={item.image}
              selectedIndex={selectedIndex}
              handleClick={handleListItemClick}
            />
          )
        })}
      </Colxx>
    </>
  )
}
