var express = require('express');
var router = express.Router();
var db = require('../util/dbconfig')

/* GET users listing. */
router.get('/', function(req, res, next) {
  db('SELECT * from user',()=>{
      console.log('连接成功...')
  },() => {
    console.log('连接失败...')
  });
  res.send('respond with a resource');
});

module.exports = router;
