import React from "react";

function XReactTableCheck({ indeterminate, ...rest }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return <div className="form-check">
    <input type="checkbox" className="form-check-input" ref={ref} {...rest} />
    <label className="form-check-label"> </label>
  </div>
}

export default XReactTableCheck;
