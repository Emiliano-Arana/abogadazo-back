var express = require('express');
var router = express.Router();
const pruebaController = require("../controllers/usuarioController");
/* GET home page. */
router.get('/', pruebaController.index);

module.exports = router;
