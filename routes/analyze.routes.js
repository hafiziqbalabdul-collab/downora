const router = require("express").Router();
const { analyze } = require("../controllers/analyze.controller");

router.post("/", analyze);

module.exports = router;
