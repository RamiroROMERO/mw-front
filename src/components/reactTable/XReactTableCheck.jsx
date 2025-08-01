import React from "react";

function XReactTableCheck({ indeterminate, ...rest }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return <div className="custom-control custom-checkbox">
    <input type="checkbox" className="custom-control-input" ref={ref} {...rest} />
    <label className="custom-control-label"> </label>
  </div>
}

export default XReactTableCheck;
