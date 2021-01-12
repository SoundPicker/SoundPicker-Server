class Sockets {
  connection(client){
    console.log('CONNECTION');

    client.on('receive1', (answer1) => { //player의 메시지 받고 (on:받는 함수)
      console.log('player a가 보낸 데이터: ', answer1);
      
      //chooga
      // connection.query("INSERT INTO Score (UserId, content, score) VALUES (?, ?, ?)", [
      //   answer1.UserId, answer1.content, answer1.score
      // ], function() {});
      
      ///receive 발생했을때 서버에서의 반응
      io.emit('player_receive1', answer1);  //메시지를 모든 플레이어에게 보냄
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