const axios = require("axios").default;
const config = require("config");
const iconv = require("iconv-lite");

class GetPrice {
  constructor(card, clienttime, id, pdcode, mindate) {
    this.card = card;
    this.clienttime = clienttime;
    this.id = id;
    this.pdcode = pdcode;
    this.mindate = mindate;
  }

  //проверка карты
  async getPrice() {
    try {
      let xmlBodyStr = `<?xml version="1.0" encoding="windows-1251"?>
        <message>
          <head>
            <api_version>1</api_version>
            <software_version>1</software_version>
            <message_type>GetPrice</message_type>
            <device_type>LK</device_type>
            <terminal_code>${config.get("terminal_code")}</terminal_code>
            <system_code>${config.get("system_code")}</system_code>
            <client_time>${this.clienttime}</client_time>
          </head>
          <body>
            <printnum>${this.card}</printnum>
            <id>${this.id}</id>
            <pdcode>${this.pdcode}</pdcode>
            <date>${this.mindate}</date>
          </body>
        </message>`;

      const res = await axios.post(config.get("url_asop"), xmlBodyStr, {
        responseType: "arraybuffer"
      });
      const resData = iconv.decode(res.data, "win1251");

      this.priceResponse = resData;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = GetPrice;
