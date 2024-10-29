/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-10-28 17:59:05
 * @LastEditTime: 2024-10-29 11:15:50
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
const path = require('path');
const { formidable } = require('formidable');
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

//项目管理-项目列表-查询
router.get('/task/search', checkTokenMiddleware, async (req, res) => {
    const keysArray = Object.keys(req.query)
    const entriesArray = Object.entries(req.query)
    let sql
    if(keysArray.length > 0){
      let conditions = ''
      conditions = entriesArray.map((e)=>{
        return `${e[0]} LIKE '%${e[1]}%'`
      }).join(' AND ')
      sql = `select * from tasks WHERE ${conditions}` 
  
    }else{
      sql = `select * from tasks`
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

//项目管理-项目列表-新增
router.post('/task/add', checkTokenMiddleware, async (req, res) => {
    const { name,service_line,base,item,amount,day,item_leader,business_leader,
            item_manager,item_supervisor,group_manager,trainer,work_team,workers,
            delivery_requirement,settlement_type,business_price,price,attendance_type,
            start_date,end_date,delivery_date,salary_structure,detail } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
  
    const sql = `insert into tasks(name,service_line,base,item,amount,day,item_leader,business_leader,
                 item_manager,item_supervisor,group_manager,trainer,work_team,workers,
                 delivery_requirement,settlement_type,business_price,price,attendance_type,
                 start_date,end_date,delivery_date,salary_structure,detail,create_time)
                 VALUES('${name}','${service_line}','${base}','${item}','${amount}','${day}',
                 '${item_leader}','${business_leader}','${item_manager}','${item_supervisor}',
                 '${group_manager}','${trainer}','${work_team}','${workers}','${delivery_requirement}',
                 '${settlement_type}','${business_price}','${price}','${attendance_type}','${start_date}',
                 '${end_date}','${delivery_date}','${salary_structure}',
                 '${detail}','${time}')`
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