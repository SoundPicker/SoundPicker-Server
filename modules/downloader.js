import YoutubeMP3 from "@jeromeludmann/youtubemp3";
import uploadFile from "./uploader";
import {Question, Test} from "../models";
import sendSlackMessage from "../modules/slack";
import {userService} from "../service";

const downloader = {
  generateDownloader : (videos, questions, TestId, title, UserId)=>{
    let mp3list = [];
    let mp3Count = questions.length*2;

    const youtubeMp3 = new YoutubeMP3({
      output:`${__dirname}/../audios/v2/`,
      videos
    });

    youtubeMp3.on("downloading", (videoId, outputLine) => {
      console.log(`Downloading Youtube video ID ${videoId}: ${outputLine}`);
    });
    
    youtubeMp3.on("encoding", (videoId, outputLine) => {
      console.log(`Encoding Youtube video ID ${videoId}: ${outputLine}`);
    });
    
    youtubeMp3.on("downloaded", (videoId, success) => {
      console.log(`Youtube video ID ${videoId} downloaded with success`);
    });
    
    youtubeMp3.on("encoded", (videoId, success) => {
      console.log(`Youtube video ID ${videoId} encoded with success`);
      console.log('success message is ...');
      console.log(success); // 여기에 리스트 형태로 mp3 파일이 들어감. 첫번째가 3초 두번째가 1초
      mp3list.push(...success);
      mp3Count -= success.length;
      console.log(`남은 mp3Count는 ${mp3Count}개`);
      if(mp3Count == 0){
        // mp3list가 순서대로 들어간다는 가정 하에 작업 ㅎㅎ.
        (async()=>{
          console.log('mp3list는');
          console.log(mp3list);
          console.log('questions는');
          console.log(questions);
          let i=0;
          for(let question of questions){
            const {
              questionNumber,
              questionYoutubeURL,
              questionStartsfrom,
              hint,
              answer,
              answerYoutubeURL,
            } = question;

            await uploadFile(mp3list[i]);
            await uploadFile(mp3list[i+1]);
            await Question.create({
              hint,
              answer,
              questionYoutubeURL,
              questionStartsfrom,
              sound3URL:mp3list[i].split('-').pop().trim(),
              sound1URL:mp3list[i+1].split('-').pop().trim(),
              answerYoutubeURL,
              questionNumber,
              TestId
            });

            i+=2;
          }
          let where = {id:TestId};
          await Test.update({generated:1}, {where});
          console.log('완벽히 생성 성공!');
          const nickname = await userService.getNickname(UserId);
          sendSlackMessage(`${nickname} 유저의 "${title}" 테스트가 생성되었습니다🎵`);
        })();
      }
    });
    
    youtubeMp3.on("error", (videoId, err) => {
      console.error(err);
    });

    return youtubeMp3;
  }
}

module.exports = downloader;