/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-08-31 20:55:33
 * @LastEditTime: 2024-11-18 13:20:40
 */
var express = require('express');
var router = express.Router();
const { query } = require('../util/dbconfig');
const md5 = require('md5');
const jwt = require('jsonwebtoken')
const { secret } = require('../config/config')
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//登录
router.post('/login',async (req, res) => {
  const { username, password } = req.body
  const _sql = `select name from user where account='${username}'`
  let _dataList = await query( _sql ) 
  let name = _dataList[0].name
  const password_md5 = md5(password)
  const sql = `select * from user where account='${username}' and password='${password_md5}'`
  //创建当前用户的token
  let token = jwt.sign({ account:username, name:name }, secret ,{ expiresIn:60 * 60 * 24 * 7 })
  let dataList = await query( sql ) 
  if(dataList.length > 0){
    res.json({
      status:1,
      msg:'请求成功...',
      token:token,
      data:dataList
      })
  }else{
    res.json({
      status:0,
      msg:'请求失败...',
    })
  }
});

module.exports = router;
