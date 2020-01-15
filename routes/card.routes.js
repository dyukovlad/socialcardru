const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const iconv = require("iconv-lite");
const config = require("config");
const axios = require("axios").default;
const User = require("../models/User");
const Pay = require("../models/Pay");

const router = Router();

//2336329873
// /api/card
// checkCard
router.post(
  "/",
  [
    check("card")
      .isLength({ min: 10 })
      .withMessage("Минимум 10 цифр")
      .matches(/\d/)
      .withMessage("Только цифры")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Некоректные данные",
          data: req.body
        });
      }

      const { card, client_time } = req.body;

      let xmlBodyStr = `<?xml version="1.0" encoding="windows-1251"?>
        <message>
          <head>
            <api_version>1</api_version>
            <software_version>1</software_version>
            <message_type>CheckCard</message_type>
            <device_type>LK</device_type>
            <terminal_code>${config.get("terminal_code")}</terminal_code>
            <system_code>${config.get("system_code")}</system_code>
            <client_time>${client_time}</client_time>
          </head>
          <body>
            <printnum>${card}</printnum>
            <type>1</type>
          </body>
        </message>`;

      let body = await axios
        .post(config.get("url_asop"), xmlBodyStr, {
          responseType: "arraybuffer"
        })
        .catch(err => {
          res.status(500).json(err);
        });

      let responseData = iconv.decode(body.data, "win1251");
      console.log(xmlBodyStr);
      console.log("--------------------------");
      console.log(responseData);
      //возвращаем на фронт
      res.status(201).json({ data: responseData });

      //send checkcard
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так" });
    }
  }
);

// /getPrice
router.post("/getprice", async (req, res) => {
  try {
    const { client_time, card, id, pdcode, mindate } = req.body;

    let xmlBodyStr = `<?xml version="1.0" encoding="windows-1251"?>
    <message>
      <head>
        <api_version>1</api_version>
        <software_version>1</software_version>
        <message_type>GetPrice</message_type>
        <device_type>LK</device_type>
        <terminal_code>${config.get("terminal_code")}</terminal_code>
        <system_code>${config.get("system_code")}</system_code>
        <client_time>${client_time}</client_time>
      </head>
      <body>
        <printnum>${card}</printnum>
        <id>${id}</id>
        <pdcode>${pdcode}</pdcode>
        <date>${mindate}</date>
      </body>
    </message>`;

    let body = await axios
      .post(config.get("url_asop"), xmlBodyStr, {
        responseType: "arraybuffer"
      })
      .catch(err => {
        res.status(500).json(err);
      });

    let responseData = iconv.decode(body.data, "win1251");

    console.log("GetPriceResponce");
    console.log(xmlBodyStr);
    console.log("--------------------------");
    console.log(responseData);

    //возвращаем на фронт
    res.status(201).json({ data: responseData });

    //send checkcard
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так" });
  }
});

//записываем в бд
router.post("/payment", async (req, res) => {
  try {
    const {
      client_time,
      card,
      id,
      pdcode,
      mindate,
      summa,
      abonent,
      signature
    } = req.body;

    const user = new User({
      client_time,
      card,
      id,
      pdcode,
      mindate,
      summa,
      abonent,
      signature
    });
    // сохраняем в бд
    await user.save();

    res.status(201).json({ message: "Сохранили в бд", data: true });
  } catch (e) {
    res.status(500).json({ message: "Что то пошло не так", data: e });
  }
});

// /payresponce
// Order_ID —номер заказа;
// Status — статус (authorized, paid, canceled);
// Signature
router.post("/payresponse", async (req, res) => {
  try {
    const { Order_ID, Status, Signature } = req.body;

    const pay = new Pay({
      Status,
      Order_ID,
      Signature
    });

    await pay.save();
    res.status(200).json({ message: "Сохранили" });

    sendToASOP(Status, Order_ID);

    //возвращаем положительный ответ
  } catch (e) {
    //ошибка
    res.status(500).json({ message: "BAD" });
  }
});

async function sendToASOP(Status, Order_ID) {
  if (Status == "autorized" || Status == "paid") {
    const currentCardPayment = await User.find({ id: Order_ID });
    console.log(currentCardPayment[0]);

    if (currentCardPayment) {
      //1) сохраняем все переменные
      let curUser = currentCardPayment[0];
      //2) отправляем
      let xmlBodyStr = `<?xml version="1.0" encoding="windows-1251"?>
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
    <date>${date}</date>
      <paydate>${new Date().toISOString()}</paydate>
      <summa>${curUser.summa}</summa>
      <payinfo>${Order_ID}</payinfo >
      <payform>1</payform >
      <abonent>${curUser.abonent}</abonent >
      <operator>1</operator >
    </body></message>`;

      let body = await axios
        .post(config.get("url_asop"), xmlBodyStr, {
          responseType: "arraybuffer"
        })
        .catch(err => {
          res.status(500).json(err);
        });

      let responseData = iconv.decode(body.data, "win1251");

      console.log(responseData);

      //возвращаем на фронт
      res.status(201).json({ data: responseData });
    }
  } else {
    res.status(500).json({ message: "BAD" });
  }
}

module.exports = router;
