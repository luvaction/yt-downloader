const youtubedl = require("youtube-dl-exec");
const os = require("os");
const path = require("path");
const fs = require("fs");

/**
 * 주어진 유튜브 URL을 임시 파일로 다운로드합니다.
 * @param {string} videoUrl - 유튜브 영상 URL
 * @param {object} options - 추가 옵션 (예: extractAudio, audioFormat, mergeOutputFormat 등)
 * @returns {Promise<string>} - 다운로드 완료된 임시 파일 경로
 */
function downloadToTempFile(videoUrl, options = {}) {
  return new Promise((resolve, reject) => {
    // 확장자는 audioFormat이 mp3인 경우 mp3, 아니면 mp4로 설정
    let ext = "mp4";
    if (options.extractAudio && options.audioFormat === "mp3") {
      ext = "mp3";
    }
    const tmpDir = os.tmpdir();
    const outputFile = path.join(tmpDir, `yt-download-${Date.now()}.${ext}`);
    const opts = { output: outputFile, ...options };
    youtubedl(videoUrl, opts)
      .then(() => {
        if (fs.existsSync(outputFile)) {
          resolve(outputFile);
        } else {
          reject(new Error("파일이 생성되지 않았습니다."));
        }
      })
      .catch(reject);
  });
}

/**
 * (참고용) 유튜브 영상의 제목을 가져옵니다.
 * @param {string} videoUrl - 유튜브 영상 URL
 * @returns {Promise<string>} - 영상 제목
 */
function getVideoTitle(videoUrl) {
  return youtubedl(videoUrl, { getTitle: true });
}

module.exports = { downloadToTempFile, getVideoTitle };
