const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema(
  {
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      maxlength: 50,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
      default: [],
    },
    sold: {
      type: Number,
      maxlength: 100,
      default: 0,
    },
    continents: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// title와 description을 메인으로 검색하는데, title쪽을 더 중점적으로 검색한다는뜻
productSchema.index(
  {
    title: "text",
    description: "text",
  },
  {
    weights: {
      title: 5,
      description: 1,
    },
  }
);
const Product = mongoose.model("Product", productSchema);
module.exports = { Product };
