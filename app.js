const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {sequelize} = require('./models');
const cors = require('cors');

sequelize.sync({alter : false})//force: false
  .then(() => {
    console.log('데이터베이스 연결 성공.');
  })
  .catch((error) => {
    console.error(error);
  })

const indexRouter = require('./routes/index');

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());


//localhost:3000 접속시 바로 player.html 열기
app.get('/realtime', (req, res) => {
  res.sendFile(__dirname + '/public/player.html');
});
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;