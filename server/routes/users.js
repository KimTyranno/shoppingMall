const express = require("express");
const router = express.Router();
const { User } = require("../models/User");

const { auth } = require("../middleware/auth");
const { Product } = require("../models/Product");
const { Payment } = require("../models/Payment");
const async = require("async");
//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
    cart: req.user.cart,
    history: req.user.history,
  });
});

router.post("/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failed, email not found",
      });

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "Wrong password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        res.cookie("w_authExp", user.tokenExp);
        res.cookie("w_auth", user.token).status(200).json({
          loginSuccess: true,
          userId: user._id,
        });
      });
    });
  });
});

router.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: "", tokenExp: "" },
    (err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

router.post("/addToCart", auth, (req, res) => {
  // user Collection에서 해당 유저의 정보를 가져옴
  // req.user._id를 가져올 수 있는이유는 auth에서 유저정보를 넣어줬기때문임
  // auth를 통과하는순간 req에 유저를 사용할 수 있게됨 (auth.js 참고)
  User.findOne({ _id: req.user._id }, (err, userInfo) => {
    // 가져온 정보에서 카드에 넣으려하는 상품이 이미 들어있는지 확인
    let duplicate = false;
    userInfo.cart.forEach((item) => {
      if (item.id === req.body.productId) {
        duplicate = true;
      }
    });

    //상품이 이미 존재하는경우
    if (duplicate) {
      // 데이터를 하나 찾아서 업데이트시킴
      User.findOneAndUpdate(
        // _id: req.user._id로 유저를 찾고
        // "cart.id": req.body.productId로 해당유저의 카트안에 있는 상품을 찾음
        { _id: req.user._id, "cart.id": req.body.productId },
        // 해당 상품의 수량을 1씩 increment 시킴
        { $inc: { "cart.$.quantity": 1 } },
        // 업데이트를 하고나서 업데이트된 정보를 받으려면 new:true 라는 옵션을 줘야한다.
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(400).json({ success: false, err });
          res.status(200).send(userInfo.cart);
        }
      );
    } else {
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          // DB에 있는 카트에 push 시킨다.
          $push: {
            // 그 카트에는 id, quantity, date를 넣어준다는뜻
            cart: { id: req.body.productId, quantity: 1, date: Date.now() },
          },
        },
        { new: true },
        (err, userInfo) => {
          if (err) return res.status(400).json({ success: false, err });
          res.status(200).send(userInfo.cart);
        }
      );
    }
  });
});

router.get("/removeFromCart", auth, (req, res) => {
  console.log(req);
  // 먼저 cart에서 지우려고하는 상품을 지워준다.
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { cart: { id: req.query.id } } },
    { new: true },
    (err, userInfo) => {
      let cart = userInfo.cart;
      let array = cart.map((item) => {
        return item.id;
      });

      Product.find({ _id: { $in: array } })
        .populate("writer")
        .exec((err, productInfo) => {
          return res.status(200).json({
            productInfo,
            cart,
          });
        });
    }
  );

  // product collection에서 현재 남아있는 상품들의 정보를 가져옴
});
router.post("/successBuy", auth, (req, res) => {
  // 1. User collection 안에 history필드 안에 간단한 결제정보를 넣어줌
  let history = [];
  let transactionData = {};

  req.body.cartDetail.forEach((item) => {
    history.push({
      dateOfPurchase: Date.now(),
      name: item.title,
      id: item._id,
      price: item.price,
      quantity: item.quantity,
      paymentId: req.body.paymentData.paymentId,
    });
  });

  // 2. payment collcection 안에 자세한 결제정보를 넣어줌
  transactionData.user = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };

  transactionData.data = req.body.paymentData;
  transactionData.product = history;

  // history 정보를 저장
  User.findOneAndUpdate(
    { id: req.user._id },
    { $push: { history: history }, $set: { cart: [] } },
    { new: true },
    (err, user) => {
      if (err) return res.json({ success: false, err });

      // payment에다 transactionData정보를 저장
      const payment = new Payment(transactionData);
      payment.save((err, doc) => {
        if (err) return res.json({ success: false, err });

        // 3. product collection 안에 있는 sold필드 정보를 업데이트해줌

        //상품당 몇개의 quantity를 샀는지
        let products = [];
        doc.product.forEach((item) => {
          products.push({ id: item.id, quantity: item.quantity });
        });

        async.eachSeries(
          products,
          (item, callback) => {
            Product.update(
              { _id: item.id },
              { $inc: { sold: item.quantity } },
              { new: false },
              callback
            );
          },
          (err) => {
            if (err) return res.status(400).json({ success: false, err });
            res.status(200).json({
              success: true,
              cart: user.cart,
              cartDetail: [],
            });
          }
        );
      });
    }
  );
});
module.exports = router;
