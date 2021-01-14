const socket = io();  //서버에서 오픈한 socket 서버 접속

function click() {
  console.log('click');
  socket.emit('testId_receive', document.getElementById("test_id").value);
  document.getElementById("test_id").value="";
}

//on: 메시지 받는 함수,
socket.on('testId_receive', (test_id) => {
  //text_box에 넣기
  document.getElementById("text_box").value = test_id;
});




function submit1() {
  //emit: 메시지 보내는 함수, receive라는 서버에서 설정한 이름을 통해 그곳으로 메시지 보냄
  console.log('submit1');
  socket.emit('receive1', document.getElementById("answer1").value);
  //메시지 보냈을때 현재 입력된 메시지를 초기화
  document.getElementById("answer1").value="";
}
socket.on('player_receive1', (answer1) => {
  document.getElementById("a1").value = answer1;
});

function submit2() {
  console.log('submit2');
  const value = document.getElementById("answer2").value;
  socket.emit('receive2', value);
  document.getElementById("answer2").value="";
}
socket.on('player_receive2', (answer2) => {
  document.getElementById("a2").value = answer2;
});

function submit3() {
  console.log('submit3');
  socket.emit('receive3', document.getElementById("answer3").value);
  document.getElementById("answer3").value="";
}
socket.on('player_receive3', (answer3) => {
  document.getElementById("a3").value = answer3;
});