/*
 * @Description: token校验
 * @Author: wangyonghong
 * @Date: 2024-10-08 17:42:59
 * @LastEditTime: 2025-01-17 10:19:29
 */
const jwt = require('jsonwebtoken')
const { secret } = require('../config/config')

module.exports = (req, res, next) => {
    //获取token
    let token = req.get('token')
    if(!token){
      return res.json({
        status:0,
        msg:'token缺失...',
      })
    }
    //校验token
    jwt.verify(token, secret ,(err, data) => {
      if(err){
        return res.json({
          status:0,
          msg:'token失效',
        })
      }
      //保存用户信息
      req.user = data
    })
    next();
  }