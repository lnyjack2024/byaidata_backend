/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2024-11-07 17:47:38
 */
const express = require('express');
const moment = require('moment')
const fs = require('fs')
const path = require('path');
const XLSX = require('xlsx');
const { formidable } = require('formidable');
var router = express.Router();
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

//部门列表-查询
router.get('/department', checkTokenMiddleware, async (req, res) => {
  const { name } = req.query
  let sql
  if( name ){
     sql = `select * from department where name='${name}'`
  }else{
     sql = `select * from department`
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

//部门列表-删除
router.post('/department/delete', checkTokenMiddleware,async (req, res) => {
    const { id } = req.body
    const sql = `delete from department where id = '${id}'`
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

//人员花名册-查询
router.get('/roster/search', checkTokenMiddleware, async (req, res) => {
    const keysArray = Object.keys(req.query)
    const entriesArray = Object.entries(req.query)
    let sql
    if(keysArray.length > 0){
      let conditions = ''
      conditions = entriesArray.map((e)=>{
        return `${e[0]} LIKE '%${e[1]}%'`
      }).join(' AND ')
      sql = `select * from roster WHERE ${conditions}` 

    }else{
      sql = `select * from roster`
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

//人员花名册-离职-查询
router.get('/dimission/search', checkTokenMiddleware, async (req, res) => {
    const keysArray = Object.keys(req.query)
    const entriesArray = Object.entries(req.query)
    let sql
    if(keysArray.length > 0){
      let conditions = ''
      conditions = entriesArray.map((e)=>{
        return `${e[0]} LIKE '%${e[1]}%'`
      }).join(' AND ')
      sql = `select * from roster WHERE ${conditions}` 
    }else{
      sql = `select * from roster`
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

//人员花名册-黑名单-查询
router.get('/black/search', checkTokenMiddleware, async (req, res) => {
    const keysArray = Object.keys(req.query)
    const entriesArray = Object.entries(req.query)
    let sql
    if(keysArray.length > 0){
      let conditions = ''
      conditions = entriesArray.map((e)=>{
        return `${e[0]} LIKE '%${e[1]}%'`
      }).join(' AND ')
      sql = `select * from roster WHERE ${conditions}` 

    }else{
      sql = `select * from roster`
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

//人员花名册-新增
router.post('/roster/add', checkTokenMiddleware, async (req, res) => {
  const { name,sex,department,base,role,immediate_superior,entry_date,become_date,
          contract_type,service_line,item,item_type,position_level,is_payment,is_employer,
          is_social_security,birthday,age,id_card,id_card_time,politics_status,family_name,
          marital_status,number,email,domicile,urrent_address,emergency_contact,emergency_contact_relation,
          emergency_contact_number,bank_card,bank_card_detail,is_graduation,is_overseas_student,
          is_full_time,school,specialty,graduation_time,education,certificate,
          language_competence,ability,is_two_entry,work_experience,recruitment_channel,
          dimission_date,dimission_type,dimission_reason } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')

  const sql = `insert into roster(name,sex,department,base,role,immediate_superior,entry_date,become_date,
               contract_type,service_line,item,item_type,position_level,is_payment,is_employer,
               is_social_security,birthday,age,id_card,id_card_time,politics_status,family_name,
               marital_status,number,email,domicile,urrent_address,emergency_contact,emergency_contact_relation,
               emergency_contact_number,bank_card,bank_card_detail,is_graduation,is_overseas_student,
               is_full_time,school,specialty,graduation_time,education,certificate,
               language_competence,ability,is_two_entry,work_experience,recruitment_channel,
               dimission_date,dimission_type,dimission_reason,create_time)
              VALUES('${name}','${sex}','${department}','${base}','${role}','${immediate_superior}',
              '${entry_date}','${become_date}','${contract_type}','${service_line}','${item}','${item_type}',
              '${position_level}','${is_payment}','${is_employer}','${is_social_security}','${birthday}',
              '${age}','${id_card}','${id_card_time}','${politics_status}','${family_name}','${marital_status}',
              '${number}','${email}','${domicile}','${urrent_address}','${emergency_contact}','${emergency_contact_relation}',
              '${emergency_contact_number}','${bank_card}','${bank_card_detail}','${is_graduation}','${is_overseas_student}',
              '${is_full_time}','${school}','${specialty}','${graduation_time}','${education}','${certificate}',
              '${language_competence}','${ability}','${is_two_entry}','${work_experience}','${recruitment_channel}',
              '${dimission_date}','${dimission_type}','${dimission_reason}','${time}')`
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

//人员花名册-编辑
router.post('/roster/edit', checkTokenMiddleware, async (req, res) => {
  const { edit_id,base,role,immediate_superior,service_line,item,item_type,is_two_entry,
          work_experience,dimission_type,dimission_reason } = req.body
          let dimission_date
          if(dimission_type){
             dimission_date = moment().format('YYYY-MM-DD')
          }else{
            dimission_date = ''
          }
  const sql = `UPDATE roster
               SET base = '${base}', role = '${role}', immediate_superior = '${immediate_superior}',
               service_line = '${service_line}', item = '${item}', item_type = '${item_type}',is_two_entry = '${is_two_entry}',
               work_experience = '${work_experience}', dimission_type = '${dimission_type}', dimission_date = '${dimission_date}', 
               dimission_type = '${dimission_type}',dimission_reason = '${dimission_reason}'
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

//人员花名册-导入
router.post('/roster/upload', checkTokenMiddleware, (req, res) => {
  //创建form对象
  const form = formidable({
    multiples:true,
    //保存上传的excel文件
    uploadDir:__dirname + '/../public/excel',
    keepExtensions:true
  });
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
        conditions.push(`('${c.name}','${c.sex}','${c.department}','${c.base}','${c.role}',
                          '${c.immediate_superior}','${c.entry_date}','${c.become_date}','${c.contract_type}','${c.service_line}',
                          '${c.item}','${c.item_type}','${c.position_level}','${c.is_payment}','${c.is_employer}',
                          '${c.is_social_security}','${c.birthday}','${c.age}','${c.id_card}','${c.id_card_time}',
                          '${c.politics_status}','${c.family_name}','${c.marital_status}','${c.number}','${c.email}',
                          '${c.domicile}','${c.urrent_address}','${c.emergency_contact}','${c.emergency_contact_relation}','${c.emergency_contact_number}',
                          '${c.bank_card}','${c.bank_card_detail}','${c.is_graduation}','${c.is_overseas_student}','${c.is_full_time}',
                          '${c.school}','${c.specialty}','${c.graduation_time}','${c.education}','${c.certificate}',
                          '${c.language_competence}','${c.ability}','${c.is_two_entry}','${c.work_experience}','${c.recruitment_channel}',
                          '${c.dimission_date}','${c.dimission_type}','${c.dimission_reason}','${c.create_time}')`)
                        })
      val = conditions.map((e)=>{
        return `${e}`
      })
      val_keys = keysArray.map((e)=>{
        return `${e}`
      }).join(',')
    
      let sql = `INSERT INTO roster(${val_keys}) VALUES ${val}`
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

//人员画像-查询
router.get('/portrait/search', checkTokenMiddleware, async (req, res) => {
  const keysArray = Object.keys(req.query)
  const entriesArray = Object.entries(req.query)
  let sql
  if(keysArray.length > 0){
    let conditions = ''
    conditions = entriesArray.map((e)=>{
      return `${e[0]} LIKE '%${e[1]}%'`
    }).join(' AND ')
    sql = `select * from portrait WHERE ${conditions}` 

  }else{
    sql = `select * from portrait`
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

//人员画像-新增
router.post('/portrait/add', checkTokenMiddleware, async (req, res) => {
  const { service_line,item,sex,age,specialty,education,certificate,language_competence,
          ability,work_experience,model_experience,likes,characters } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')

  const sql = `insert into portrait(service_line,item,sex,age,specialty,education,certificate,
               language_competence,ability,work_experience,model_experience,likes,characters,create_time)
               VALUES('${service_line}','${item}','${sex}','${age}','${specialty}',
               '${education}','${certificate}','${language_competence}','${ability}','${work_experience}',
               '${model_experience}','${likes}','${characters}','${time}')`
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

//人员画像-编辑
router.post('/portrait/edit', checkTokenMiddleware, async (req, res) => {
  const { edit_id,service_line,item,sex,age,specialty,education,certificate,language_competence,
          ability,work_experience,model_experience,likes,characters } = req.body
       
  const sql = `UPDATE portrait
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

//人员考勤-查询
router.get('/clocking/search', checkTokenMiddleware, async (req, res) => {
  const keysArray = Object.keys(req.query)
  const entriesArray = Object.entries(req.query)
  let sql
  if(keysArray.length > 0){
    let conditions = ''
    conditions = entriesArray.map((e)=>{
      return `${e[0]} LIKE '%${e[1]}%'`
    }).join(' AND ')
    sql = `select 
        id,date,base,department,name,
        JSON_EXTRACT(data_json,'$.day_1') AS day1, 
        JSON_EXTRACT(data_json,'$.day_2') AS day2, 
        JSON_EXTRACT(data_json,'$.day_3') AS day3, 
        JSON_EXTRACT(data_json,'$.day_4') AS day4, 
        JSON_EXTRACT(data_json,'$.day_5') AS day5, 
        JSON_EXTRACT(data_json,'$.day_6') AS day6, 
        JSON_EXTRACT(data_json,'$.day_7') AS day7, 
        JSON_EXTRACT(data_json,'$.day_8') AS day8, 
        JSON_EXTRACT(data_json,'$.day_9') AS day9,
        JSON_EXTRACT(data_json,'$.day_10') AS day10,
        JSON_EXTRACT(data_json,'$.day_11') AS day11,
        JSON_EXTRACT(data_json,'$.day_12') AS day12,
        JSON_EXTRACT(data_json,'$.day_13') AS day13,
        JSON_EXTRACT(data_json,'$.day_14') AS day14,
        JSON_EXTRACT(data_json,'$.day_15') AS day15,
        JSON_EXTRACT(data_json,'$.day_16') AS day16,
        JSON_EXTRACT(data_json,'$.day_17') AS day17,
        JSON_EXTRACT(data_json,'$.day_18') AS day18,
        JSON_EXTRACT(data_json,'$.day_19') AS day19,
        JSON_EXTRACT(data_json,'$.day_20') AS day20,
        JSON_EXTRACT(data_json,'$.day_21') AS day21,
        JSON_EXTRACT(data_json,'$.day_22') AS day22,
        JSON_EXTRACT(data_json,'$.day_23') AS day23,
        JSON_EXTRACT(data_json,'$.day_24') AS day24,
        JSON_EXTRACT(data_json,'$.day_25') AS day25,
        JSON_EXTRACT(data_json,'$.day_26') AS day26,
        JSON_EXTRACT(data_json,'$.day_27') AS day27,
        JSON_EXTRACT(data_json,'$.day_28') AS day28,
        JSON_EXTRACT(data_json,'$.day_29') AS day29,
        JSON_EXTRACT(data_json,'$.day_30') AS day30,
        JSON_EXTRACT(data_json,'$.day_31') AS day31,
        create_time
    from clocking_in WHERE ${conditions}`
  }else{
    sql = `select 
                id,date,base,department,name,
                JSON_EXTRACT(data_json,'$.day_1') AS day1, 
                JSON_EXTRACT(data_json,'$.day_2') AS day2, 
                JSON_EXTRACT(data_json,'$.day_3') AS day3, 
                JSON_EXTRACT(data_json,'$.day_4') AS day4, 
                JSON_EXTRACT(data_json,'$.day_5') AS day5, 
                JSON_EXTRACT(data_json,'$.day_6') AS day6, 
                JSON_EXTRACT(data_json,'$.day_7') AS day7, 
                JSON_EXTRACT(data_json,'$.day_8') AS day8, 
                JSON_EXTRACT(data_json,'$.day_9') AS day9,
                JSON_EXTRACT(data_json,'$.day_10') AS day10,
                JSON_EXTRACT(data_json,'$.day_11') AS day11,
                JSON_EXTRACT(data_json,'$.day_12') AS day12,
                JSON_EXTRACT(data_json,'$.day_13') AS day13,
                JSON_EXTRACT(data_json,'$.day_14') AS day14,
                JSON_EXTRACT(data_json,'$.day_15') AS day15,
                JSON_EXTRACT(data_json,'$.day_16') AS day16,
                JSON_EXTRACT(data_json,'$.day_17') AS day17,
                JSON_EXTRACT(data_json,'$.day_18') AS day18,
                JSON_EXTRACT(data_json,'$.day_19') AS day19,
                JSON_EXTRACT(data_json,'$.day_20') AS day20,
                JSON_EXTRACT(data_json,'$.day_21') AS day21,
                JSON_EXTRACT(data_json,'$.day_22') AS day22,
                JSON_EXTRACT(data_json,'$.day_23') AS day23,
                JSON_EXTRACT(data_json,'$.day_24') AS day24,
                JSON_EXTRACT(data_json,'$.day_25') AS day25,
                JSON_EXTRACT(data_json,'$.day_26') AS day26,
                JSON_EXTRACT(data_json,'$.day_27') AS day27,
                JSON_EXTRACT(data_json,'$.day_28') AS day28,
                JSON_EXTRACT(data_json,'$.day_29') AS day29,
                JSON_EXTRACT(data_json,'$.day_30') AS day30,
                JSON_EXTRACT(data_json,'$.day_31') AS day31,
                create_time
                from clocking_in`
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

//人员考勤-新增
router.post('/clocking/add', checkTokenMiddleware, async (req, res) => {
  let data = req.body
  let arr = []
  for (const item of data) {
    if(item[0] !== null){
      for(let i = 0 ; i < item.length ; i ++){
        if(item[i] === null){
          item[i] = `'0'`
        }else{
          item[i] = `'${item[i]}'`
        }
      }
      arr.push(item)
    }
  }
  const val = arr.map((e)=>{
    return `(${e})` 
  }).join(',')
  const sql = `insert into clocking_in_datas(name,years,base,department,day_1,day_2,day_3,day_4,
               day_5,day_6,day_7,day_8,day_9,day_10,day_11,day_12,day_13,day_14,day_15,day_16,
               day_17,day_18,day_19,day_20,day_21,day_22,day_23,day_24,day_25,day_26,day_27,day_28,
               day_29,day_30,day_31)
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

module.exports = router;
