/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2024-10-09 15:03:48
 */
const express = require('express');
const moment = require('moment')
const router = express.Router();
let checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const db = require('../util/dbconfig');
const md5 = require('md5');

router.get('/search', checkTokenMiddleware, (req, res) => {
    const { username, password } = req.body
    const sql = `select * from role`
  
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
