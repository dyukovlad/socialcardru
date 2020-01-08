import React from "react";

export const re = /^[0-9\b]+$/;

export const Spinner = () => <div className="bt-spinner bt-loading"></div>;

export const getTimeStamp = () => {
  const now = new Date();
  return (
    now.getFullYear() +
    "-" +
    (now.getMonth() < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1) +
    "-" +
    (now.getDate() < 10 ? "0" + now.getDate() : now.getDate()) +
    " " +
    now.getHours() +
    ":" +
    (now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes()) +
    ":" +
    (now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds()) +
    " " +
    now.toString().match(/([-\\+][0-9]+)\s/)[1]
  );
};

export const customStyles = {
  option: (provided, state) => ({
    ...provided,
    padding: 20
  }),
  container: () => ({
    marginBottom: 50,
    width: 524,
    border: "1px solid #E1E5E7",
    borderRadius: 4,
    position: "relative",
    padding: 0
  }),
  valueContainer: base => ({
    ...base,
    padding: "0px 8px",
    fontSize: 16,
    color: "#9395a4"
  }),
  placeholder: () => ({
    fontSize: 16,
    color: "#9395a4"
  }),
  input: () => ({
    height: 64,
    minHeight: 64,
    fontSize: 16
  }),
  control: () => ({
    height: 64,
    minHeight: 64,
    display: "flex",
    padding: "0 8px"
  }),
  singleValue: base => ({
    ...base,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: "#0b1c27"
  }),
  indicatorSeparator: () => ({ display: "none" })
};

export const StringToXML = oString => {
  //code for IE
  if (window.ActiveXObject) {
    var oXML = new XMLHttpRequest();
    oXML.loadXML(oString);
    return oXML;
  }
  // code for Chrome, Safari, Firefox, Opera, etc.
  else {
    return new DOMParser().parseFromString(oString, "text/xml");
  }
};
