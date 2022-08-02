const express = require("express");
const { User } = require("../models/User");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.payload._id);

    res.status(201).send(_.pick(user, ["_id", "name", "email", "biz"]));
  } catch (error) {
    res.status(400).send("error in get profile");
  }
});

module.exports = router;
