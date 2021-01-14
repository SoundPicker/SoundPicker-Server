import YoutubeMP3 from "@jeromeludmann/youtubemp3";

const downloader = {
  generateDownloader : (videos)=>{
    const youtubeMp3 = new YoutubeMP3({
      output:`${__dirname}/../audios/v2/`,
      videos,
      // videos:[
      //   {
      //     url:'https://asdf',
      //     quality:'128k',
      //     slices:[
      //       {
      //         start:'00:00:00',
      //         end:'00:00:01'
      //       },
      //       {
      //         start:'00:00:00',
      //         end:'00:00:03'
      //       }
      //     ]
      //   }
      // ]
    });
    youtubeMp3.on("downloading", (videoId, outputLine) => {
      console.log(`Downloading Youtube video ID ${videoId}: ${outputLine}`);
    });
    
    youtubeMp3.on("encoding", (videoId, outputLine) => {
      console.log(`Encoding Youtube video ID ${videoId}: ${outputLine}`);
    });
    
    youtubeMp3.on("downloaded", (videoId, success) => {
      console.log(`Youtube video ID ${videoId} downloaded with success`);
      
    });
    
    youtubeMp3.on("encoded", (videoId, success) => {
      console.log(`Youtube video ID ${videoId} encoded with success`);
    });
    
    youtubeMp3.on("error", (videoId, err) => {
      console.error(err);
    });

    return youtubeMp3;
  }
}

module.exports = downloader;