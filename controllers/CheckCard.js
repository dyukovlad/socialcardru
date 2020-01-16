const axios = require("axios").default;
const config = require("config");
const iconv = require("iconv-lite");

class CheckCard {
  constructor(card, clienttime) {
    this.card = card;
    this.clienttime = clienttime;
  }

  //проверка карты
  async getResult() {
    try {
      let xmlBodyStr = `<?xml version="1.0" encoding="windows-1251"?>
        <message>
          <head>
            <api_version>1</api_version>
            <software_version>1</software_version>
            <message_type>CheckCard</message_type>
            <device_type>LK</device_type>
            <terminal_code>${config.get("terminal_code")}</terminal_code>
            <system_code>${config.get("system_code")}</system_code>
            <client_time>${this.client_time}</client_time>
          </head>
          <body>
            <printnum>${this.card}</printnum>
            <type>1</type>
          </body>
        </message>`;

      const res = await axios.post(config.get("url_asop"), xmlBodyStr, {
        responseType: "arraybuffer"
      });
      const resData = iconv.decode(res.data, "win1251");

      this.cardResponse = resData;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = CheckCard;
