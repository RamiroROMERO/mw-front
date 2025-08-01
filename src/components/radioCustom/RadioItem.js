import React from 'react'

export const RadioItem = ({key, id, caption, image='assets/logos/company-icon', selectedIndex, handleClick}) => {
  console.log(image);
  return (
    <label key={key} className={"list-items-radio " + (selectedIndex === id? "selected":"")}>
      <input
        type="radio"
        name="optionGR"
        value={id}
        onClick={(event) => {handleClick(event, id);}}
      />
      <div className="d-flex align-items-center justify-content-center">
        <img src={image + ".png"} alt="logo" title="company" style={{height:"40px"}} />
      </div>
      <p style={{marginTop:'5px'}}>{caption.substring(0,10)}</p>
    </label>
  )
}
