var express = require('express');
var router = express.Router();

/* GET newuser page. */
router.get('/', function(req, res, next) {
  res.render('newuser', { title: 'Ny bruker' });
});

module.exports = router;
