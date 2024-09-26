/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-08-31 20:55:33
 * @LastEditTime: 2024-09-26 10:08:41
 */
var express = require('express');
var router = express.Router();
// const db = require('../db/db')
var db = require('../util/dbconfig')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res) {
  const sql = 'select * from user'
  db(sql,(result)=>{
    // res.send(JSON.stringify(result))
    res.send(result)
  });
  // res.setHeader('Access-Control-Allow-Origin','http://localhost:3000')
});

module.exports = router;
