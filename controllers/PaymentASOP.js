const axios = require("axios").default;
const config = require("config");
const iconv = require("iconv-lite");

const User = require("../models/User");
const Pay = require("../models/Pay");

class PaymentASOP {
  constructor(Order_ID) {
    this.Order_ID = Order_ID;
  }

  async sendPaymentASOP() {
    try {
      const currentCardPayment = await User.findOne({ id: this.Order_ID });

      if (currentCardPayment) {
        const curUser = currentCardPayment;

        const xmlBodyStr = `<?xml version="1.0" encoding="windows-1251"?>
            <message><head>
              <api_version>1</api_version>
              <software_version>1</software_version>
              <message_type>Payment</message_type>
              <device_type>LK</device_type>
              <terminal_code>${config.get("terminal_code")}</terminal_code>
              <system_code>${config.get("system_code")}</system_code>
              <client_time>${this.getTimeStamp(
                curUser.client_time
              )}</client_time>
            </head><body>
            <printnum>${curUser.card}</printnum>
            <id>${curUser.id}</id>
            <pdcode>${curUser.pdcode}</pdcode>
            <type>1</type>
            <date>${this.getFormatDate(curUser.mindate)}</date>
              <paydate>${this.getTimeStamp(new Date())}</paydate>
              <summa>${curUser.summa * 100}</summa>
              <payinfo>${this.Order_ID}</payinfo >
              <payform>1</payform >
              <abonent>${curUser.abonent}</abonent >
              <operator>1</operator >
            </body></message>`;

        console.log(xmlBodyStr);

        // return;
        const res = await axios.post(config.get("url_asop"), xmlBodyStr, {
          responseType: "arraybuffer"
        });

        const resPayment = iconv.decode(res.data, "win1251");

        this.paymentResponse = resPayment;
      }
    } catch (e) {
      console.log(e);
    }
  }

  getTimeStamp = val => {
    const now = new Date(val);
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
  getFormatDate = val => {
    const now = new Date(val);
    return (
      now.getFullYear() +
      "-" +
      (now.getMonth() < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1) +
      "-" +
      (now.getDate() < 10 ? "0" + now.getDate() : now.getDate())
    );
  };
}
module.exports = PaymentASOP;
