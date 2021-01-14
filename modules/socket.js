const dbConfig = require('../config/database');

class Sockets {
  connection(client){
    console.log('CONNECTION');

    client.on('receive', (test_id) => { 
      console.log('test_id: ', test_id);

      //database 정보 가져와서 담아서
      const connection = dbConfig;

      //연동하고싶다..
      connection.connect();
      //연동시 쿼리문
      connection.query('SELECT id FROM Test', function (error, results) {
          if (error) {
              console.log(error);
          }
          console.log(results);
      });
      //results를 testId_receive에 넣기
      io.emit('testId_receive', results); 
      connection.end();
      });


    client.on('receive1', (answer1) => { //player의 메시지 받고 (on:받는 함수)
      console.log('player a가 보낸 데이터: ', answer1);
      ///receive 발생했을때 서버에서의 반응
      io.emit('player_receive1', answer1);
    }); //emit: 메시지 보내는 함수

    client.on('receive2', (answer2) => {
      console.log('player b가 보낸 데이터: ', answer2);
      io.emit('player_receive2', answer2);
    });

    client.on('receive3', (answer3) => {
      console.log('player c가 보낸 데이터: ', answer3);
      io.emit('player_receive3', answer3);
    });
  }
}

module.exports = new Sockets();