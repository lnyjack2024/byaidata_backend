/*
 * @Description: 数据库配置信息
 * @Author: wangyonghong
 * @Date: 2024-09-02 14:57:18
 * @LastEditTime: 2024-11-18 15:45:44
 */
const mysql = require('mysql')
const pool = mysql.createPool({
    connectionLimit: 50,
    host: 'rm-uf6a7ab0tn1139ug9.mysql.rds.aliyuncs.com',//外网地址 ecs连接内网地址、设置白名单
    user: 'test_root',
    password: 'Byaidata@2024',
    database: 'byaidata_database_test',
    port: 3306,
    connectTimeout: 10000,      // 连接超时时间
    waitForConnections: true,   // 连接等待
    acquireTimeout: 10000,      // 获取连接的超时时间
    queueLimit: 0               // 排队等待连接的数量（0 表示不限制）
}) 
let query = function( sql, values ) { 
    return new Promise(( resolve, reject ) => { 
        pool.getConnection(function( err, connection) { 
            if (err) { 
                console.log('错误信息:' + err.sqlMessage)
                try{
                    
                }catch(err){
                    throw err;
                }
            } else { 
                connection.query( sql, values, ( err, rows) => { 
                    if ( err ) { 
                      console.log('错误信息:' + err.sqlMessage)
                    } 
                    try{
                        resolve( rows ) 
                    }catch(err){
                        throw err;
                    }
                    connection.release() 
                }) 
            } 
        }) 
    }) 
} 

module.exports = { query } 
