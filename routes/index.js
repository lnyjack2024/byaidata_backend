/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-08-31 20:55:33
 * @LastEditTime: 2024-10-08 18:33:23
 */
var express = require('express');
var router = express.Router();
var db = require('../util/dbconfig');
const md5 = require('md5');
const jwt = require('jsonwebtoken')
const { secret } = require('../config/config')
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//登录
router.post('/login',(req, res) => {
  const { username, password } = req.body
  const password_md5 = md5(password)
  const sql = `select * from user where account='${username}' and password='${password_md5}'`
  //创建当前用户的token
  let token = jwt.sign({ account:username }, secret ,{ expiresIn:60 * 60 * 24 * 7 })
  db(sql,(result)=>{
    if(result.length > 0){
      res.json({
        status:1,
        msg:'请求成功...',
        token:token,
        data:result
       })
    }else{
      res.json({
        status:0,
        msg:'请求失败...',
       })
    }
  });
});

//测试handsontale
// router.get('/test', function(req, res) {
//   const sql = 'select * from handsontale_data'
//   db(sql,(result)=>{
//     // res.send(JSON.stringify(result))
//     res.send(result)
//   });
// });

// router.post('/test/update', parser, function(req, res) {
//   const length = req.body.length
// });

module.exports = router;
