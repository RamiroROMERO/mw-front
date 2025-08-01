import React, { useState } from 'react'
import { , FormGroup, Input, Label } from 'reactstrap'
import './style.css'

const OptionCards = ({list=[], fnExecute=undefined, display='grid'}) => {

  const [selectedIndex, setSelectedIndex] = useState(1);
  
  const handleListItemClick = (e, id)=>{
    setSelectedIndex(id);
    if(fnExecute){
      fnExecute(id);
    }
  }

  return (
    <>
    <div style={{display, marginBottom: '50px', backgroudColor:'#f8f8f8'}}>
      {list.map(item =>{
        return (
          <label key={`optionGR-${item.id}`} htmlFor={`optionGR-${item.id}`} className={`list-items-radio ${(selectedIndex === item.id? "selected":"")}`}>
            <input
            id={`optionGR-${item.id}`}
            type="radio"
            name="optionGR"
            value={item.id}
            onClick={(event) => {handleListItemClick(event, item.id);}}
            />
            <img alt="" src="/assets/img/profiles/l-1.jpg" className="list-thumbnail align-self-center m-1 small" />
              <div className='d-flex flex-grow-1 min-width-zero'>
                <div className='pl-2 align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero card-body card-body-edited'>
                  <div className='min-width-zero'>
                    <div className='truncate mb-1 card-title card-title-edited'>{item.caption}</div>
                    <p className="text-muted text-small mb-2 card-text">{item.description}</p>
                  </div>
                </div>
              </div>
            </label>
        )
      })}
    </div>
    {/* <img alt="profile" src="/assets/img/profiles/l-1.jpg" className="img-thumbnail list-thumbnail align-self-center m-4  rounded-circle small" />
              <div className='d-flex flex-grow-1 min-width-zero'>
                <div className='pl-0 align-self-center d-flex flex-column flex-lg-row justify-content-between min-width-zero card-body'>
                  <div className='min-width-zero'>
                    <p className='truncate mb-1 card-subtitle'>{item.caption}</p>
                  </div>
                </div>
              </div>  */}
    </>
  )
}

export default OptionCards