const { Router } = require("express");
const { check, validationResult } = require("express-validator");

const CheckCard = require("../controllers/CheckCard");
const GetPrice = require("../controllers/GetPrice");
const PaymentASOP = require("../controllers/PaymentASOP");

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
          message: "Некоректные данные!",
          data: req.body
        });
      }

      const { card, client_time } = req.body;

      const cardUser = new CheckCard(card, client_time);

      await cardUser.getResult();

      //возвращаем на фронт
      res.status(200).json({ data: cardUser.cardResponse });

      //send checkcard
    } catch (e) {
      res.status(500).json({ message: "Что то пошло не так", errors: e });
    }
  }
);

// /getPrice
router.post("/getprice", async (req, res) => {
  try {
    const { client_time, card, id, pdcode, mindate } = req.body;

    const pricesCheck = new GetPrice(card, client_time, id, pdcode, mindate);

    await pricesCheck.getPrice();

    //возвращаем на фронт
    res.status(201).json({ data: pricesCheck.priceResponse });

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

    res.status(200).json({ message: "Сохранили в бд", data: true });
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

    // сохраняем ответ
    await pay.save();

    if (Status == "autorized" || Status == "paid") {
      const paySend = new PaymentASOP(Order_ID);

      await paySend.sendPaymentASOP();

      res
        .status(200)
        .json({ message: "Успешно", data: paySend.paymentResponse });
    }

    res.status(200).json({ message: "Успешно" });

    //возвращаем положительный ответ
  } catch (e) {
    //ошибка
    res.status(500).json({ message: "BAD", error: e });
  }
});

module.exports = router;
