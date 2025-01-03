/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2025-01-02 11:22:34
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');
const md5 = require('md5');

router.get('/search', checkTokenMiddleware, async(req, res) => {
    const { name } = req.query
    let sql
    if(name === undefined || name === ''){
      sql = `select * from user where is_delete = 0`
    }else{
      sql = `select * from user where name='${name}' and is_delete = 0`
    }
    let dataList = await query( sql ) 
    if(dataList){
      res.json({
        status:1,
        msg:'请求成功...',
        data:dataList
        })
    }else{
      res.json({
        status:0,
        msg:'请求失败...',
        })
    }
});

router.post('/add', checkTokenMiddleware, async(req, res) => {
    const { account, name, password, role, department, base, service_line } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const password_md5 = md5(password)
    const roleData = role.map(item => item.split('-')[0]).join(',');
    const s = role[0].split('-')
    const sql = `insert into user(account, password, name, department, base, service_line, role, role_id, create_time, update_time, is_delete)
                 VALUES('${account}','${password_md5}','${name}','${department}','${base}','${service_line}','${roleData}','${s[1]}','${time}','${time}',0)`
    let dataList = await query( sql ) 
    if(dataList){
      res.json({
        status:1,
        msg:'请求成功...',
        })
    }else{
      res.json({
        status:0,
        msg:'请求失败...',
        })
    }
});

router.post('/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE user SET is_delete = 1 where id = '${id}'`
  let dataList = await query( sql ) 
  if(dataList){
    res.json({
      status:1,
      msg:'请求成功...',
      })
  }else{
    res.json({
      status:0,
      msg:'请求失败...',
    })
  }
});

module.exports = router;
