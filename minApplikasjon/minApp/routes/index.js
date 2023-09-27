var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Terjes App',
    undertitle: 'Dette er min nye side' 
  });
});

module.exports = router;
