# SoundPicker-Server
🎧 소리로 하는 모든 즐거움, 사운드피커 서버 저장소 🎧🎵🎶

<br>

## **🗺️ View**
<div>
  <img width="300" img height="210" src="https://user-images.githubusercontent.com/66619693/103541561-f381ac00-4ede-11eb-9632-eabfea8d3ca7.PNG">
  <img width="300" img height="210" src="https://user-images.githubusercontent.com/66619693/103541840-56734300-4edf-11eb-829e-c8013e431bec.PNG">
  <img width="300" img height="210" src="https://user-images.githubusercontent.com/66619693/103542171-e618f180-4edf-11eb-9eaf-6423b72e258c.PNG">
  <img width="300" img height="210" src="https://user-images.githubusercontent.com/66619693/103542266-0c3e9180-4ee0-11eb-8bc2-989f13bde6af.PNG">
  <img width="300" img height="210" src="https://user-images.githubusercontent.com/66619693/103542483-5758a480-4ee0-11eb-9d60-ecc9dafa9a92.PNG">
</div>

<br>

## **📑 API 명세서**

- **[API 명세서](https://github.com/SoundPicker/SoundPicker-Server/wiki)**  


<br>
  
## ✔ **models/index.js**

```jsx
db.Category = require('./category')(sequelize, Sequelize);
db.Question = require('./question')(sequelize, Sequelize);
db.Test = require('./test')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);

// category : test = 1 : N
db.Category.hasMany(db.Test);
db.Test.belongsTo(db.Category);

// user : test = 1 : N
db.User.hasMany(db.Test);
db.Test.belongsTo(db.User);

// test : question = 1 : N
db.Test.hasMany(db.Question);
db.Question.belongsTo(db.Test);
```

<br>

## **📙 DB ERD**
<img width="50%" alt="스크린샷 2020-12-17 오전 4 01 20" src="https://user-images.githubusercontent.com/29622782/103537017-e8c31900-4ed6-11eb-8779-e13f392ea3fa.png">

<br>

## **📗 Architecture**
![image](https://user-images.githubusercontent.com/29622782/133400206-0a86ce5d-9d76-4611-b4b1-2fe55aa311dd.png)


<br>

## **📑 핵심 기능**

### 테스트 제작
로그인한 사용자는 주제를 정해 여러 문항으로 이루어진 1초&3초 듣기 테스트를 만들 수 있습니다. 사용자는 직접 mp3파일을 업로드하지 않고, 유튜브 Url과 시작시간을 입력하게 되는데 이 때 서버에서 변환과정이 이루어지게 됩니다.

### 테스트 플레이
사용자는 사운드피커에 올라와 있는 모든 테스트들을 직접 플레이할 수 있습니다. 각 테스트들은 카테고리별, 검색어별로 나누어서 볼 수 있습니다.
<br>

## **🌎 Team Role**

### 🙋‍♂️ 강준우
#### /test api 구현
* 테스트 및 문제 조회 기능
* 테스트 및 문제 생성/수정/삭제 기능
* 유튜브 mp3 변환 및 자르기 기능


### 🙋‍♀️ 홍혜림
#### /user api 구현
* 유저 로그인, 회원가입 기능
* 유저정보 변경 및 중복확인 기능
* 마이페이지 조회 기능
<br>

## **📘 Package**

사용 패키지(모듈)은 다음과 같습니다.

```
"dependencies": {
    "aws-sdk": "^2.819.0",
    "cookie-parser": "~1.4.4",
    "debug": "~2.6.9",
    "express": "~4.16.1",
    "http-errors": "~1.6.3",
    "jade": "~1.11.0",
    "jsonwebtoken": "^8.5.1",
    "morgan": "~1.9.1",
    "mp3-cutter": "^1.0.6",
    "multer": "^1.4.2",
    "multer-s3": "^2.9.0",
    "mysql2": "^2.2.5",
    "sequelize": "^6.3.5",
    "sequelize-cli": "^6.2.0",
    "youtube-dl": "^3.0.2",
    "youtube-mp3-downloader": "^0.7.6",
    "ytdl-core": "^4.3.0"
  }
```
