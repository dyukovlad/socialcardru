import React, { Fragment, Component } from "react";
import Select from "react-select";
import { formSubmit } from "../Payment/Payment";

import {
  getTimeStamp,
  customStyles,
  StringToXML,
  re,
  Spinner
} from "../../base";

import axios from "axios";

// 2336329873
class SecondStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      pbtext: "",
      selectedOption: Object,
      viewBilet: [],
      amount: "",
      percent: 0,
      fullSumm: 0,
      disabledAmount: true,
      warn: false,
      warnAbon: false,
      messAbon: "",
      abonent: "",
      loading: false,
      isCheck: false
    };
  }

  componentDidMount() {
    console.log(this.props.data);
    console.log(this.props.card);
    const data = this.props.data;

    const id = data.getElementsByTagName("id")[0].childNodes[0].nodeValue;
    const pbtext = data.getElementsByTagName("pbtext")[0].childNodes[0]
      .nodeValue;
    const tickets = data.getElementsByTagName("ticket");
    const array = Array.prototype.slice.call(tickets);

    let viewBilet = [];

    for (let prop of array) {
      viewBilet.push({
        value: Number(prop.getAttribute("pdcode")),
        label: prop.getAttribute("pdname"),
        mindate: prop.getAttribute("mindate"),
        maxdate: prop.getAttribute("maxdate"),
        pdclass: Number(prop.getAttribute("pdclass")),
        maxres: prop.getAttribute("maxres") * 0.01
      });
    }

    // console.log(viewBilet);

    this.setState({
      id,
      pbtext,
      viewBilet
    });
  }

  handleSelectTarifs = selectedOption => {
    console.log(selectedOption);

    // открываем на редактирование поля с вводом суммы
    if (selectedOption.pdclass === 2) {
      this.setState({
        disabledAmount: false,
        maxres: selectedOption.maxres
      });
    } else {
      this.setState({ disabledAmount: true, maxres: null });
    }

    this.setState({ selectedOption }, () => {
      this.getPrice();
    });
    // запрашиваем сумму
  };

  getPrice = async () => {
    this.setState({ loading: true });
    try {
      let body = this.state.selectedOption;

      let res = await axios.post("/api/card/getprice", {
        client_time: getTimeStamp(),
        card: Number(this.props.card),
        id: Number(this.state.id),
        pdcode: body.value,
        mindate: body.mindate
      });
      let { data } = res.data;
      // this.setState({ amount: "" });
      this.getPriceResponse(StringToXML(data));
    } catch (e) {
      console.log(e);
    }
  };

  getPriceResponse = data => {
    //сумма в копейках
    let amount =
      data.getElementsByTagName("price")[0].childNodes[0].nodeValue * 0.01;

    if (this.state.maxres) {
      amount *= 100;
    }

    this.setState({ amount, loading: false }, () => {
      this.percent(this.state.amount);
    });
  };

  percent = value => {
    let percent = value / 100;
    let fullSumm = Number(value) + Number(percent);

    this.setState({
      percent,
      fullSumm
    });
  };

  amountChange = event => {
    event.preventDefault();
    let amount = event.target.value;

    if (amount === "" || re.test(amount)) {
      // this.validPrice(cost);

      if (amount < 100 || amount > this.state.maxres) {
        this.setState({
          warn: "error"
        });
      } else {
        this.setState({
          warn: "valid"
        });
      }

      this.setState(
        {
          amount
        },
        () => {
          this.percent(this.state.amount);
        }
      );
    }
  };

  handleUserInput = e => {
    const value = e.target.value;

    this.setState({ abonent: value }, () => {
      this.validation(value);
    });
  };

  validation(value) {
    // console.log(value);

    if (value !== "") {
      if (/[^[0-9]/.test(value)) {
        let patternEmail = /^([a-z0-9_\\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
        if (patternEmail.test(value)) {
          // console.log("E-mail введен верно");
          this.setState({
            warnAbon: "valid",
            nameValue: "Email"
          });
        } else {
          // console.log("Не верно введен e-mail");
          this.setState({ warnAbon: "error", nameValue: "" });
        }
      } else {
        let patternPhone = /^\+?[78]?[\s\-\\(]*\d{3}[\s\-\\)]*\d{3}\D?\d{2}\D?\d{2}$/i;
        if (patternPhone.test(value) && value.length >= 10) {
          // console.log("Телефон введен верно");
          this.setState({
            warnAbon: "valid",
            nameValue: "Phone"
          });
        } else {
          // console.log("Не верно введен номер телефона");
          this.setState({ warnAbon: "error", nameValue: "" });
        }
      }
    } else {
      this.setState({ warnAbon: "error" });
      // console.log("Поле input не должно быть пустым");
    }
  }

  handleCheckChange = () => {
    this.setState({
      isCheck: !this.state.isCheck
    });
  };

  onClickBtn = event => {
    event.preventDefault();
    if (
      this.state.isCheck &&
      this.state.abonent.length !== 0 &&
      this.state.amount.length !== 0
    ) {
      console.log("send");
      //1 формируем ссыль
      let form = document.forms["sender"];

      //Добавляем динамически скрытое поле
      let agent = document.createElement("input");
      agent.type = "hidden";
      agent.name = this.state.nameValue;
      agent.value = this.state.abonent;
      form.appendChild(agent);

      // form[this.state.nameValue].value = this.state.abonent;
      form["Order_IDP"].value = Number(this.state.id);
      form["Subtotal_P"].value = this.state.fullSumm;

      let url_sign = formSubmit(form);

      console.log(form);

      this.setState({ url_payment: url_sign });

      //2 отправляем на запись в бд
      this.getPayment(form["Signature"].value);
    }
  };

  getPayment = async val => {
    let body = this.state.selectedOption;
    let res = await axios.post("/api/card/payment", {
      client_time: getTimeStamp(),
      card: Number(this.props.card),
      id: Number(this.state.id),
      pdcode: body.value,
      mindate: body.mindate,
      summa: this.state.fullSumm,
      abonent: this.state.abonent,
      signature: val
    });

    let { data } = res.data;

    console.log(data);
    //3 если ок то отправляем на оплату
    if (data) {
      document.location.href = this.state.url_payment;
    } else {
      console.log("Что то пошло не так!");
    }
  };
  // 2336329873
  render() {
    const { card } = this.props;
    const {
      pbtext,
      viewBilet,
      amount,
      percent,
      fullSumm,
      disabledAmount,
      warn,
      warnSelect,
      warnAbon,
      maxres,
      abonent,
      isCheck,
      loading
    } = this.state;
    return (
      <Fragment>
        <h2 className="mb-32">Информация о карте</h2>
        <div className="pay-info mb-40">
          <div className="pay-info-line">
            <div className="pay-info-line__name">Номер транспортной карты</div>
            <div className="pay-info__number">{card}</div>
          </div>
          <div className="pay-info-line">
            <div className="pay-info-line__name">Тариф</div>
            <div className="pay-info__balance">{pbtext}</div>
          </div>
        </div>
        <div className={"pay-line " + warnSelect}>
          <Select
            styles={customStyles}
            placeholder="Вид проездного билета"
            searchable={true}
            onBlurResetsInput={false}
            onCloseResetsInput={false}
            autoload={false}
            isSearchable={false}
            required
            onChange={this.handleSelectTarifs}
            options={viewBilet}
            // onFocus={this.maybeLoadOptions}
          />
        </div>
        <h4 className="mb-16">Пополнить баланс</h4>
        <div className={"pay-line mb-40 " + warn}>
          {/*error or valid*/}
          <div className="pay-input">
            {loading && <Spinner />}
            <input
              type="text"
              required="required"
              value={amount}
              onChange={this.amountChange}
              onFocus={this.focusValue}
              placeholder=" "
              disabled={disabledAmount}
            />
            <span>Введите сумму </span>
            <div className="reset">
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
          </div>
          <div className="error-message">
            Минимум 100 ₽, максимум {maxres} ₽.
          </div>
        </div>

        {/* <h5>Автоплатеж</h5>
      <div className="pay-desc">
        Сделаем платеж в при указанном минимальном балансе
      </div>
      <div className="pay-radios mb-16">
        <input type="radio" name="boolean" id="on" value="on-block" />
        <label className="pay-radio" htmlFor="on">
          <span>Включить</span>
          <div className="pay-radio-icon"></div>
        </label>
        <input
          type="radio"
          name="boolean"
          id="off"
          value="off"
          checked
        />
        <label className="pay-radio" htmlFor="off">
          <input type="radio" name="boolean" />
          <span>Выключить</span>
          <div className="pay-radio-icon"></div>
        </label>
      </div>
      <div id="group1">
        <div className="hidden" id="on-block">
          <div className="pay-line mb-16">
            <div className="pay-select">
              <select>
                <option value="30 ₽">30 ₽</option>
                <option value="50 ₽">50 ₽</option>
                <option value="100 ₽">100 ₽</option>
              </select>
              <span>Пополнять при снижении баланса до</span>
            </div>
          </div>
          <div className="pay-line mb-23 error">
            <div className="pay-input">
              <input type="text" required="required" placeholder=" " />
              <span>Введите сумму </span>
              <div className="reset">
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
            </div>
            <div className="error-message">Обязательное поле</div>
          </div>
          <h5>Контактные данные, для управления автоплатежом</h5>
          <div className="pay-line mb-16 error">
            <div className="pay-input">
              <input type="text" required="required" placeholder=" " />
              <span>Фамилия Имя Отчество</span>
              <div className="reset">
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
            </div>
            <div className="error-message">Обязательное поле</div>
          </div>
          <div className="pay-line mb-32 error">
            <div className="pay-input">
              <input type="text" required="required" placeholder=" " />
              <span>Номер телефона</span>
              <div className="reset">
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
            </div>
            <div className="error-message">Обязательное поле</div>
          </div>
        </div>
      </div>
       */}
        <h5>Отправить чек на Email или на номер телефона</h5>
        <div className={"pay-line mb-16 " + warnAbon}>
          {/*error or valid*/}
          <div className="pay-input">
            <input
              type="text"
              required="required"
              onChange={this.handleUserInput}
              value={abonent}
              placeholder=" "
            />
            <span>Email или номер телефона</span>
            <div className="reset">
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
          </div>
          <div className="error-message">Введите Email или номер телефона.</div>
        </div>

        <div className="pay-line mb-40 ">
          {/*error */}
          <label className="pay-line-checkbox">
            <input
              type="checkbox"
              checked={isCheck}
              onChange={this.handleCheckChange}
            />
            <div className="pay-line-checkbox-icon"></div>
            <span>
              Я подтверждаю, что я ознакомлен(а) и согласен(а) с{" "}
              <a href="/">"Политикой обработки персональных данных"</a>
            </span>
          </label>
          <div className="error-message">Необходимо подтверждение</div>
        </div>
        <div className="pay-send">
          {/* <Button
            name={`Оплатить ${fullSumm} ₽`}
            onClick={this.onClick}
            className={"btn__submit"}
          /> */}
          <input
            type="button"
            onClick={this.onClickBtn}
            value={`Оплатить ${fullSumm} ₽`}
            className={"btn__submit"}
          />
          <div className="pay-send-info">
            <h5>Включая комиссию {percent} ₽</h5>
            <div className="pay-send-info__text">
              Комиссия при оплате банковской <br />
              карты 1%
              <span className="info">
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
                    d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7.89936 12.5C7.65974 12.5 7.44409 12.4209 7.26837 12.2652C7.08466 12.1078 6.99681 11.889 6.99681 11.6078C6.99681 11.3578 7.08466 11.1486 7.26038 10.9776C7.4361 10.8075 7.64377 10.722 7.89936 10.722C8.14697 10.722 8.36262 10.8075 8.53035 10.9776C8.69808 11.1486 8.78594 11.3578 8.78594 11.6078C8.78594 11.8858 8.69808 12.103 8.52236 12.262C8.33866 12.4201 8.13099 12.5 7.89936 12.5ZM5 5.98482C5 5.60863 5.11981 5.22764 5.35943 4.84105C5.60703 4.45447 5.95847 4.13419 6.42173 3.88099C6.88498 3.6278 7.42811 3.5 8.04313 3.5C8.61821 3.5 9.12141 3.60623 9.5607 3.81869C10 4.03035 10.3435 4.31869 10.5831 4.68291C10.8227 5.04792 10.9425 5.44409 10.9425 5.8722C10.9425 6.20927 10.8786 6.50399 10.7348 6.75799C10.599 7.01118 10.4393 7.23003 10.2476 7.41454C10.0639 7.59904 9.72045 7.90895 9.24121 8.34425C9.10543 8.46725 8.99361 8.57508 8.91374 8.66853C8.83387 8.76198 8.76997 8.84665 8.73003 8.92412C8.6901 9.0016 8.65815 9.07907 8.64217 9.15655C8.61821 9.23323 8.58626 9.36901 8.53834 9.5631C8.46645 9.97524 8.23482 10.1813 7.83546 10.1813C7.6278 10.1813 7.45208 10.1142 7.31629 9.97923C7.17252 9.84425 7.10064 9.64457 7.10064 9.37859C7.10064 9.04633 7.15655 8.75799 7.26038 8.51438C7.36422 8.27077 7.5 8.05671 7.66773 7.8722C7.83546 7.6877 8.06709 7.46885 8.35463 7.21565C8.61022 6.99361 8.79393 6.82588 8.90575 6.71326C9.01757 6.59984 9.11342 6.47444 9.19329 6.33546C9.27316 6.19728 9.3131 6.04633 9.3131 5.88419C9.3131 5.56709 9.19329 5.29952 8.95367 5.08147C8.72204 4.86422 8.41853 4.75479 8.04313 4.75479C7.60383 4.75479 7.28435 4.86422 7.07668 5.08466C6.877 5.30431 6.70128 5.62859 6.55751 6.05671C6.42173 6.50399 6.16613 6.72764 5.79073 6.72764C5.56709 6.72764 5.38339 6.64936 5.23163 6.49361C5.07189 6.33706 5 6.16693 5 5.98482Z"
                    fill="#9395A4"
                  />
                </svg>
                <div className="info-block">
                  Вознаграждение, перечисляемое плательщиком, совершающим платеж
                  при помощи банковских карт МИР, VISA или MasterCard с
                  использованием настоящего сайта, за предоставление возможности
                  совершения на сайте финансовых транзакций и обеспечении
                  информационного взаимодействия между участниками расчетов
                  (плательщиком, банком-эквайером, получателем денежных средств,
                  держателем сайта) при обработке совершенного платежа. Совершая
                  платеж, плательщик подтверждает свое добровольное согласие на
                  перечисление сервисного сбора
                </div>
              </span>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default SecondStep;
