const youtubedl = require("youtube-dl-exec");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { ensureYtDlpFresh, FORCED_MIN_INTERVAL_MS } = require("./updater");

// yt-dlp가 YouTube 서명 챌린지를 풀려면 JS 런타임이 필요합니다.
// (없으면 android_vr 클라이언트로 폴백해 HTTP 403이 발생)
const BASE_OPTIONS = { jsRuntimes: "node" };

// YouTube 쪽 변경으로 yt-dlp가 낡아서 나는 실패들.
// 이 경우에는 yt-dlp를 최신으로 올리면 대개 해결됩니다.
const STALE_YTDLP_ERRORS = [
  /HTTP Error 403/i,
  /Requested format is not available/i,
  /unable to download video data/i,
  /Only images are available/i,
  /The page needs to be reloaded/i,
  /Failed to extract any player response/i,
  /nsig extraction failed/i,
  /Sign in to confirm/i,
];

function looksLikeStaleYtDlp(err) {
  const message = `${err.message || ""}\n${err.stderr || ""}`;
  return STALE_YTDLP_ERRORS.some((pattern) => pattern.test(message));
}

/**
 * 주어진 유튜브 URL을 임시 파일로 다운로드합니다.
 * 실패가 yt-dlp 노후화 때문으로 보이면 업데이트 후 한 번 재시도합니다.
 * @param {string} videoUrl - 유튜브 영상 URL
 * @param {object} options - 추가 옵션 (예: extractAudio, audioFormat, mergeOutputFormat 등)
 * @returns {Promise<string>} - 다운로드 완료된 임시 파일 경로
 */
async function downloadToTempFile(videoUrl, options = {}) {
  // 확장자는 audioFormat이 mp3인 경우 mp3, 아니면 mp4로 설정
  let ext = "mp4";
  if (options.extractAudio && options.audioFormat === "mp3") {
    ext = "mp3";
  }
  const tmpDir = os.tmpdir();
  const outputFile = path.join(tmpDir, `yt-download-${Date.now()}.${ext}`);
  const opts = { output: outputFile, ...BASE_OPTIONS, ...options };

  try {
    await youtubedl(videoUrl, opts);
  } catch (err) {
    if (!looksLikeStaleYtDlp(err)) throw err;

    console.warn("[yt-dlp] 다운로드 실패, 업데이트 후 재시도합니다:", err.message);
    const updated = await ensureYtDlpFresh({ maxAgeMs: FORCED_MIN_INTERVAL_MS });
    if (!updated) throw err; // 방금 점검했는데도 실패라면 그대로 전달

    await youtubedl(videoUrl, opts);
  }

  if (!fs.existsSync(outputFile)) {
    throw new Error("파일이 생성되지 않았습니다.");
  }
  return outputFile;
}

/**
 * (참고용) 유튜브 영상의 제목을 가져옵니다.
 * @param {string} videoUrl - 유튜브 영상 URL
 * @returns {Promise<string>} - 영상 제목
 */
function getVideoTitle(videoUrl) {
  return youtubedl(videoUrl, { getTitle: true, ...BASE_OPTIONS });
}

module.exports = { downloadToTempFile, getVideoTitle };
