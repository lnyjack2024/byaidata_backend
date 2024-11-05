/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-10-28 17:59:05
 * @LastEditTime: 2024-11-05 14:42:54
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
const fs = require('fs')
const path = require('path');
const XLSX = require('xlsx');
const { formidable } = require('formidable');
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

//财务管理-结算列表-查询
router.get('/settle/search', checkTokenMiddleware, async (req, res) => {
    const keysArray = Object.keys(req.query)
    const entriesArray = Object.entries(req.query)
    let sql
    if(keysArray.length > 0){
      let conditions = ''
      conditions = entriesArray.map((e)=>{
        return `${e[0]} LIKE '%${e[1]}%'`
      }).join(' AND ')
      sql = `select * from settle WHERE ${conditions}` 
  
    }else{
      sql = `select * from settle`
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