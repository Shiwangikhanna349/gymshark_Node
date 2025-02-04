const express = require("express");
const router = express.Router();

const { orderCheck } = require("../controllers/orderControllers");

router.post("/check", orderCheck);

module.exports = router;