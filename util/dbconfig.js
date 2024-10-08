/*
 * @Description: 
 * @Author: wangyonghong
 * @Date: 2024-09-02 14:57:18
 * @LastEditTime: 2024-10-08 16:05:40
 */

module.exports = function(sql, result){
    const mysql = require('mysql')
    const config = {
        host: 'localhost',
        user: 'root',
        password: 'wyhmysql',
        database: 'by_mysql'
    }

    const pool = mysql.createPool(config)
    pool.getConnection((err,conn)=>{
        if(err){
            console.log('连接失败...')
            return;
        }
        conn.query(sql,(err,res) => {
            if(!err){
                result(res)
            }else{
                result(res)
            }
        });
        conn.release();
    })
}
