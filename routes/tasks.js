/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-10-28 17:59:05
 * @LastEditTime: 2024-11-04 16:52:38
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
const fs   = require('fs')
const path = require('path');
const XLSX = require('xlsx');
const { formidable } = require('formidable');
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

//任务包管理-任务包列表-查询
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

//任务包管理-任务包列表-新增
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

//任务包管理-任务包列表-明细-导入
router.post('/task/upload', checkTokenMiddleware, (req, res) => {
    //创建form对象
    const form = formidable({
      multiples:true,
      //保存上传的excel文件
      uploadDir:__dirname + '/../public/excel',
      keepExtensions:true
    });

    let task_id = req.query.task_id
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    // let user = req.user.account
    let user = '王永红'

    form.parse(req, (err, fields, files) => {
      if(err){
        res.json({
          status:3,
          msg:'服务端处理异常',
         })
        return;
      }
      let originalFilename = files.file[0].originalFilename
      let type = path.extname(originalFilename).slice(1)
      if(type != 'xlsx'){
        res.json({
          status:3,
          msg:'文件类型错误',
         })
         return;
      }
  
      let fileUrl = '../public/excel/' + files.file[0].newFilename
      //如果是图片、保存url:/excel/' + files.file[0].newFilename
      const filePath = path.join(__dirname, fileUrl);
  
      //创建读入流
      let rs = fs.createReadStream(filePath)
      let chunks = [];
      let chunkLength = 0;
      //处理错误
      rs.on('error', (err) => {
        if(err){
          res.json({
            status:3,
            msg:'服务端处理异常',
           })
        }
      });
      rs.on('data',(chunk)=>{
        chunks.push(chunk);
        chunkLength += chunk.length;
      });
      rs.on('end', async () => {
        const buffer = Buffer.concat(chunks, chunkLength);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        let conditions = []
        let val = ''
        let val_keys = ''
        const keysArray = Object.keys(json[0])
        json.map((c)=>{
          conditions.push(`('${task_id}','${c.date}','${c.worker_name}','${c.worker_number}','${c.time_frame}',
                            '${c.work_amount}','${c.completed_amount}','${c.accuracy}','${c.error_amount}','${c.quality_amount}',
                            '${c.rework_amount}','${c.task_hour}','${c.task_no_hour}','${user}','${time}')`)
                          })
        val = conditions.map((e)=>{
          return `${e}`
        })
        val_keys = keysArray.map((e)=>{
          return `${e}`
        }).join(',')
        let sql = `INSERT INTO tasks_detail(task_id,${val_keys},user,create_time) VALUES ${val}`
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
        })
    });
});

//任务包管理-任务包列表-明细-查询
router.get('/task/effect_detail', checkTokenMiddleware, async (req, res) => {
    const sql = `select * from tasks_detail where task_id ='${req.query.id}' ORDER BY id DESC`
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

//任务包管理-任务包列表-编辑
router.post('/task/edit', checkTokenMiddleware, async (req, res) => {
    const { edit_id,workers,detail,get_task_date,delay_date} = req.body
    const sql = `UPDATE tasks
                 SET workers = '${workers}', get_task_date = '${get_task_date}', delay_date = '${delay_date}',
                 detail = '${detail}' WHERE id = ${edit_id}`
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

//任务包管理-任务包列表-删除
router.post('/task/delete', checkTokenMiddleware,async (req, res) => {
    const { id } = req.body
    const sql = `delete from tasks where id = '${id}'`
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

//任务包管理-任务包列表-详情
router.get('/task/detail', checkTokenMiddleware, async (req, res) => {
    const sql = `select * from tasks where id ='${req.query.id}'`
    const sql_ = `select * from tasks_detail where task_id ='${req.query.id}' ORDER BY id DESC`
    const sql_check = `select * from tasks_quality_check where task_id ='${req.query.id}'`

    let dataList = await query( sql_ ) 
    let dataCheckList = await query( sql_check ) 
    let data = await query( sql ) 

    let recently_push_date = dataList[0].create_time
    let frist_push_date = dataList[dataList.length - 1].create_time
    let quality_rejected_number = 0
    let acceptance_rejected_number = 0

    for (const item of dataCheckList) {
      if(item.check_type === '业务方质检'){
        if(item.is_check === '不通过'){
          ++acceptance_rejected_number
        }
      }else{
        if(item.is_check === '不通过'){
          ++quality_rejected_number
        }
      }
    }

    for (const i of data) {
      i.recently_push_date = recently_push_date
      i.frist_push_date = frist_push_date
      i.quality_rejected_number = quality_rejected_number
      i.acceptance_rejected_number = acceptance_rejected_number
    }
    if(data){
      res.json({
        status:1,
        msg:'请求成功...',
        data:data
        })
    }else{
      res.json({
        status:0,
        msg:'请求失败...',
        })
    }
});

//任务包管理-任务包列表-质检
router.get('/task/check', checkTokenMiddleware, async (req, res) => {
    const sql = `select * from tasks_quality_check where task_id ='${req.query.id}' ORDER BY id DESC`
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

//任务包管理-任务包列表-质检-新增
router.post('/task/check_add', checkTokenMiddleware, async (req, res) => {
    const { task_id,date,check_type,is_check } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.user.name
    const sql = `insert into tasks_quality_check(task_id,date,check_type,is_check,user,create_time) 
                 VALUES('${task_id}','${date}','${check_type}','${is_check}','${user}','${time}')`
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