import React, { Fragment, Component } from "react";

import Input from "../Input/Input";
import Button from "../Button/Button";
import { getTimeStamp, re, StringToXML, Spinner } from "../../base";

import axios from "axios";

class FirstStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      data: [],
      clear: false,
      error: undefined,
      loading: false
    };
  }

  onClick = () => {
    if (this.state.data.length !== 0) {
      this.props.onChangeInput({
        data: this.state.data,
        card: this.state.value
      });
    }
    return;
  };

  // 2336329873

  onChange = e => {
    e.preventDefault();
    const value = e.target.value;

    if (value === "" || re.test(value)) {
      if (value.length >= 1) {
        this.setState({ clear: true });
      } else {
        this.setState({ clear: false });
      }

      this.setState({ value });

      if (value.length === 10) {
        this.checkCard(value);
        this.setState({ loading: true });
      } else {
        this.setState({ error: undefined });
      }
    }
  };

  checkCard = async value => {
    let res = await axios.post("/api/card", {
      card: value,
      client_time: getTimeStamp()
    });
    let { data } = res.data;
    this.checkCardResponse(StringToXML(data));
  };

  clearInput = () => {
    this.setState({ value: "", mess: "", error: undefined, clear: false });
  };

  checkCardResponse = data => {
    this.setState({ loading: false });
    try {
      let code = data.getElementsByTagName("code")[0].childNodes[0].nodeValue;
      let mess = data.getElementsByTagName("comment")[0].childNodes[0]
        .nodeValue;

      if (Number(code) !== 0) {
        this.setState({ error: "error", mess });
      } else {
        this.setState({ error: "valid", mess: "", data });
      }
    } catch {
      this.setState({
        error: "error",
        mess: "Произошла ошибка. Попробуйте позднее."
      });
    }
  };

  render() {
    const { mess, error, value, clear, loading } = this.state;
    return (
      <Fragment>
        <h2 className="mb-16">Онлайн пополнение</h2>
        <p>
          Моментально пополняйте баланс транспортной карты с помощью банковской
          карты.
        </p>
        <div className={"pay-line " + error}>
          <div className="pay-input mr-16 w-3">
            {loading && <Spinner />}
            <Input value={value} onChange={this.onChange} />
            <span>Номер транспортной карты</span>
            <div
              className={clear ? "reset reset__block" : "reset"}
              onClick={this.clearInput}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM4.27312 10.4846C3.44493 11.3128 4.68722 12.5551 5.51542 11.7269L8 9.24229L10.4368 11.6791C11.265 12.5073 12.5073 11.265 11.6791 10.4368L9.24229 8L11.7269 5.51542C12.5551 4.68722 11.3128 3.44493 10.4846 4.27312L8 6.75771L5.5632 4.3209C4.735 3.49271 3.49271 4.735 4.3209 5.5632L6.75771 8L4.27312 10.4846Z"
                  fill="#9395A4"
                />
              </svg>
            </div>
            <div className="error-message">{mess}</div>
          </div>
          <Button
            name={"Продолжить"}
            onClick={this.onClick}
            className={"ripple btn__submit"}
          />
        </div>
      </Fragment>
    );
  }
}

export default FirstStep;
