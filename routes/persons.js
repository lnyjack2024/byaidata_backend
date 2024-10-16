/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2024-10-16 10:24:05
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
let checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const db = require('../util/dbconfig');

//部门列表-查询
router.get('/department', checkTokenMiddleware, (req, res) => {
  const { name } = req.query
  let sql
  if(name){
     sql = `select * from department where name='${name}'`
  }else{
     sql = `select * from department`
  }
    db(sql,(result)=>{
      if(result.length > 0){
        res.json({
          status:1,
          msg:'请求成功...',
          data:result
         })
      }else{
        res.json({
          status:0,
          msg:'请求失败...',
         })
      }
    });
});

//部门列表-删除
router.post('/department/delete', checkTokenMiddleware, (req, res) => {
    const { id } = req.body
    const sql = `delete from department where id = '${id}'`
    console.log(sql)
      db(sql,(result)=>{
        console.log(result)

        if(result){
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

//人员花名册-查询
router.get('/roster/search', checkTokenMiddleware, (req, res) => {
  const { name, base, department, service_line, contract_type, role, entry_date } = req.query
  const sql = `select * from roster`

    db(sql,(result)=>{
      if(result.length > 0){
        res.json({
          status:1,
          msg:'请求成功...',
          data:result
         })
      }else{
        res.json({
          status:0,
          msg:'请求失败...',
         })
      }
    });
});

//人员花名册-新增
router.post('/roster/add', checkTokenMiddleware, (req, res) => {
  const { name,sex,department,base,role,immediate_superior,entry_date,become_date,
          contract_type,service_line,item,item_type,position_level,is_payment,is_employer,
          is_social_security,birthday,age,id_card,id_card_time,politics_status,family_name,
          marital_status,number,email,domicile,urrent_address,emergency_contact,emergency_contact_relation,
          emergency_contact_number,bank_card,pasbank_card_detail,is_graduation,is_overseas_student,
          is_full_time,school,specialty,graduation_time,education,certificate,
          language_competence,ability,is_two_entry,work_experience,recruitment_channel,
          dimission_date,dimission_type,dimission_reason } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')

  const sql = `insert into roster(name,sex,department,base,role,immediate_superior,entry_date,become_date,
               contract_type,service_line,item,item_type,position_level,is_payment,is_employer,
               is_social_security,birthday,age,id_card,id_card_time,politics_status,family_name,
               marital_status,number,email,domicile,urrent_address,emergency_contact,emergency_contact_relation,
               emergency_contact_number,bank_card,pasbank_card_detail,is_graduation,is_overseas_student,
               is_full_time,school,specialty,graduation_time,education,certificate,
               language_competence,ability,is_two_entry,work_experience,recruitment_channel,
               dimission_date,dimission_type,dimission_reason,create_time)
              VALUES('${name}','${sex}','${department}','${base}','${role}','${immediate_superior}',
              '${entry_date}','${become_date}','${contract_type}','${service_line}','${item}','${item_type}',
              '${position_level}','${is_payment}','${is_employer}','${is_social_security}','${birthday}',
              '${age}','${id_card}','${id_card_time}','${politics_status}','${family_name}','${marital_status}',
              '${number}','${email}','${domicile}','${urrent_address}','${emergency_contact}','${emergency_contact_relation}',
              '${emergency_contact_number}','${bank_card}','${pasbank_card_detail}','${is_graduation}','${is_overseas_student}',
              '${is_full_time}','${school}','${specialty}','${graduation_time}','${education}','${certificate}',
              '${language_competence}','${ability}','${is_two_entry}','${work_experience}','${recruitment_channel}',
              '${dimission_date}','${dimission_type}','${dimission_reason}','${time}')`
    db(sql,(result)=>{
      if(result){
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

//人员花名册-编辑
router.post('/roster/edit', checkTokenMiddleware, (req, res) => {
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
    db(sql,(result)=>{
      if(result){
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

//人员画像-查询
router.get('/portrait/search', checkTokenMiddleware, (req, res) => {
  const { service_line, item } = req.query
  const sql = `select * from portrait`

    db(sql,(result)=>{
      if(result.length > 0){
        res.json({
          status:1,
          msg:'请求成功...',
          data:result
         })
      }else{
        res.json({
          status:0,
          msg:'请求失败...',
         })
      }
    });
});

//人员画像-新增
router.post('/portrait/add', checkTokenMiddleware, (req, res) => {
  const { service_line,item,sex,age,specialty,education,certificate,language_competence,
          ability,work_experience,model_experience,likes,characters } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')

  const sql = `insert into portrait(service_line,item,sex,age,specialty,education,certificate,
               language_competence,ability,work_experience,model_experience,likes,characters,create_time)
               VALUES('${service_line}','${item}','${sex}','${age}','${specialty}',
               '${education}','${certificate}','${language_competence}','${ability}','${work_experience}',
               '${model_experience}','${likes}','${characters}','${time}')`
               console.log(sql)
    db(sql,(result)=>{
      if(result){
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

//人员画像-编辑
router.post('/portrait/edit', checkTokenMiddleware, (req, res) => {
  const { edit_id,service_line,item,sex,age,specialty,education,certificate,language_competence,
          ability,work_experience,model_experience,likes,characters } = req.body
       
  const sql = `UPDATE portrait
               SET service_line = '${service_line}', item = '${item}', sex = '${sex}',
               age = '${age}', specialty = '${specialty}', education = '${education}',certificate = '${certificate}',
               language_competence = '${language_competence}', ability = '${ability}', work_experience = '${work_experience}', 
               model_experience = '${model_experience}',likes = '${likes}',characters = '${characters}'
               WHERE id = ${edit_id}`
    db(sql,(result)=>{
      if(result){
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

//人员考勤-查询
router.get('/clocking/search', checkTokenMiddleware, (req, res) => {
  const { service_line, item } = req.query
  const sql = `select 
                date,base,department,name,
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

    db(sql,(result)=>{
      if(result.length > 0){
        res.json({
          status:1,
          msg:'请求成功...',
          data:result
         })
      }else{
        res.json({
          status:0,
          msg:'请求失败...',
         })
      }
    });
});
module.exports = router;
