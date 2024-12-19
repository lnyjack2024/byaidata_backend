/*
 * @Description: 主入口文件
 * @Author: wangyonghong
 * @Date: 2024-08-31 20:55:33
 * @LastEditTime: 2024-12-19 15:35:04
 */
var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var logs = require('./middlewares/logsMiddlewares')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var rolesRouter = require('./routes/roles');
//人员管理路由
var personsRouter = require('./routes/persons');
//配置管理路由
var configRouter = require('./routes/config');
//项目管理路由
var itemsRouter = require('./routes/items');
//任务包管理路由
var tasksRouter = require('./routes/tasks');
//财务管理
var financeRouter = require('./routes/finance');

var app = express();
var http = require('http');
var server = http.createServer(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({ origin: 'http://47.116.221.126' }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置路由前缀
app.use('/', indexRouter);
//操作日志
app.use(logs)
app.use('/user', usersRouter);
app.use('/role', rolesRouter);
app.use('/person', personsRouter);
app.use('/config', configRouter);
app.use('/items', itemsRouter);
app.use('/tasks', tasksRouter);
app.use('/finance', financeRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

server.listen('3004')
