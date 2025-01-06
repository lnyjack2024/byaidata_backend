/*
 * @Description: 数据库配置信息
 * @Author: wangyonghong
 * @Date: 2024-09-02 14:57:18
 * @LastEditTime: 2025-01-03 18:48:24
 */
const mysql = require('mysql')
const pool = mysql.createPool({
    connectionLimit: 50,
    host: 'localhost',
    user: 'root',
    password: 'wyhmysql',
    database: 'by_mysql'
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
