/*
 * @Description: 处理检查和拦截注入攻击
 * @Author: wangyonghong
 * @Date: 2025-04-11 14:13:13
 * @LastEditTime: 2025-04-14 16:27:41
 */

const fs = require('fs');
const path = require('path');

const suspiciousPattern = /[\{\[]+.*[\*\+\|\/\-].*[\}\]]+/; // 匹配 {1*1}、[1+1] 等

//检测OGNL 表达式（Struts2漏洞利用常见）
const ognlPattern = /\$\{.*?(#|@).*?exec\(.*?\).*?\}/i;

const suspiciousPaths = [
  /^\/$/,                     // 根路径
  /^\/sdk$/,                  // /sdk
  /^\/api$/,                  // /api
  /^\/login$/,                // /login
  /^\/pages\/.*\.action$/,    // /pages/*.action
  /^\/admin\b/,               // 后台
  /^\/debug\b/,               // 调试
  /^\/user[=\/]?.*$/          // /user, /user=1, /user/abc 等
];

const logFile = path.join(__dirname, '../logs/suspicious.log');

function logSuspiciousRequest(req, reason) {
  const logEntry = `[${new Date().toISOString()}] ${reason}
        IP: ${req.ip}
        URL: ${req.originalUrl}
        Method: ${req.method}
        Body: ${JSON.stringify(req.body)}
        Query: ${JSON.stringify(req.query)}
        -----------\n`;

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error('写入日志失败:', err);
  });
}

function detectInjection(req, res, next) {
  const { path: reqPath } = req;
  const allParams = { ...req.query, ...req.body, ...req.params };
  const decodedPath = decodeURIComponent(reqPath || '');

  const isPathMatch = suspiciousPaths.some((pattern) => pattern.test(reqPath));
  const isInjectionAttempt = Object.values(allParams).some((val) => {
    return typeof val === 'string' && suspiciousPattern.test(val);
  });

  const isOgnlAttack = ognlPattern.test(decodedPath);


  if (isPathMatch || isInjectionAttempt || isOgnlAttack) {
    const reason = isOgnlAttack
    ? '疑似OGNL表达式-注入Struts2漏洞攻击'
    : isInjectionAttempt
    ? '疑似表达式注入攻击'
    : '命中敏感路径';

    logSuspiciousRequest(req, reason);
    return res.status(400).json({ error: 'Suspicious request blocked.' });
  }

  next();
}

module.exports = detectInjection;
