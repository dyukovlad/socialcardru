import React from "react";

const Button = props => {
  return (
    <button
      anim="ripple"
      type="button"
      className={props.className}
      onClick={props.onClick}
    >
      {props.name}
    </button>
  );
};

export default Button;
