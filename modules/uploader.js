const fs = require('fs');
const aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '/../config/s3.json');
const s3 = new aws.S3();

const uploadFile = async (fileName) => {
  const fileContent = fs.readFileSync(fileName);
  const params = {
    Bucket:'soundpicker-bucket',
    Key:fileName.split('/').pop(),
    Body:fileContent
  };
  s3.upload(params, (err, data)=>{
    if(err) throw err;
    console.log(`file upload successful - ${data.Location}`);
    return true;
  });
};

module.exports = uploadFile;