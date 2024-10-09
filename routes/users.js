/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2024-10-09 10:21:44
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
let checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const db = require('../util/dbconfig');
const md5 = require('md5');

router.get('/search', checkTokenMiddleware, (req, res) => {
    const { username, password } = req.body
    // const sql = `select * from user where account='${username}' and password='${password}'`
    const sql = `select * from user`
  
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

router.post('/add', checkTokenMiddleware, (req, res) => {
    const { account, name, password, role, department, base } = req.body
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    const password_md5 = md5(password)
    let s = role.split('-')
    const sql_page = 'SELECT * FROM user ORDER BY id DESC LIMIT 1'
    db(sql_page,(result)=>{
      const id = Number(result[0].id + 1) 
      const sql = `insert into user (id,account,password,name,department,base,role,role_id,create_time,update_time,is_delete)
                  VALUES(${id},'${account}','${password_md5}','${name}','${department}','${base}','${s[0]}','${s[1]}','${time}','${time}',0)`
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
   
});

module.exports = router;
