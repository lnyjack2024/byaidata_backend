/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-08-31 20:55:33
 * @LastEditTime: 2024-09-27 18:38:54
 */
var express = require('express');
var router = express.Router();
var db = require('../util/dbconfig')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//登录
router.post('/login',(req, res) => {
  const { username, password } = req.body
  const sql = `select * from user where account='${username}' and password='${password}'`

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

//测试handsontale
// router.get('/test', function(req, res) {
//   const sql = 'select * from handsontale_data'
//   db(sql,(result)=>{
//     // res.send(JSON.stringify(result))
//     res.send(result)
//   });
// });

// router.post('/test/update', parser, function(req, res) {
//   const length = req.body.length
// });

module.exports = router;
