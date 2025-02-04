const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();
const emailRoutes = require("./routes/emailRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dataRoutes=require("./routes/dataRoutes");


const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post("/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      ...req.body,
      amount: req.body.amount * 100,
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).send("Error");
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

app.post("/order/validate", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Ensure required fields are present
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ msg: "Missing required fields!" });
    }
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    const data = `${razorpay_order_id}|${razorpay_payment_id}`;
    sha.update(data);
    const generatedSignature = sha.digest("hex");
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }
    res.json({
      msg: "success",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Error validating Razorpay signature:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});



app.use("/order", orderRoutes);
app.use("/email", emailRoutes);
app.use("/data",dataRoutes)

app.get("/", (req, res) => {
  res.send("working");
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
