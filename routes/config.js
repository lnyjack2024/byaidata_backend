/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2025-01-03 17:22:32
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

//配置管理-业务线-查询
router.get('/serviceline/search', checkTokenMiddleware, async(req, res) => {
    const { role, service_line } = req.user
    let sql = ''
    //基地业务负责人,业务负责人
    if(role === '基地业务负责人,业务负责人'){
      sql = `select * from service_line where name = '${service_line}' and is_delete = '0'`
    //基地业务负责人
    }else if(role === '基地业务负责人'){
      sql = `select * from service_line where 1=2`
    //业务负责人  
    }else if(role === '业务负责人'){
      sql = `select * from service_line where name = '${service_line}' and is_delete = '0'`
    }else{
      sql = `select * from service_line where is_delete = '0'`
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

//配置管理-业务线-新增
router.post('/serviceline/add', checkTokenMiddleware, async(req, res) => {
    const { name } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.user.name
    const sql = `insert into service_line (name, user, is_delete, create_time) VALUES('${name}','${user}','0','${time}')`
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

//配置管理-业务线-删除
router.post('/serviceline/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE service_line SET is_delete = '1' where id = '${id}'`
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

//配置管理-基地-查询
router.get('/base/search', checkTokenMiddleware, async(req, res) => {
    const { role, base } = req.user
    let sql = ''
    //基地业务负责人,业务负责人
    if(role === '基地业务负责人,业务负责人'){
       sql = `select * from base where name = '${base}' and is_delete = '0'`
    //基地业务负责人
    }else if(role === '基地业务负责人'){
      sql = `select * from base where name = '${base}' and is_delete = '0'`
    //业务负责人
    }else if(role === '业务负责人'){
      sql = `select * from base where 1=2`
    }else{
       sql = `select * from base where is_delete = '0'`
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

//配置管理-基地-新增
router.post('/base/add', checkTokenMiddleware, async(req, res) => {
    const { name } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.user.name
    const sql = `insert into base (name, user, is_delete, create_time) VALUES('${name}','${user}','0','${time}')`
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

//配置管理-基地-删除
router.post('/base/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE base SET is_delete = '1' where id = '${id}'`
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

//配置管理-结算类型-查询
router.get('/settlement_type/search', checkTokenMiddleware, async(req, res) => {
    const sql = `select * from settlement_type where is_delete = '0'`
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

//配置管理-结算类型-新增
router.post('/settlement_type/add', checkTokenMiddleware, async(req, res) => {
    const { name } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.user.name
    const sql = `insert into settlement_type (name, user, is_delete, create_time) VALUES('${name}','${user}','0','${time}')`
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

//配置管理-结算类型-删除
router.post('/settlement_type/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE settlement_type SET is_delete = '1' where id = '${id}'`
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

//配置管理-加班类型-查询
router.get('/overtime_type/search', checkTokenMiddleware, async(req, res) => {
    const sql = `select * from overtime_type where is_delete = '0'`
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

//配置管理-加班类型-新增
router.post('/overtime_type/add', checkTokenMiddleware, async(req, res) => {
    const { name } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.user.name
    const sql = `insert into overtime_type (name, user, is_delete, create_time) VALUES('${name}','${user}','0','${time}')`
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

//配置管理-加班类型-删除
router.post('/overtime_type/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE overtime_type SET is_delete = '1' where id = '${id}'`
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

//配置管理-交付要求-查询
router.get('/delivery_requirement/search', checkTokenMiddleware, async(req, res) => {
    const sql = `select * from delivery_requirement where is_delete = '0'`
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

//配置管理-交付要求-新增
router.post('/delivery_requirement/add', checkTokenMiddleware, async(req, res) => {
    const { name } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.user.name
    const sql = `insert into delivery_requirement (name, user, is_delete, create_time) VALUES('${name}','${user}','0','${time}')`
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

//配置管理-交付要求-删除
router.post('/delivery_requirement/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE delivery_requirement SET is_delete = '1' where id = '${id}'`
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

//操作日志-查询
router.get('/logs/log', checkTokenMiddleware, async(req, res) => {
  const { url, date } = req.query
  let sql = ''
  // if(date === undefined || date === ''){

  // }else{
  //   const start_time = moment(date[0]).format('YYYY-MM-DD HH:mm:ss')
  //   const end_time   = moment(date[1]).format('YYYY-MM-DD HH:mm:ss')
  //   sql = `select * from logs WHERE create_time BETWEEN '${start_time}' AND '${end_time}'`
  // }
  if(url === undefined || url === ''){
    sql = `select * from logs ORDER BY id DESC`
  }else{
    sql = `select * from logs WHERE url='${url}'`
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

module.exports = router;
