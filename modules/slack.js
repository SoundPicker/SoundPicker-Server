const Slack = require('slack-node');
const webhookUri = require('../config/slack');

const slack = new Slack();
slack.setWebhook(webhookUri);

const sendSlackMessage = async(message) => {
  slack.webhook({
    channel: "#03_01-알림",
    username: "사픽봇",
    text: message
  }, (err, res)=>{
    if(err) console.error(err);
  })
}

module.exports = sendSlackMessage;