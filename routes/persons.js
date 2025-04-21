/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2025-04-15 16:55:52
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
     sql = `select * from department where name LIKE ? and is_delete = 0`
  }else{
     sql = `select * from department where is_delete = 0`
  }

  let dataList = await query( sql, `%${name}%`) 
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

//部门列表-新增
router.post('/department/add', checkTokenMiddleware, async(req, res) => {
  const { name } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')
  const sql = `insert into department (name,is_delete,create_time) VALUES('${name}',0,'${time}')`
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

//部门列表-删除
router.post('/department/delete', checkTokenMiddleware,async (req, res) => {
    const { id } = req.body
    const sql = `UPDATE department SET is_delete = 1 where id = '${id}'`
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
    const entriesArray = Object.entries(req.query)
    let conditions = entriesArray
    .filter(e => e[0] !== 'is_dimission' || e[1] !== '全部') 
    .map((e)=>{
      return `${e[0]} LIKE '%${e[1]}%'`
    })
    .join(' AND ');
    // let sql = `select * from roster WHERE ${conditions} AND is_delete = 0` 
    let sql = `SELECT * FROM roster WHERE ${conditions ? conditions + ' AND ' : ''}is_delete = 0`; 

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

//人员花名册-详情-查询
router.get('/roster/search_', checkTokenMiddleware, async (req, res) => {
    const entriesArray = Object.entries(req.query)
    let conditions = entriesArray.map((e)=>{
      return `${e[0]} = '${e[1]}'`
    }).join(' AND ');

    let sql = `select * from roster WHERE ${conditions} AND is_delete = 0` 
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

//人员花名册-下载
router.get('/roster/down', checkTokenMiddleware, async (req, res) => {
      // 1. 创建数据
      const entriesArray = Object.entries(req.query)
      let conditions = entriesArray
      .filter(e => e[1] !== 'undefined')
      .map(e => `${e[0]} LIKE '%${e[1]}%'`)
      .join(' AND ');
      let sql = `select * from roster WHERE ${conditions} AND is_delete = 0` 
      let rowDataPackets = await query( sql ) 

      // 定义 Excel 头部
      const data = [["姓名","性别","基地","职场","部门","职务信息","业务线","项目名称",
                     "项目类型","直属上级","入职日期","转正日期","合同类型","职级","是否签约发薪平台",
                     "是否购买雇主责任","是否缴纳社保","出生年月日","年龄","身份证","身份证有效期",
                     "政治面貌","籍贯","婚姻状况","手机号码","邮箱","户籍所在地","现居住地","紧急联系人",
                     "与紧急联系人关系","紧急联系人手机号","银行卡号","银行卡开户行信息","是否毕业",
                     "是否留学生","是否全日制","毕业院校","所学专业","毕业时间","最高学历","所持证书",
                     "语言能力","是否离职","创建时间"]];
      
      // 遍历数据，转换格式
      const formattedData = rowDataPackets.map(item => [item.name,item.sex,item.base,item.workplace,
        item.department,item.role,item.service_line,item.item,item.item_type,item.immediate_superior,item.entry_date,item.become_date,item.contract_type,
        item.position_level,item.is_payment,item.is_employer,item.is_social_security,item.birthday,item.age,item.id_card,item.id_card_time,item.politics_status,
        item.family_name,item.marital_status,item.number,item.email,item.domicile,item.urrent_address,item.emergency_contact,item.emergency_contact_relation,item.emergency_contact_number,
        item.bank_card,item.bank_card_detail,item.is_graduation,item.is_overseas_student,item.is_full_time,item.school,item.specialty,item.graduation_time,item.education,item.certificate,
        item.language_competence,item.is_dimission,item.create_time]);
      
      // 合并头部和数据
      const finalData = [...data, ...formattedData];
      
      // 2. 创建工作簿和工作表
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(finalData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "人员花名册数据");
  
      // 3. 保存到服务器
      const filePath = path.join(__dirname, "data.xlsx");
      XLSX.writeFile(workbook, filePath);
  
      // 4. 返回文件给前端
      res.download(filePath, "人员花名册数据.xlsx", (err) => {
          if (err) console.error("下载错误", err);
          // 删除临时文件（可选）
          fs.unlinkSync(filePath);
      });
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
      sql = `select * from roster WHERE ${conditions} AND is_dimission = '是'` 
    }else{
      sql = `select * from roster WHERE is_dimission = '是'`
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
      sql = `select * from roster WHERE ${conditions} AND dimission_type = '5' or dimission_type = '6'` 

    }else{
      sql = `select * from roster WHERE dimission_type = '5' or dimission_type = '6'`
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
  const { name,sex,department,base,role,workplace,immediate_superior,entry_date,become_date,
          contract_type,social_insurance_name,social_insurance_date,service_line,item,item_type,position_level,is_payment,is_employer,
          is_social_security,birthday,age,id_card,id_card_time,politics_status,family_name,
          marital_status,number,email,domicile,urrent_address,emergency_contact,emergency_contact_relation,
          emergency_contact_number,bank_card,bank_card_detail,is_graduation,is_overseas_student,
          is_full_time,school,specialty,graduation_time,education,certificate,
          language_competence,ability } = req.body
  const formattedDates = id_card_time.map(date => date.split('T')[0]);
  const time = moment().format('YYYY-MM-DD HH:mm:ss')
  const sql = `insert into roster(name,sex,department,base,role,workplace,immediate_superior,entry_date,become_date,
               contract_type,social_insurance_name,social_insurance_date,service_line,item,item_type,position_level,is_payment,is_employer,
               is_social_security,birthday,age,id_card,id_card_time,politics_status,family_name,
               marital_status,number,email,domicile,urrent_address,emergency_contact,emergency_contact_relation,
               emergency_contact_number,bank_card,bank_card_detail,is_graduation,is_overseas_student,
               is_full_time,school,specialty,graduation_time,education,certificate,
               language_competence,ability,is_two_entry,work_experience,recruitment_channel,recruitment_type,is_dimission,is_delete,
               create_time)
              VALUES('${name}','${sex}','${department ? department : '' }','${base}','${role}','${workplace}','${immediate_superior}',
              '${entry_date}','${become_date}','${contract_type}','${social_insurance_name ? social_insurance_name : ''}',
              '${social_insurance_date ? social_insurance_date : ''}','${service_line ? service_line : ''}','${item ? item : ''}','${item_type ? item_type : ''}',
              '${position_level ? position_level : ''}','${is_payment}','${is_employer}','${is_social_security}','${birthday}',
              '${age}','${id_card}','${formattedDates}','${politics_status}','${family_name}','${marital_status}',
              '${number}','${email}','${domicile}','${urrent_address}','${emergency_contact}','${emergency_contact_relation}',
              '${emergency_contact_number}','${bank_card}','${bank_card_detail}','${is_graduation}','${is_overseas_student}',
              '${is_full_time}','${school}','${specialty}','${graduation_time}','${education}','${certificate}',
              '${language_competence}','${ability}','否','','HR招聘','0',
              '否',0,'${time}')`

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
  const { edit_id, base, role, workplace,service_line, item, item_type, immediate_superior, position_level, dimission_date, dimission_type, dimission_reason } = req.body
  const time = dimission_date === '' ? '' : moment(dimission_date).format('YYYY-MM-DD')
  let is_dimission
  if(dimission_type){
    is_dimission = '是'
  }else{
    is_dimission = '否'
  }
  const sql = `UPDATE roster SET base = '${base}',role = '${role}',immediate_superior = '${immediate_superior}',position_level = '${ position_level ? position_level : '' }',
               workplace = '${workplace}',service_line = '${service_line ? service_line : ''}',item = '${ item ? item : '' }',item_type = '${item_type ? item_type : ''}',dimission_date = '${time}', dimission_type = '${dimission_type ? dimission_type : ''}',
               is_dimission = '${is_dimission}',dimission_reason = '${ dimission_reason === null ? '' : dimission_reason }' WHERE id = ${edit_id}`
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

//人员花名册-删除
router.post('/roster/delete', checkTokenMiddleware,async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE roster SET is_delete = '1' WHERE id = ${id}`
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
    sql = `select * from portrait WHERE ${conditions} and is_delete = 0` 

  }else{
    sql = `select * from portrait where is_delete = 0`
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
          ability,work_experience,model_experience,likes,characters,business_leader,personnel,number,inter_time } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')
  const user = req.user.name
  const sql = `insert into portrait(service_line,item,sex,age,specialty,education,certificate,
               language_competence,ability,work_experience,model_experience,likes,characters,
               business_leader,user,personnel,number,inter_time,is_delete,create_time)
               VALUES('${service_line}','${item}','${sex}','${age}','${specialty}',
               '${education}','${certificate}','${language_competence}','${ability}','${work_experience}',
               '${model_experience}','${likes}','${characters}','${business_leader}','${user}',
               '${personnel}','${number}','${inter_time}',0,'${time}')`
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

//人员画像-删除
router.post('/portrait/delete', checkTokenMiddleware,async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE portrait SET is_delete = 1 where id = '${id}'`
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
  const month = entriesArray[0][1]
  //处理统计字段:实际出勤天数、请假调休天数、加班总工时、培训期天数、在项天数
  let data = await query( `select * from attendance_records where years = '${month}'`  ) 
  for (const row of data) {
    //实际出勤天数
    let _real_work_days = 0;
    //请假调休小时
    let _leave_adjustment_days = 0;
    //加班总工时
    let _total_overtime_hours = 0;
    //培训期小时
    let _training_days = 0;
    //在项天数
    let _days_in_works = 0;
    let count = 0;
    for (let i = 1; i <= 31; i++) {
      const val = row[`day_${i}`];
      if(val){
        count ++;
      }
      if (!val) continue;
      if (val === '假(上0.5天)') {
        _leave_adjustment_days += 4;
        _real_work_days += 4;
      } else if (val === '假(下0.5天)') {
        _leave_adjustment_days += 4;
        _real_work_days += 4;
      } else if (val === '全天假') {
        _leave_adjustment_days += 8;
      } else if (val === '调休假') {
        _leave_adjustment_days += 8;
      } else if (val === '上午假') {
        _leave_adjustment_days += 2.5;
        _real_work_days += 5.5;
      } else if (val === '下午假') {
        _leave_adjustment_days += 5.5;
        _real_work_days += 2.5;
      } else if (val === '正常班') {
        _real_work_days += 8;
      } else if (val === '加班') {
        _real_work_days += 8;
        _total_overtime_hours += 8;
      } else if (val === '加班半天假') {
        _real_work_days += 0.5;
        _total_overtime_hours += 0.5;
      } else if (val === '加班上午假') {
        _real_work_days += 5.5;
        _total_overtime_hours += 5.5;
      } else if (val === '加班下午假') {
        _real_work_days += 2.5;
        _total_overtime_hours += 2.5;
      } else if (val === '培训期') {
        _training_days += 8;
      } else if (val === '未入职') {
        _days_in_works += 1;
      } else if (val === '已离职') {
        _days_in_works += 1;
      } else {
        _leave_adjustment_days += 0;
        _real_work_days += 0;
        _total_overtime_hours += 0;
        _training_days += 0;
        _days_in_works += 0;
      }
    }

    //实际出勤天数
    const realWorkDays = Number((_real_work_days / 8).toFixed(3))
    //请假调休天数
    const leaveAdjustmentDays = Number((_leave_adjustment_days / 8).toFixed(3));
    //加班总工时
    const totalOvertimeHours = Number(_total_overtime_hours)
    //培训期天数
    const trainingDays = Number((_training_days / 8).toFixed(3))
    //在项天数
    const daysInWorks = Number(count - _days_in_works)

    //更新到表字段
    await query(
      `UPDATE attendance_records SET real_work_days = ?, leave_adjustment_days = ?, total_overtime_hours = ?, training_days = ?, days_in_works = ? WHERE id = ?`,
      [realWorkDays, leaveAdjustmentDays, totalOvertimeHours, trainingDays, daysInWorks, row.id]
    );
  }
  //查询
  let sql
  if(keysArray.length > 0){
    let conditions = ''
    conditions = entriesArray.map((e)=>{
      return `${e[0]} LIKE '%${e[1]}%'`
    }).join(' AND ')
    sql = `select * from attendance_records WHERE ${conditions}` 
  }
  let dataList = await query( sql ) 
  //返回查询数据
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
          item[i] = `''`
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

  const sql = `insert into attendance_records(years,name,base,group_manager,item_task,planned_work_days,day_1,day_2,day_3,day_4,
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

//人员考勤-编辑
router.post('/clocking/edit', checkTokenMiddleware, async (req, res) => {
  const { id, field, value } = req.body
  const sql = `UPDATE attendance_records SET ${field} = '${value}' WHERE id = ${id}`
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

//人员考勤-删除
router.post('/clocking/delete', checkTokenMiddleware, async (req, res) => {
  const { id } = req.body
  const sql = `DELETE FROM attendance_records WHERE id = ${id}`
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

//人员考勤-下载
router.get('/clocking/down', checkTokenMiddleware, async (req, res) => {
  // 1. 创建数据
  const entriesArray = Object.entries(req.query)
  let conditions = entriesArray
  .filter(e => e[1] !== 'undefined')
  .map(e => `${e[0]} LIKE '%${e[1]}%'`)
  .join(' AND ');
  let sql = `select * from attendance_records WHERE ${conditions}` 
  let rowDataPackets = await query( sql ) 

  // 定义 Excel 头部
  const data = [["年月","姓名","基地","组长","项目-任务包","应出勤天数(天)","实际出勤天数(天)",
                 "请假调休天数(天)","加班总工时(时)","培训期天数(天)","在项天数(天)","1号","2号","3号",
                 "4号","5号","6号","7号","8号","9号","10号","11号","12号","13号",
                 "14号","15号","16号","17号","18号","19号","20号","21号","22号",
                 "23号","24号","25号","26号","27号","28号","29号","30号","31号"]];
  
  // 遍历数据，转换格式
  const formattedData = rowDataPackets.map(item => [item.years,item.name,item.base,item.group_manager,item.item_task,
    item.planned_work_days,item.real_work_days,item.leave_adjustment_days,item.total_overtime_hours,item.training_days,item.days_in_works,
    item.day_1,item.day_2,item.day_3,item.day_4,item.day_5,item.day_6,item.day_7,item.day_8,item.day_9,item.day_10,
    item.day_11,item.day_12,item.day_13,item.day_14,item.day_15,item.day_16,item.day_17,item.day_18,item.day_19,
    item.day_20,item.day_21,item.day_22,item.day_23,item.day_24,item.day_25,item.day_26,item.day_27,item.day_28,
    item.day_29,item.day_30,item.day_31]);
  
  // 合并头部和数据
  const finalData = [...data, ...formattedData];
  
  // 2. 创建工作簿和工作表
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(finalData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "人员考勤数据");

  // 3. 保存到服务器
  const filePath = path.join(__dirname, "data.xlsx");
  XLSX.writeFile(workbook, filePath);

  // 4. 返回文件给前端
  res.download(filePath, "人员考勤数据.xlsx", (err) => {
      if (err) console.error("下载错误", err);
      // 删除临时文件（可选）
      fs.unlinkSync(filePath);
  });
});

//培训师列表-查询
router.get('/trainer/search', checkTokenMiddleware, async (req, res) => {
  const keysArray = Object.keys(req.query)
  const entriesArray = Object.entries(req.query)
  let sql
  if(keysArray.length > 0){
    let conditions = ''
    conditions = entriesArray.map((e)=>{
      return `${e[0]} LIKE '%${e[1]}%'`
    }).join(' AND ')
    sql = `select * from trainer WHERE ${conditions} and is_delete = 0` 
  }else{
    sql = `select * from trainer WHERE is_delete = 0 ORDER BY id DESC`
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

//培训师列表-新增
router.post('/trainer/add', checkTokenMiddleware, async (req, res) => {
  const { base,service_line,item,start_time } = req.body
  const time = moment().format('YYYY-MM-DD HH:mm:ss')
  const user = req.user.name
  const sql = `insert into trainer(base,service_line,item,user,start_time,is_delete,create_time)
               VALUES('${base}','${service_line}','${item}','${user}','${start_time}',0,'${time}')`
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

//培训师列表-文档导入
router.post('/trainer/upload', checkTokenMiddleware, (req, res) => {
  let id = req.query.id
  let type = req.query.type
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
    let sql = ''
    if(type === '1'){
      sql = `UPDATE trainer SET document_url='${fileUrl}' where id='${id}'`
    }else if(type === '2'){
      sql = `UPDATE trainer SET answer_url='${fileUrl}' where id='${id}'`
    }else{
      sql = `UPDATE trainer SET check_url='${fileUrl}' where id='${id}'`
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
});

//培训师列表-删除
router.post('/trainer/delete', checkTokenMiddleware,async (req, res) => {
  const { id } = req.body
  const sql = `UPDATE trainer SET is_delete = 1 WHERE id = ${id}`
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
