/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-10-28 17:59:05
 * @LastEditTime: 2025-05-12 14:12:05
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
const { closeDelimiter } = require('ejs');
// const client = require('../util/oss_detail')
// const multer = require("multer");
// const OSS = require("ali-oss");

//配置Multer用于文件上传
// const upload = multer({ dest: "uploads/" });

//配置阿里云OSS客户端
// const client = new OSS({
// });

//任务包管理-任务包列表-查询
router.get('/task/search', checkTokenMiddleware, async (req, res) => {
  //根据不同的字段、sql拼接OR或者AND
  const keysArray    = Object.keys(req.query); // 获取请求中的查询参数的键
  const entriesArray = Object.entries(req.query); // 获取请求中的键值对
  let sql;
  if (keysArray.length > 0) {
    //定义字段与逻辑的对应规则
    const logicRules = {
      base: 'OR', 
      service_line: 'OR', 
    };
    let orConditions = []; // 存储需要用OR连接的条件
    let andConditions = []; // 存储需要用AND连接的条件
    //遍历entriesArray，根据字段规则分组
    entriesArray.forEach(([key, value]) => {
      const operator = logicRules[key] || 'AND'; // 如果字段未定义规则，默认使用 AND
      const condition = `${key} LIKE '%${value}%'`;
      if (operator === 'OR') {
        orConditions.push(condition); // 添加到OR条件组
      } else {
        andConditions.push(condition); // 添加到AND条件组
      }
    });
    //拼接OR和AND条件
    let conditions = '';
    if (orConditions.length > 0) {
      conditions += `(${orConditions.join(' OR ')})`; // 用括号包裹OR条件
    }
    if (andConditions.length > 0) {
      conditions += `${conditions ? ' AND ' : ''}${andConditions.join(' AND ')}`; // 添加 AND 条件
    }
    //拼接最终SQL
    sql = `SELECT * FROM tasks WHERE ${conditions}`;
  }else{
    //如果没有查询条件，返回默认查询
    sql = `SELECT * FROM tasks`;
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

//任务包列表-查询
router.get('/task/search_', checkTokenMiddleware, async (req, res) => {
    const { item_name } = req.query
    let sql = `select id,name from tasks where item = '${item_name}'`
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
    const { name,item,service_line,base,amount,month,day,hour,business_leader,
            item_manager,group_manager,work_team,workers,delivery_requirement,settlement_type,
            business_price,price,attendance_type,start_date,end_date,delivery_date,salary_structure,detail } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const user = req.user.name

    const sql = `insert into tasks(name,item,service_line,base,status,is_delivery,amount,month,day,hour,business_leader,
                 item_manager,group_manager,work_team,workers,delivery_requirement,settlement_type,business_price,price,attendance_type,
                 start_date,end_date,delivery_date,salary_structure,detail,user,create_time)
                 VALUES('${name}','${item}','${service_line}','${base}','未完成','否','${amount}','${month}','${day}','${hour}',
                 '${business_leader}','${item_manager}','${group_manager}','${work_team}','${workers}','${delivery_requirement}',
                 '${settlement_type}','${business_price}','${price}','${attendance_type}','${start_date}',
                 '${end_date}','${delivery_date}','${salary_structure}','${detail}','${user}','${time}')`

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

//任务包管理-每日作业数据-新增
router.post('/task/day_add', checkTokenMiddleware, async (req, res) => {
  let _data   = req.body.data
  let item    = req.body.item
  let base    = req.body.base
  let task_id = req.body.task_id
  const time  = moment().format('YYYY-MM-DD HH:mm:ss')
  const user  = req.user.name
  let arr = []
  for (const row of _data) {
    if (row[0] !== null) {
      const newRow = row.map(val => val === null ? `''` : `'${val}'`);
      newRow.push(`'${task_id}'`,`'${item}'`,`'${(parseFloat(row[4]) - parseFloat(row[7])) / parseFloat(row[4])}'`, `'${base}'`, `'${user}'`, `'${time}'`);
      arr.push(newRow);
    }
  }

  const val = arr.map((e)=>{
    return `(${e})` 
  }).join(',')

  const sql = ` insert into tasks_day(date,time_frame,worker_name,work_amount,
                  completed_amount,quality_amount,spot_check_amount,
                  error_amount,task_hour,task_no_hour,task_no_hour_detail,
                  overtime,item_timeliness,task_id,item,accuracy,base,user,create_time)
                VALUES ${val}`
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
router.post('/task/upload', checkTokenMiddleware, async(req, res) => {
    //文件上传oss
    // const file = req.file;
    const user = req.user.name
    // const now = new Date();
    // const formattedDate = now.toISOString().slice(0, 10);
    // const filePath = path.resolve(file.path); //文件路径
    // const ossFileName = `uploads/${formattedDate}-${user}-${file.originalname}`; //OSS文件路径
    // try {
    //   //上传到阿里云OSS
    //   const result = await client.put(ossFileName, filePath);
    //   //删除本地临时文件
    //   fs.unlinkSync(filePath);
    //   res.json({
    //     status:1,
    //     msg:'请求成功...',
    //     url: result.url,
    //   });
    // }catch(error){
    //   console.log('上传oss失败' + error)
    //   res.json({
    //     status:0,
    //     msg:error,
    //   })
    // }

    // 创建form对象
    const form = formidable({
      multiples:true,
      //保存上传的excel文件
      uploadDir:__dirname + '/../uploads',
      keepExtensions:true
    });
    let task_id = req.query.task_id
    let time = moment().format('YYYY-MM-DD HH:mm:ss')
    form.parse(req, (err, fields, files) => {
      if(err){
        res.json({
          status:3,
          msg:'服务端处理异常',
         })
        return;
      }
      // let originalFilename = files.file[0].originalFilename
      // let type = path.extname(originalFilename).slice(1)
      // if(type != 'xlsx'){
      //   res.json({
      //     status:3,
      //     msg:'文件类型错误',
      //    })
      //    return;
      // }
      let fileUrl = '/../uploads/' + files.file[0].newFilename
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
          //删除上传的文件
          fs.unlinkSync(filePath);
          res.json({
            status:1,
            msg:'请求成功...',
          });
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
    const sql = `select * from tasks_day where task_id ='${req.query.id}' ORDER BY id DESC`
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
    const { edit_id,name,item,service_line,base,amount,month,day,hour,business_leader,
            item_manager,group_manager,work_team,workers,delivery_requirement,settlement_type,
            business_price,price,attendance_type,start_date,end_date,delivery_date,salary_structure,
            is_delivery,detail,get_task_date,delay_date } = req.body
    const sql = `UPDATE tasks
                 SET 
                  name                 = '${name}', 
                  item                 = '${item}', 
                  service_line         = '${service_line}', 
                  base                 = '${base}',
                  amount               = '${amount}',
                  month                = '${month}',
                  day                  = '${day}',
                  hour                 = '${hour}',
                  business_leader      = '${business_leader}',
                  item_manager         = '${item_manager}',
                  group_manager        = '${group_manager}',
                  work_team            = '${work_team}',
                  workers              = '${workers}',
                  delivery_requirement = '${delivery_requirement}',
                  settlement_type      = '${settlement_type}',
                  business_price       = '${business_price}',
                  price                = '${price}',
                  attendance_type      = '${attendance_type}',
                  start_date           = '${start_date}',
                  end_date             = '${end_date}',
                  delivery_date        = '${delivery_date}',
                  salary_structure     = '${salary_structure}',
                  is_delivery          = '${is_delivery}',
                  detail               = '${detail}',
                  get_task_date        = '${get_task_date}',
                  delay_date           = '${delay_date}'
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

//任务包管理-任务包列表-暂停
router.post('/task/delete', checkTokenMiddleware,async (req, res) => {
    const { id } = req.body
    const sql = `UPDATE tasks SET status = '已暂停' where id = '${id}'`
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
    
    let recently_push_date = dataList.length > 0 ? dataList[0]?.create_time : ''
    let frist_push_date = dataList.length > 0 ? dataList[dataList.length - 1]?.create_time : ''
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

//绩效管理-项目工时
router.get('/task/item_time_search', checkTokenMiddleware, async (req, res) => {
    let sql;
    if(req.query.base === ''){
       sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' ORDER BY id DESC`
    }else{
       sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' and base = '${req.query.base}' ORDER BY id DESC`
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

//绩效管理-项目工时-下载
router.get('/task/item_time_down', checkTokenMiddleware, async (req, res) => {
    let sql;
    if(req.query.base === ''){
      sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' ORDER BY id DESC`
    }else{
      sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' and base = '${req.query.base}' ORDER BY id DESC`
    }
    let rowDataPackets = await query( sql ) 

    // 定义 Excel 头部
    const data = [["日期","时间段","基地","姓名","项目名称","生产工时",
                   "非生产工时","非生产工时备注","加班工时"]];
    
    // 遍历数据，转换格式
    const formattedData = rowDataPackets.map(item => [item.date,item.time_frame,item.base,item.worker_name,item.item,
      item.task_hour,item.task_no_hour,item.task_no_hour_detail,item.overtime]);
    
    // 合并头部和数据
    const finalData = [...data, ...formattedData];
    
    // 2. 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "项目工时数据");

    // 3. 保存到服务器
    const filePath = path.join(__dirname, "data.xlsx");
    XLSX.writeFile(workbook, filePath);

    // 4. 返回文件给前端
    res.download(filePath, "项目工时数据.xlsx", (err) => {
        if (err) console.error("下载错误", err);
        // 删除临时文件（可选）
        fs.unlinkSync(filePath);
    });
});

//绩效管理-项目量级-下载
router.get('/task/item_amount_down', checkTokenMiddleware, async (req, res) => {
    let sql;
    if(req.query.base === ''){
      sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' ORDER BY id DESC`
    }else{
      sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' and base = '${req.query.base}' ORDER BY id DESC`
    }
    let rowDataPackets = await query( sql ) 

    // 定义 Excel 头部
    const data = [["日期","时间段","基地","姓名","项目名称","项目标准时效","标注量级","质检量级"]];
    
    // 遍历数据，转换格式
    const formattedData = rowDataPackets.map(item => [item.date,item.time_frame,item.base,item.worker_name,item.item,
      item.item_timeliness,item.work_amount,item.quality_amount]);
    
    // 合并头部和数据
    const finalData = [...data, ...formattedData];
    
    // 2. 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "项目量级数据");

    // 3. 保存到服务器
    const filePath = path.join(__dirname, "data.xlsx");
    XLSX.writeFile(workbook, filePath);

    // 4. 返回文件给前端
    res.download(filePath, "项目量级数据.xlsx", (err) => {
        if (err) console.error("下载错误", err);
        // 删除临时文件（可选）
        fs.unlinkSync(filePath);
    });
});

//绩效管理-项目正确率-下载
router.get('/task/item_accuracy_down', checkTokenMiddleware, async (req, res) => {
    let sql;
    if(req.query.base === ''){
      sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' ORDER BY id DESC`
    }else{
      sql = `select * from tasks_day where SUBSTRING(date, 1, 7) = '${req.query.years}' and base = '${req.query.base}' ORDER BY id DESC`
    }
    let rowDataPackets = await query( sql ) 

    // 定义 Excel 头部
    const data = [["日期","时间段","基地","姓名","项目名称","抽检总量",
                   "错误总量","正确率"]];
    
    // 遍历数据，转换格式
    const formattedData = rowDataPackets.map(item => [item.date,item.time_frame,item.base,item.worker_name,item.item,
      item.spot_check_amount,item.error_amount,item.accuracy]);
    
    // 合并头部和数据
    const finalData = [...data, ...formattedData];
    
    // 2. 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "项目正确率数据");

    // 3. 保存到服务器
    const filePath = path.join(__dirname, "data.xlsx");
    XLSX.writeFile(workbook, filePath);

    // 4. 返回文件给前端
    res.download(filePath, "项目正确率数据.xlsx", (err) => {
        if (err) console.error("下载错误", err);
        // 删除临时文件（可选）
        fs.unlinkSync(filePath);
    });
});

module.exports = router;





