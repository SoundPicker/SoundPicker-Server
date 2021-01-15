const ut = require('../modules/util');
const rm = require('../modules/responseMessage');
const sc = require('../modules/statusCode');

// 모델 불러오기
const {User, Test, Question, Sequelize, Category, Log} = require('../models');

// youtube-mp3-downloader 관련
const downloader = require('../modules/downloader');

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
      let where = {hidden:0, generated:1};
      if(CategoryId) where['CategoryId'] = CategoryId;
      const order = [['visitCount', 'desc']];
      const attributes = ['id', 'title', 'description', 'questionCount'];
      const include = [{model:User, attributes:['nickname']}, {model:Category, attributes:['id']}];

      const tests = await Test.findAll({include, attributes, where, order});
      
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.GET_TESTS_SUCCESS, tests));

    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
  },






  /**
   * 특정 테스트의 문제목록 조회 - 테스트 플레이 할 때
   * @summary 특정 테스트에 해당하는 문제들 조회하기
   * @param TestId
   * @return 해당 테스트의 문제목록
   */
  getSpecificTest : async(req,res) => {
    const TestId = req.params.TestId;
    
    try{
      let where = {id:TestId};
      const test = await Test.findOne({where});

      if(!test) // 삭제되었을때, 생성안되었을때도 일단 조회는 되게 함. 
        return res.status(sc.BAD_REQUEST)
          .send(ut.fail(sc.BAD_REQUEST, rm.WRONG_INDEX));

      await Test.update({visitCount:test.visitCount+1}, {where});
      await Log.create({type:1});
      const order = [['questionNumber', 'asc']];
      const attributes = ['questionNumber', 'sound1URL', 'sound3URL', 'hint', 'answer', 'thumbnail', 'answerYoutubeURL'];
      where = {TestId};
      
      let questions = await Question.findAll({order, attributes, where});
      for(let question of questions){
        question.sound1URL = 'https://soundpicker-bucket.s3.ap-northeast-2.amazonaws.com/'+question.sound1URL;
        question.sound3URL = 'https://soundpicker-bucket.s3.ap-northeast-2.amazonaws.com/'+question.sound3URL;
        question.dataValues.testTitle = test.title;
      }
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.GET_QUESTIONS_SUCCESS, questions));
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
  },




  /**
   * 특정 테스트의 문제목록 조회 - 수정뷰용
   * @summary 특정 테스트에 해당하는 문제들 조회하기
   * @param TestId
   * @return 해당 테스트의 문제목록
   */
  getSpecificTestBeforeUpdate : async(req,res) => {
    const TestId = req.params.TestId;
    
    try{
      let where = {id:TestId};
      const test = await Test.findOne({where});

      if(!test) // 삭제되었을때, 생성안되었을때도 일단 조회는 되게 함. 
        return res.status(sc.BAD_REQUEST)
          .send(ut.fail(sc.BAD_REQUEST, rm.WRONG_INDEX));

      await Test.update({visitCount:test.visitCount+1}, {where});
      
      const order = [['questionNumber', 'asc']];
      const attributes = ['questionNumber', 'questionYoutubeURL', 'questionStartsfrom', 'hint', 'answer', 'answerYoutubeURL'];
      where = {TestId};
      
      let questions = await Question.findAll({order, attributes, where});
      for(let question of questions){
        question.dataValues.testTitle = test.title;
      }
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.GET_QUESTIONS_SUCCESS, {test:{title:test.title, description:test.description, CategoryId:test.CategoryId}, questions}));
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
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
    

    try{
      // 테스트를 먼저 만들고
      const test = await Test.create({
        title,description,CategoryId, UserId, questionCount:questions.length, visitCount:0
      });
      
      let videoDatas= {}; // videos 들어가기 전 데이터를 뽑아낼 json
    
      let TestId=test.dataValues.id;
      for(let question of questions){
        const {
          questionNumber,
          questionYoutubeURL,
          questionStartsfrom,
        } = question;

        if(videoDatas.hasOwnProperty(questionYoutubeURL)){ // url 있는경우 시간만 넣어주자
          videoDatas[questionYoutubeURL].push([questionNumber, questionStartsfrom]);
        } else{
          videoDatas[questionYoutubeURL] =[[questionNumber, questionStartsfrom]];
        }
      }

      let videos = [];
      // 자 그러면 비디오데이터에 다 들어간 상태겠지.
      for(let i in videoDatas){
        let slices = [];
        for(let number_startTime of videoDatas[i]){
          slices.push(
            {
              start:new Date(number_startTime[1] * 1000).toISOString().substr(11, 8),
              end:new Date((number_startTime[1]+3) * 1000).toISOString().substr(11, 8),
              tags:{title:`t${TestId}q${number_startTime[0]}s3`}
            },
            {
              start:new Date(number_startTime[1] * 1000).toISOString().substr(11, 8),
              end:new Date((number_startTime[1]+1) * 1000).toISOString().substr(11, 8),
              tags:{title:`t${TestId}q${number_startTime[0]}s1`}
            }
          );
        }
        
        videos.push({
          url:`https://www.youtube.com/watch?v=${i}`,
          quality:'128k',
          slices:slices
        });
      }
      // console.log(JSON.stringify(videos,null,2));
      downloader.generateDownloader(videos, questions, TestId, title, UserId).run();


      return res.status(sc.OK).send(ut.success(sc.OK, rm.CREATE_TEST_SUCCESS));
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
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
        title,description,CategoryId, questionCount:questions.length, generated:0
      }, {where:{id:TestId}});
      await Question.destroy({where:{TestId}});
      let videoDatas= {}; // videos 들어가기 전 데이터를 뽑아낼 ㅓson
      for(let question of questions){
        const {
          questionNumber,
          questionYoutubeURL,
          questionStartsfrom,
        } = question;

        if(videoDatas.hasOwnProperty(questionYoutubeURL)){ // url 있는경우 시간만 넣어주자
          videoDatas[questionYoutubeURL].push([questionNumber, questionStartsfrom]);
        } else{
          videoDatas[questionYoutubeURL] =[[questionNumber, questionStartsfrom]];
        }
      }

      let videos = [];
      // 자 그러면 비디오데이터에 다 들어간 상태겠지.
      for(let i in videoDatas){
        let slices = [];
        for(let number_startTime of videoDatas[i]){
          slices.push(
            {
              start:new Date(number_startTime[1] * 1000).toISOString().substr(11, 8),
              end:new Date((number_startTime[1]+3) * 1000).toISOString().substr(11, 8),
              tags:{title:`t${TestId}q${number_startTime[0]}s3`}
            },
            {
              start:new Date(number_startTime[1] * 1000).toISOString().substr(11, 8),
              end:new Date((number_startTime[1]+1) * 1000).toISOString().substr(11, 8),
              tags:{title:`t${TestId}q${number_startTime[0]}s1`}
            }
          );
        }
        
        videos.push({
          url:`https://www.youtube.com/watch?v=${i}`,
          quality:'128k',
          slices:slices
        });
      }
      // console.log(JSON.stringify(videos,null,2));
      downloader.generateDownloader(videos, questions, TestId, title, UserId).run();
      return res.status(sc.OK).send(ut.success(sc.OK, rm.UPDATE_TEST_SUCCESS));
      
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.fail(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
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
        .send(ut.success(sc.OK, rm.HIDE_TEST_SUCCESS));
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
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
      // 전체 테스트가 6개 미만인 경우엔 에러뜸.
      const order = [['visitCount', 'desc'], [Sequelize.literal('finishCount/visitCount'), 'desc']]; // 1. 조회수순 2.완주율순으로
      const attributes = ['id', 'title', 'description', 'questionCount', 'visitCount', 'finishCount'];
      const include = [{model:User, attributes:['nickname']}];
      let where = {hidden:0, generated:1};
      const recommendedTests = await Test.findAll({include, attributes, where, order, limit:6}); // 6개 조회
      
      return res.status(sc.OK)
        .send(ut.success(sc.OK, rm.GET_TESTS_SUCCESS, recommendedTests));

    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
  },

  /**
   * 테스트 상위6개 조회 (미들웨어)
   * @summary 조회수 상위 6개 테스트 조회
   * @param token, title, description, CategoryId, questions
   * @return 성공/실패 여부
   */
  finishTest : async(req,res, next) => {
    try{
      const {TestId}  = req.params; // 쿼리스트링에서 TestId를 받은 후
      // console.log(TestId);
      if(TestId){
        let where = {id:TestId}; // where 설정
        const test = await Test.findOne({where}); // 해당 아이디의 test를 찾은 후

        await Test.update({finishCount:test.finishCount+1}, {where}); // finishCount를 하나 올려준 다음에
      } else{
        return res.status(sc.BAD_REQUEST)
          .send(ut.fail(sc.BAD_REQUEST, rm.WRONG_INDEX));
      }

      next(); // 다음 미들웨어로 넘어감.
      
    } catch(err){
      console.error(err);
      return res.status(sc.INTERNAL_SERVER_ERROR)
        .send(ut.success(sc.INTERNAL_SERVER_ERROR, rm.INTERNAL_SERVER_ERROR));
    }
  },
};

module.exports = test;
