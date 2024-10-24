/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2024-10-22 10:10:20
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

//配置管理-业务线-查询
router.get('/serviceline/search', checkTokenMiddleware, async(req, res) => {
    const sql = `select * from service_line`
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
    const sql = `insert into service_line (name,create_time) VALUES('${name}','${time}')`
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
  const sql = `delete from service_line where id = '${id}'`
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
