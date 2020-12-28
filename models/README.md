# db 스키마

## user
* user_id : INT(11)
* email : VARCHAR(50)
* password : VARCHAR(200)
* nickname : VARCHAR(50)

## test
* test_id : INT(11)
* category_id : INT(11)
* user_id : INT(11)
* title : VARCHAR(50)
* description : VARCHAR(200)
* questionCount : INT(11)
* visitCount : INT(11)

## question
* question_id : INT(11)
* test_id : INT(11)
* hint : INT(11)
* answer : VARCHAR(200)
* thumbnail : VARCHAR(512)
* questionYoutubeUrl : VARCHAR(512)
* questionStartsFrom : INT(11)
* sound1Url : VARCHAR(512)
* sound3Url : VARCHAR(512)
* answerYoutubeUrl : VARCHAR(512)
* answerStartsFrom : INT(11)

## category
* category_id : INT(11)
* thumbnailUrl : VARCHAR(512)
* description : VARCHAR(200)

## 기타사항
* 랜덤문구는 프론트에서 처리한다고 했으니 따로 반영 X