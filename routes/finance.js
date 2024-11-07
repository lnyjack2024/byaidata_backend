/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-10-28 17:59:05
 * @LastEditTime: 2024-11-06 15:48:49
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
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

//财务管理-结算列表-结算状态
router.post('/settle/edit', checkTokenMiddleware, async (req, res) => {
  const { edit_id, edit_val } = req.body
  const user = req.user.name
  const sql = `UPDATE settle SET settlement_status = '${edit_val}', settlement_user = '${user}' where id = '${edit_id}'`
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

//财务管理-结算列表-回款状态
router.post('/settle/status', checkTokenMiddleware, async (req, res) => {
  const { edit_id, refund_date, refund_status } = req.body
  const sql = `UPDATE settle SET refund_status = '${refund_status}', refund_date = '${refund_date}' where id = '${edit_id}'`
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

//财务管理-结算列表-开票
router.post('/settle/invoice', checkTokenMiddleware, async (req, res) => {
  const { edit_id, invoice_date, is_ticket } = req.body
  const user = req.user.name
  const time = moment().format('YYYY-MM-DD HH:mm:ss')

  const sql = `insert into settle_invoice_detail(settle_id,invoice_date,is_ticket,user,create_time)
               VALUES('${edit_id}','${invoice_date}','${is_ticket}','${user}','${time}')`
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

//财务管理-结算列表-开票明细-查询
router.get('/settle/invoice_search', checkTokenMiddleware, async (req, res) => {
  const sql = `select * from settle_invoice_detail where settle_id ='${req.query.id}' ORDER BY id DESC`
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

//财务管理-结算列表-开票明细-导入
router.post('/settle/invoice_upload', checkTokenMiddleware, (req, res) => {
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
    let sql = `UPDATE settle_invoice_detail SET attachment='${fileUrl}' where id='${id}'`
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

//财务管理-结算列表-开票明细-删除
router.post('/settle/delete', checkTokenMiddleware,async (req, res) => {
  const { id } = req.body
  const sql = `delete from settle_invoice_detail where id = '${id}'`
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