const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Product } = require("../models/Product");
//=================================
//             Product
//=================================

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

var upload = multer({ storage: storage }).single("file");

// index.js부분에서 이미 /api/product의 경로로 들어왔기때문에 그 뒤의 경로만 있으면됨
router.post("/", (req, res) => {
  // 받아온 정보를 DB에 넣어줌
  const product = new Product(req.body);
  product.save((err) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    }
    return res.status(200).json({ success: true });
  });
});

router.post("/products", (req, res) => {
  // 끝에 100은 의미없는듯하다
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let term = req.body.searchTerm;
  let findArgs = {};
  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          // $gte greater than equals 몽고DB에서 사용하는거임
          $gte: req.body.filters[key][0],
          // $lte less than equals
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  console.log("arg = ", findArgs);
  if (term) {
    Product.find(findArgs)
      .find({ $text: { $search: term } })
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, productInfo) => {
        if (err) {
          return res.status(400).json({ success: false, err });
        }
        return res
          .status(200)
          .json({ success: true, productInfo, postSize: productInfo.length });
      });
  } else {
    // product collection에 있는 모든상품정보 가져오기
    // populate("writer")를 해줌으로써 작성자의 정보를 가져올 수 있음
    Product.find(findArgs)
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, productInfo) => {
        if (err) {
          return res.status(400).json({ success: false, err });
        }
        return res
          .status(200)
          .json({ success: true, productInfo, postSize: productInfo.length });
      });
  }
});

router.get("/products_by_id", (req, res) => {
  // 쿼리를 이용하여 가져올땐 req.query를 사용해야한다.
  let type = req.query.type;
  let productIds = req.query.id;

  if (type === "array") {
    // 상품이 여러개 올때는 id=aaa1,bbb1,ccc1 이런식으로 오니까
    // ['aaa1','bbb1','ccc1'] 이런식으로 바꾸는 작업임
    let ids = req.query.id.split(",");
    productIds = ids.map((item) => {
      return item;
    });
  }
  // productId를 이용하여 DB에 검색함
  // ${in}은 배열을 파라미터로 보낼때 사용하는듯 하다
  Product.find({ _id: { $in: productIds } })
    .populate("writer")
    .exec((err, product) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(product);
    });
});

router.post("/image", (req, res) => {
  // 가져온 이미지를 저장해줌

  upload(req, res, (err) => {
    if (err) {
      return req.json({ success: false, err });
    }

    // res.req.file.path 와 다른가? == 같다
    return res.json({
      success: true,
      filePath: req.file.path,
      fileName: req.file.filename,
    });
  });
});
module.exports = router;
