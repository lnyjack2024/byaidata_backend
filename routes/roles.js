/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-26 13:37:24
 * @LastEditTime: 2024-10-22 10:10:03
 */
const express = require('express');
const router = express.Router();
const checkTokenMiddleware = require('../middlewares/tokenMiddlewares')
const { query } = require('../util/dbconfig');

router.get('/search', checkTokenMiddleware, async(req, res) => {
    const { username, password } = req.body
    const sql = `select * from role`
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

module.exports = router;