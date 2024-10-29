/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-10-22 09:56:41
 * @LastEditTime: 2024-10-28 17:57:23
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
const path = require('path');
const { formidable } = require('formidable');
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

//项目管理-项目列表-查询
router.get('/item/search', checkTokenMiddleware, async (req, res) => {
    const keysArray = Object.keys(req.query)
    const entriesArray = Object.entries(req.query)
    let sql
    if(keysArray.length > 0){
      let conditions = ''
      conditions = entriesArray.map((e)=>{
        return `${e[0]} LIKE '%${e[1]}%'`
      }).join(' AND ')
      sql = `select * from items WHERE ${conditions}` 
  
    }else{
      sql = `select * from items`
    }
    let dataList = await query( sql ) 
    const groupedData = buildTree(dataList);
    if(dataList){
      res.json({
        status:1,
        msg:'请求成功...',
        data:groupedData
        })
    }else{
      res.json({
        status:0,
        msg:'请求失败...',
        })
    }
});
  
//项目管理-项目列表-新增
router.post('/item/add', checkTokenMiddleware, async (req, res) => {
    const { parent_id,name,service_line,base,project_leader,settlement_type,day,
            start_date,delivery_date,delay_date,price,number_people,
            team,auditor,settlement_day,overtime_type,detail } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
  
    const sql = `insert into items(parent_id,name,service_line,base,item_leader,settlement_type,day,
                 start_date,delivery_date,delay_date,price,number_workers,
                 work_team,auditor,settlement_day,overtime_type,detail,create_time)
                 VALUES('${parent_id ? parent_id : ''}','${name}','${service_line}','${base}','${project_leader}','${settlement_type}',
                 '${day}','${start_date}','${delivery_date}','${delay_date}','${price}',
                 '${number_people}','${team}','${auditor}','${settlement_day}','${overtime_type}','${detail}','${time}')`
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
  
//项目管理-项目列表-编辑
router.post('/item/edit', checkTokenMiddleware, async (req, res) => {
    const { edit_id,service_line,item,sex,age,specialty,education,certificate,language_competence,
            ability,work_experience,model_experience,likes,characters } = req.body
            
    const sql = `UPDATE items
                    SET service_line = '${service_line}', item = '${item}', sex = '${sex}',
                    age = '${age}', specialty = '${specialty}', education = '${education}',certificate = '${certificate}',
                    language_competence = '${language_competence}', ability = '${ability}', work_experience = '${work_experience}', 
                    model_experience = '${model_experience}',likes = '${likes}',characters = '${characters}'
                    WHERE id = ${edit_id}`
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

//项目管理-项目列表-删除
router.post('/item/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `delete from items where id = '${id}'`
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

//项目管理-对账列表-查询
router.get('/account/search', checkTokenMiddleware, async (req, res) => {
  const keysArray = Object.keys(req.query)
  const entriesArray = Object.entries(req.query)
  let sql
  if(keysArray.length > 0){
    let conditions = ''
    conditions = entriesArray.map((e)=>{
      return `${e[0]} LIKE '%${e[1]}%'`
    }).join(' AND ')
    sql = `select * from account WHERE ${conditions}` 

  }else{
    sql = `select * from account`
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

//项目管理-对账列表-新增
router.post('/account/add', checkTokenMiddleware, async (req, res) => {
  const { id,name,service_line,base,project_leader,status,settlement_type,settlement_day,
          day,start_date,delivery_date } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')
  const sql = `insert into account(item_id,item_name,service_line,base,
          item_leader,item_status,item_day,item_settlement_type,
          item_settlement_day,item_start_date,item_delivery_date,create_time)
          VALUES('${id}','${name}','${service_line}','${base}','${project_leader}','${status}',
          '${day}','${settlement_type}','${settlement_day}','${start_date}','${delivery_date}','${time}')`
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

//项目管理-对账列表-明细-查询
router.get('/account/detail', checkTokenMiddleware, async (req, res) => {
  const sql = `select * from account_detail where account_id ='${req.query.id}'`
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

//项目管理-对账列表-明细-新增
router.post('/account/detail_add', checkTokenMiddleware, async (req, res) => {
  const { item_settlement_type,account_id,account_day,account_period,tasks,settlement_scale,
          amount,price,sum,is_accept,normal_hour,normal_overtime_hour,week_overtime_hour,
          holidays_overtime_hour,times_overtime_hour15,times_overtime_hour2,times_overtime_hour3} = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')
  const _account_day = moment(account_day).format('YYYY-MM-DD')
  let _account_period_0 = moment(account_period[0]).format('YYYY-MM-DD')
  let _account_period_1 = moment(account_period[1]).format('YYYY-MM-DD')
  let _account_period   = _account_period_0 + '至' + _account_period_1
  const user = req.user.account
  let sql 
  if(item_settlement_type === '计件'){
      sql = `insert into account_detail(account_id,reconciler,account_day,account_period,tasks,
              settlement_scale,amount,price,sum,is_accept,create_time)
              VALUES('${account_id}','${user}','${_account_day}','${_account_period}','${tasks}',
              '${settlement_scale}','${amount}','${price}','${sum}','${is_accept}','${time}')`
  }else{
      sql = `insert into account_detail(account_id,reconciler,account_day,account_period,tasks,
             settlement_scale,normal_hour,normal_overtime_hour,week_overtime_hour,holidays_overtime_hour,
             times_overtime_hour15,times_overtime_hour2,times_overtime_hour3,price,sum,is_accept,create_time)
             VALUES('${account_id}','${user}','${_account_day}','${_account_period}','${tasks}',
             '${settlement_scale}','${normal_hour}','${normal_overtime_hour}','${week_overtime_hour}',
             '${holidays_overtime_hour}','${times_overtime_hour15}','${times_overtime_hour2}','${times_overtime_hour3}',
             '${price}','${sum}','${is_accept}','${time}')`
  }
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

//项目管理-对账列表-附件上传
router.post('/account/detail/upload', checkTokenMiddleware, (req, res) => {
  let id = req.query.id
  //创建form对象
  const form = formidable({
    multiples:true,
    //保存上传的excel文件
    uploadDir:__dirname + '/../public/excel',
    keepExtensions:true
  });
  form.parse(req, async (err, fields, files) => {
    if(err){
      res.json({
        status:3,
        msg:'服务端处理异常',
       })
      return;
    }
    let fileUrl = '/excel/' + files.file[0].newFilename
    let sql = `UPDATE account_detail SET attachment='${fileUrl}' where id='${id}'`
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
});

function buildTree(data) {
  const result = [];
  data.forEach(item => {
      if (!item.parent_id) {
      const newItem = { ...item, children: [] };
      result.push(newItem);
      } else {
      const parent = result.find(parent => parent.id == item.parent_id);
      if (parent) {
          parent.children.push(item);
      }
      }
  });
  return result;
}

module.exports = router;
