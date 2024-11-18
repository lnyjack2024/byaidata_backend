/*
 * @Description: 数据库配置信息
 * @Author: wangyonghong
 * @Date: 2024-09-02 14:57:18
 * @LastEditTime: 2024-11-14 15:37:52
 */
const mysql = require('mysql')
const pool = mysql.createPool({
    connectionLimit: 50,
    host: 'rm-uf6a7ab0tn1139ug9.mysql.rds.aliyuncs.com',
    user: 'test_root',
    password: 'Byaidata@2024',
    database: 'byaidata_database_test',
    port: 3306,
    connectTimeout: 10000,
    waitForConnections: true,
    acquireTimeout: 10000,     
    queueLimit: 0               
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
