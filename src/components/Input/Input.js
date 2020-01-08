import React from "react";

const Input = props => {
  return (
    <input
      type="text"
      name="card"
      value={props.value}
      onChange={props.onChange}
      placeholder=" "
    />
  );
};

export default Input;
