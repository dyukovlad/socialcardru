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
        const curUser = currentCardPayment[0];

        const xmlBodyStr = `<?xml version="1.0" encoding="windows-1251"?>
            <message><head>
              <api_version>1</api_version>
              <software_version>1</software_version>
              <message_type>Payment</message_type>
              <device_type>LK</device_type>
              <terminal_code>${config.get("terminal_code")}</terminal_code>
              <system_code>${config.get("system_code")}</system_code>
              <client_time>${curUser.client_time}</client_time>
            </head><body>
            <printnum>${curUser.card}</printnum>
            <id>${curUser.id}</id>
            <pdcode>${curUser.pdcode}</pdcode>
            <type>1</type>
            <date>${curUser.mindate}</date>
              <paydate>${new Date().toISOString()}</paydate>
              <summa>${curUser.summa}</summa>
              <payinfo>${this.Order_ID}</payinfo >
              <payform>1</payform >
              <abonent>${curUser.abonent}</abonent >
              <operator>1</operator >
            </body></message>`;

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
}
module.exports = PaymentASOP;
