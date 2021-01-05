const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'soundpicker-server' });
});

router.use('/main', require('./main'));
router.use('/test', require('./test'));
router.use('/user', require('./user'));

module.exports = router;
