/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-10-22 09:56:41
 * @LastEditTime: 2024-10-23 13:56:24
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
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
  
    const sql = `insert into items(parent_id,name,service_line,base,project_leader,settlement_type,day,
                 start_date,delivery_date,delay_date,price,number_people,
                 team,auditor,settlement_day,overtime_type,detail,create_time)
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
  const { parent_id,name,service_line,base,project_leader,settlement_type,day,
          start_date,delivery_date,delay_date,price,number_people,
          team,auditor,settlement_day,overtime_type,detail } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')

  const sql = `insert into account(parent_id,name,service_line,base,project_leader,settlement_type,day,
               start_date,delivery_date,delay_date,price,number_people,
               team,auditor,settlement_day,overtime_type,detail,create_time)
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
