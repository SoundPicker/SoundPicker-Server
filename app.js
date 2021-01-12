const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {sequelize} = require('./models');
const cors = require('cors');

const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);;
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'soundpicker-db.ckxjgesoea8z.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: 'tkdnsemvlzj12*',
  database:'soundpicker'
})
connection.connect();

// 서버 오픈
server.listen(5000, () => {
  console.log('Socket app listening on port 5000!');
});

//localhost:3000 접속시 바로 player.html 열기
app.get('/', (req, res) => {
  console
  res.sendFile(__dirname + '/player.html');
});

io.sockets.on('connection', (socket) => { //클라이언트가 연결할때 발생, socket 객체 생성
  console.log('connection');
  socket.on('receive1', (answer1) => { //player의 메시지 받고 (on:받는 함수)
    console.log('player a가 보낸 데이터: ', answer1);
    
    //chooga
    connection.query("INSERT INTO Score (UserId, content, score) VALUES (?, ?, ?)", [
      answer1.UserId, answer1.content, answer1.score
    ], function() {});
    
    ///receive 발생했을때 서버에서의 반응
    io.emit('player_receive1', answer1);  //메시지를 모든 플레이어에게 보냄
  }); //emit: 메시지 보내는 함수
});

io.sockets.on('connection', (socket) => {
  socket.on('receive2', (answer2) => {
    console.log('player b가 보낸 데이터: ', answer2);
    io.emit('player_receive2', answer2);
  });
});

io.sockets.on('connection', (socket) => {
  socket.on('receive3', (answer3) => {
    console.log('player c가 보낸 데이터: ', answer3);
    io.emit('player_receive3', answer3);
  });
});



sequelize.sync({alter : false})//force: false
  .then(() => {
    console.log('데이터베이스 연결 성공.');
  })
  .catch((error) => {
    console.error(error);
  })

const indexRouter = require('./routes/index');

// const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

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