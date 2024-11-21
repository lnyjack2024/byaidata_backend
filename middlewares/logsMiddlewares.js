/*
 * @Description: 日志中间件
 * @Author: wangyonghong
 * @Date: 2024-11-21 10:07:19
 * @LastEditTime: 2024-11-21 13:09:50
 */
const { query } = require('../util/dbconfig');
const moment = require('moment')
let tokenMiddleware = require('./tokenMiddlewares')

//中间件函数 记录POST请求操作数据
module.exports = async (req, res, next) => {
    const { method, url, body } = req;
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    let user = ''
    tokenMiddleware(req, res, ( err ) => {
        if(err){
            return next(err)
        }
        user = req.user.name
    })
    if(method === 'POST'){
      await query( `insert into logs (url, date, user, create_time) 
                    VALUES('${url}','${JSON.stringify(body)}','${user}','${time}')` 
                 ) 
    }
    next();
}