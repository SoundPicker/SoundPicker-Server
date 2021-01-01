const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');

const {User, Test, Question} = require('../models');

const YD = require('youtube-mp3-downloader');
const cutter = require('mp3-cutter');
const fs = require('fs');
const aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '/../config/s3.json');
const s3 = new aws.S3();

const uploadFile = async (fileName) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket:'soundpicker-bucket',
    Key:Date.now()+'.'+fileName.split('.').pop(),
    Body:fileContent
  };
  s3.upload(params, (err, data)=>{
    if(err) throw err;
    console.log(`file upload successful - ${data.Location}`);
    return true;
  });
  
};

const test = {



  getTests : async(req,res) => {
    const CategoryId = req.query.category;
    try{
      let where = {hidden:0};
      if(CategoryId) where['CategoryId'] = CategoryId;
      const order = [['visitCount', 'desc']];
      const attributes = ['id', 'title', 'description', 'questionCount'];
      const include = [{model:User, attributes:['nickname']}];

      const tests = await Test.findAll({include, attributes, where, order});
      
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.SUCCESS, tests));

    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.DB_ERROR));
    }
  },




  getSpecificTest : async(req,res) => {
    const TestId = req.params.TestId;
    
    try{
      const order = [['questionNumber', 'asc']];
      const attributes = ['questionNumber', 'sound1URL', 'sound3URL', 'hint', 'answer', 'thumbnail', 'answerYoutubeURL', 'answerStartsfrom'];
      const where = {TestId};
      
      const test = await Question.findAll({order, attributes, where});
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.SUCCESS, test));

    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.DB_ERROR));
    }
  },




  createTest : async(req,res) => {
    const UserId = 16;
    
    let yd = new YD({
      'ffmpegPath':'/usr/local/bin/ffmpeg',
      'outputPath':`${__dirname}/../audios`
    });

    const {title, description, CategoryId, questions} = req.body;

    

    try{
      const test = await Test.create({
        title,description,CategoryId, UserId, questionCount:questions.length, visitCount:0
      });
      const processQuestions = async(questions)=>{
        for(let question of questions){
          console.log(question);
          const {
            questionNumber,
            questionYoutubeURL,
            questionStartsfrom,
            hint,
            answer,
            answerYoutubeURL,
            answerStartsfrom
          } = question;
    
          console.log(`${questionYoutubeURL} 다운로드 하려고 하는데..`);
          yd.download(questionYoutubeURL, `${questionYoutubeURL}.mp3`);
          yd.on('finished', async (err, data)=>{
            console.log(`${questionNumber}번째 영상 다운로드 완료`);
            console.log(data);
            cutter.cut({
              src:`${__dirname}/../audios/${questionYoutubeURL}.mp3`,
              target:`${__dirname}/../audios/${questionYoutubeURL}3.mp3`,
              start:questionStartsfrom,
              end:questionStartsfrom + 3
            }); // 기본적으로 동기함수
            console.log(`${questionNumber}번째 영상 3초컷 완료`);
            cutter.cut({
              src:`${__dirname}/../audios/${questionYoutubeURL}3.mp3`,
              target:`${__dirname}/../audios/${questionYoutubeURL}1.mp3`,
              start:0,
              end:1
            }); // 기본적으로 동기함수
            console.log(`${questionNumber}번째 영상 1초컷 완료`);
            await uploadFile(`${__dirname}/../audios/${questionYoutubeURL}3.mp3`);
            await uploadFile(`${__dirname}/../audios/${questionYoutubeURL}1.mp3`);
  
            console.log(`${questionNumber}번째 mp3 업로드 완료`);
  
            await Question.create({
              hint,
              answer,
              questionYoutubeURL,
              questionStartsfrom,
              sound1URL:`${questionYoutubeURL}1.mp3`,
              sound3URL:`${questionYoutubeURL}3.mp3`,
              answerYoutubeURL,
              answerStartsfrom,
              TestId:test.id,
              questionNumber
            });
    
            console.log(`${questionNumber}번 DB저장 완료`);
          });
          yd.on('error', (err)=>{throw err;});
          yd.on('progress', (progress)=>console.log(progress));
          
        }
      };
      const result = await processQuestions(questions);
      if(result) return res.status(sc.OK).send(ut.success(sc.OK, rm.SUCCESS));
    } catch(err){
      console.error(err);
      return res.status(sc.DB_ERROR)
        .send(ut.fail(sc.DB_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
    
    
    

    // try{
    //   // 속도개선 & 여러 문제에 대해 처리 필요!
    //   yd.download('Vhd6Kc4TZls', '~/hi.mp3'); // 물결인덱싱 안먹는 것 확인.
    //   yd.on('finished', (err, data)=>{
    //     console.log(data);
    //     cutter.cut({
    //       src:'~/hi.mp3',
    //       target:'~/bye.mp3',
    //       start:3,
    //       end:5
    //     });
        
    //     uploadFile('~/bye.mp3');
    //     return res.status(sc.OK)
    //       .send(ut.success(sc.OK, rm.SUCCESS));
        
    //   });

    //   yd.on('error', (err)=>{throw err;});
    //   yd.on('progress', (progress)=>console.log(progress));
    // } catch(err){
    //   console.error(err);
    //   return res.status(sc.DB_ERROR)
    //     .send(ut.fail(sc.DB_ERROR, rm.INTERNAL_SERVER_ERROR));
    // }
    
    

  },



  // 해당 TestId에 해당하는 test&questions 업데이트
  // TODO : createTest 작성 후 ㄱㄱ.
  updateTest : async(req,res) => {
    const TestId = req.params.TestId;
  },




  // 해당 TestId에 해당하는 test의 hidden값 1로 만들기
  hideTest : async(req,res) => {
    const TestId = req.params.TestId;

    try{
      await Test.update({hidden:1}, {where:{id:TestId}});

      return res.status(sc.OK)
        .send(ut.success(sc.OK, "숨기기 성공"));
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.DB_ERROR));
    }
  },





  // 조회수 상위 6개 추천
  getTestRecommendations : async(req,res) => {
    const recommendedTests = await Test.findAll({where:{hidden:0}, order:[['visitCount', 'desc']], limit:3});
    return res.status(sc.OK)
      .send(ut.success(sc.OK, rm.success, recommendedTests));
  },
};

module.exports = test;