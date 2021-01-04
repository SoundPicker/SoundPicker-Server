# SoundPicker-Server
🎧 소리로 하는 모든 즐거움, 사운드피커 서버 저장소 🎧🎵🎶

## **📑 API 명세서**

- **[API 명세서 ](https://github.com/SoundPicker/SoundPicker-Server/wiki)**  


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
(추가예정)
<!--<img width="50%" alt="스크린샷 2020-12-17 오전 4 01 20" src="https://user-images.githubusercontent.com/29622782/102395643-c5ffbc00-401e-11eb-9707-721974bb098c.png">-->
<!--<img width="550" src="https://user-images.githubusercontent.com/66619693/103537836-718e8480-4ed8-11eb-91ef-6dd32bd6c01c.PNG"//캡처--> 

<br>

## **🌎 Team Role**

### 🙋‍♂️ 강준우
- /test api 구현

### 🙋‍♀️ 홍혜림
- /user api 구현

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
