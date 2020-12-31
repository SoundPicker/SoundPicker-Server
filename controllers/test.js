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

const uploadFile = (fileName) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket:'soundpicker-bucket',
    Key:'hi.mp3',
    Body:fileContent
  };
  s3.upload(params, (err, data)=>{
    if(err) throw err;
    console.log(`file upload successful - ${data.Location}`);
  })
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
      const test = await Question.findAll({where:{TestId}});
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.SUCCESS, test));

    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.DB_ERROR));
    }
  },




  createTest : async(req,res) => {
    const {questionYoutubeUrl} = req.body;
    
    const yd = new YD({
      'ffmpegPath':'/usr/local/bin/ffmpeg',
      'outputPath':'/Users/brian/Downloads/ffmpeg'
    })

    try{
      // 속도개선 & 여러 문제에 대해 처리 필요!
      yd.download('Vhd6Kc4TZls', 'hi.mp3');
      yd.on('finished', (err, data)=>{
        console.log(data);
        cutter.cut({
          src:'/Users/brian/Downloads/ffmpeg/hi.mp3',
          target:'/Users/brian/Downloads/ffmpeg/bye.mp3',
          start:3,
          end:5
        });
        
        uploadFile('/Users/brian/Downloads/ffmpeg/bye.mp3');
        return res.status(sc.OK)
          .send(ut.success(sc.OK, rm.SUCCESS));
        
      });

      yd.on('error', (err)=>{throw err;});
      yd.on('progress', (progress)=>console.log(progress));
    } catch(err){
      console.error(err);
      return res.status(sc.DB_ERROR)
        .send(ut.fail(sc.DB_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
    
    

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