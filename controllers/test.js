const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');

// 모델 불러오기
const {User, Test, Question} = require('../models');

// youtube-mp3-downloader 관련
const Downloader = require('../modules/downloader');
const dl = new Downloader(); 

// mp3-cutter
const cutter = require('mp3-cutter');

// s3 uploader
const uploadFile = require('../modules/uploader');

const test = {



  /**
   * 테스트 목록 조회
   * @summary 카테고리에 해당하는 테스트 목록 조회하기
   * @param CategoryId
   * @return 테스트 목록
   */
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






  /**
   * 특정 테스트의 문제목록 조회
   * @summary 특정 테스트에 해당하는 문제들 조회하기
   * @param TestId
   * @return 해당 테스트의 문제목록
   */
  getSpecificTest : async(req,res) => {
    const TestId = req.params.TestId;
    
    try{
      let where = {id:TestId};
      const test = await Test.findOne({where});

      if(!test)
        return res.status(sc.BAD_REQUEST)
          .send(ut.fail(sc.BAD_REQUEST, rm.WRONG_INDEX));

      await Test.update({visitCount:test.visitCount+1}, {where});
      
      const order = [['questionNumber', 'asc']];
      const attributes = ['questionNumber', 'sound1URL', 'sound3URL', 'hint', 'answer', 'thumbnail', 'answerYoutubeURL'];
      where = {TestId};
      
      const questions = await Question.findAll({order, attributes, where});

      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.SUCCESS, questions));

    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.DB_ERROR));
    }
  },





  /**
   * 테스트 생성
   * @summary 테스트 생성하기
   * @param token, title, description, CategoryId, questions
   * @return 성공/실패 여부
   */
  createTest : async(req,res) => {
    const UserId = req.decoded.id;
    const {title, description, CategoryId, questions} = req.body;
    let i = questions.length;
    

    try{
      const test = await Test.create({
        title,description,CategoryId, UserId, questionCount:questions.length, visitCount:0
      });

      for(let question of questions){
        const {
          questionNumber,
          questionYoutubeURL,
          questionStartsfrom,
          hint,
          answer,
          answerYoutubeURL,
        } = question;
  
        
        dl.getMP3({videoId:questionYoutubeURL, name:questionYoutubeURL+'.mp3'}, async (err, result)=>{
          i--;
          if(err) throw err;
          console.log(`${i}개남음`);
          // console.log(result.file);

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
          console.log('커팅완료');
          await uploadFile(`${__dirname}/../audios/${questionYoutubeURL}3.mp3`);
          await uploadFile(`${__dirname}/../audios/${questionYoutubeURL}1.mp3`);
          console.log('업로드완료');
          await Question.create({
            hint,
            answer,
            questionYoutubeURL,
            questionStartsfrom,
            sound1URL:`${questionYoutubeURL}1.mp3`,
            sound3URL:`${questionYoutubeURL}3.mp3`,
            answerYoutubeURL,
            TestId:test.dataValues.id,
            questionNumber
          });
  
          console.log(`${questionNumber}번 DB저장 완료`);

          if(i == 0){
            return res.status(sc.OK).send(ut.success(sc.OK, rm.SUCCESS));
          }
        })
      }
      
    } catch(err){
      console.error(err);
      return res.status(sc.DB_ERROR)
        .send(ut.fail(sc.DB_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
  },


  /**
   * 테스트 수정
   * @summary 본인이 올린 테스트 수정하기
   * @param token, title, description, CategoryId, questions
   * @return 성공/실패 여부
   */
  updateTest : async(req,res) => {
    const UserId = req.decoded.id;
    const TestId = req.params.TestId;

    const {title, description, CategoryId, questions} = req.body;
    let i = questions.length;
    

    try{
      let where = {id:TestId};
      let attributes = ['UserId'];
      const test = await Test.findOne({attributes, where});
      if(!test)
        return res.status(sc.NOT_FOUND)
          .send(ut.fail(sc.NOT_FOUND, rm.WRONG_INDEX));
      
      if(test.UserId != UserId)
        return res.status(sc.UNAUTHORIZED)
          .send(ut.fail(sc.UNAUTHORIZED, rm.NO_PERMISSION));

      await Test.update({
        title,description,CategoryId, questionCount:questions.length
      }, {where:{id:TestId}});
      await Question.destroy({where:{TestId}});

      for(let question of questions){
        const {
          questionNumber,
          questionYoutubeURL,
          questionStartsfrom,
          hint,
          answer,
          answerYoutubeURL,
        } = question;
  
        
        dl.getMP3({videoId:questionYoutubeURL, name:questionYoutubeURL+'.mp3'}, async (err, result)=>{
          i--;
          if(err) throw err;
          console.log(`${i}개남음`);
          // console.log(result.file);

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
          console.log('커팅완료');
          await uploadFile(`${__dirname}/../audios/${questionYoutubeURL}3.mp3`);
          await uploadFile(`${__dirname}/../audios/${questionYoutubeURL}1.mp3`);
          console.log('업로드완료');
          await Question.create({
            hint,
            answer,
            questionYoutubeURL,
            questionStartsfrom,
            sound1URL:`${questionYoutubeURL}1.mp3`,
            sound3URL:`${questionYoutubeURL}3.mp3`,
            answerYoutubeURL,
            TestId,
            questionNumber
          });
  
          console.log(`${questionNumber}번 DB저장 완료`);

          if(i == 0){
            return res.status(sc.OK).send(ut.success(sc.OK, rm.SUCCESS));
          }
        })
      }
      
    } catch(err){
      console.error(err);
      return res.status(sc.DB_ERROR)
        .send(ut.fail(sc.DB_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
  },




  /**
   * 테스트 숨기기
   * @summary 본인이 올린 테스트 숨기기
   * @param token, title, description, CategoryId, questions
   * @return 성공/실패 여부
   */
  hideTest : async(req,res) => {
    const UserId = req.decoded.id;
    const TestId = req.params.TestId;
    const where = {id:TestId};
    const attributes = ['UserId'];

    try{
      const test = await Test.findOne({attributes, where});
      if(test.UserId != UserId)
        return res.status(sc.UNAUTHORIZED)
          .send(ut.fail(sc.UNAUTHORIZED, rm.NO_PERMISSION));
      const result = await Test.update({hidden:1}, {where});
      if(result[0] == 0)
        return res.status(sc.BAD_REQUEST)
          .send(ut.fail(sc.BAD_REQUEST, rm.WRONG_INDEX));


      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.SUCCESS));
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.DB_ERROR));
    }
  },





  /**
   * 테스트 상위6개 조회
   * @summary 조회수 상위 6개 테스트 조회
   * @param token, title, description, CategoryId, questions
   * @return 성공/실패 여부
   */
  getTestRecommendations : async(req,res) => {
    try{
      const where = {hidden:0};
      const order = [['visitCount', 'desc']];
      const attributes = ['id', 'title', 'description', 'questionCount'];
      const include = [{model:User, attributes:['nickname']}];

      const recommendedTests = await Test.findAll({include, attributes, where, order});
      
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.SUCCESS, recommendedTests));

    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.DB_ERROR));
    }
  },
};

module.exports = test;