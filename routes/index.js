/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-08-31 20:55:33
 * @LastEditTime: 2025-01-02 14:28:45
 */
var express = require('express');
var router = express.Router();
const { query } = require('../util/dbconfig');
const md5 = require('md5');
const jwt = require('jsonwebtoken')
const { secret } = require('../config/config')
const moment = require('moment')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//登录
router.post('/login',async (req, res) => {
  const { username, password } = req.body
  const _sql = `select name,role,base,service_line from user where account='${username}' and is_delete = 0`
  const time = moment().format('YYYY-MM-DD HH:mm:ss');
  let _dataList = await query( _sql ) 
  if( _dataList.length === 0){
    return res.json({
      status:0,
      msg:'账号不存在...',
    })
  }else if( _dataList.length > 0 ){
    let name = _dataList[0]?.name
    let role = _dataList[0]?.role
    let base = _dataList[0]?.base
    let service_line = _dataList[0]?.service_line
    let token = jwt.sign({ account : username, name : name, role : role, base : base, service_line : service_line  }, 
                           secret, 
                         { expiresIn : 60 * 60 * 24 * 7 })
    const password_md5 = md5(password)
    const sql = `select * from user where account='${username}' and password='${password_md5}'`
    await query( `insert into logs (url, date, user, create_time) 
        VALUES('/login','${username}','${name}','${time}')` 
    ) 
    let dataList = await query( sql ) 
    if(dataList.length > 0){
      return res.json({
        status:1,
        msg:'请求成功...',
        token:token,
        data:dataList
      })
    }else{
      return res.json({
        status:0,
        msg:'账号密码错误...',
      })
    }
  }
});

module.exports = router;
