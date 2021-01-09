var YoutubeMp3Downloader = require("youtube-mp3-downloader");
const ffmpegPath = require('../config/ffmpegPath');

var Downloader = function () {
  var self = this;

  //Configure YoutubeMp3Downloader with your settings
  self.YD = new YoutubeMp3Downloader({
    ffmpegPath,
    outputPath: `${__dirname}/../audios`, // Output file location (default: the home directory)
    // youtubeVideoQuality: "highestaudio", // Desired video quality (default: highestaudio)
    queueParallelism: 1, // Download parallelism (default: 1)
    // progressTimeout: 2000, // Interval in ms for the progress reports (default: 1000)
    // outputOptions: ["-af", "silenceremove=1:0:-50dB"], // Additional output options passend to ffmpeg
  });

  self.callbacks = {};

  self.YD.on("finished", function (error, data) {
    if (self.callbacks[data.file]) {
      self.callbacks[data.file](error, data);
    } else {
      console.log("Error: No callback for videoId!");
    }
  });

  self.YD.on("error", function (error, data) {
    console.error(error);
    console.log(data);

    // if (self.callbacks[data.videoId]) {
    //   self.callbacks[data.videoId](error, data);
    // } else {
    //   console.log("Error: No callback for videoId!");
    // }
  });
};

Downloader.prototype.getMP3 = function (track, callback) {
  var self = this;

  // Register callback
  console.log(track);
  self.callbacks[`${__dirname}/../audios/${track.name}`] = callback;
  // Trigger download
  self.YD.download(track.videoId, track.name);
};

module.exports = Downloader;
