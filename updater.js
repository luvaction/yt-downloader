const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { YOUTUBE_DL_PATH } = require("youtube-dl-exec/src/constants");

// 마지막 업데이트 시각 기록 파일.
// pm2 --watch 재시작 루프를 피하려고 프로젝트 밖(임시 디렉터리)에 둡니다.
const STATE_FILE = path.join(os.tmpdir(), "yt-downloader-ytdlp-update.json");

// 정기 점검 주기와, 다운로드 실패 후 강제 점검의 최소 간격
const ROUTINE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6시간
const FORCED_MIN_INTERVAL_MS = 30 * 60 * 1000; // 30분
const UPDATE_TIMEOUT_MS = 3 * 60 * 1000; // 3분

// 동시에 여러 요청이 들어와도 업데이트는 한 번만 실행되도록 공유합니다.
let inFlight = null;

function readLastCheck() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")).lastCheck || 0;
  } catch {
    return 0;
  }
}

function writeLastCheck(ts) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastCheck: ts }));
  } catch (err) {
    console.error("[yt-dlp] 업데이트 시각 기록 실패:", err.message);
  }
}

function runUpdate() {
  return new Promise((resolve) => {
    execFile(YOUTUBE_DL_PATH, ["--update"], { timeout: UPDATE_TIMEOUT_MS }, (err, stdout, stderr) => {
      const output = `${stdout || ""}${stderr || ""}`.trim();
      if (err) {
        // 업데이트 실패는 치명적이지 않습니다. 기존 바이너리로 계속 진행합니다.
        console.error("[yt-dlp] 업데이트 실패:", output || err.message);
        resolve(false);
        return;
      }
      const summary = output.split("\n").filter(Boolean).pop() || "완료";
      console.log(`[yt-dlp] ${summary}`);
      resolve(true);
    });
  });
}

/**
 * yt-dlp를 최신 상태로 유지합니다.
 * @param {object} options
 * @param {number} options.maxAgeMs - 이 시간 안에 이미 점검했다면 건너뜁니다.
 * @returns {Promise<boolean>} - 실제로 업데이트를 실행했으면 true
 */
function ensureYtDlpFresh({ maxAgeMs = ROUTINE_INTERVAL_MS } = {}) {
  if (inFlight) return inFlight;

  if (Date.now() - readLastCheck() < maxAgeMs) {
    return Promise.resolve(false);
  }

  inFlight = runUpdate()
    .then((ok) => {
      writeLastCheck(Date.now());
      return ok;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/**
 * 서버가 오래 떠 있어도 주기적으로 업데이트되도록 타이머를 겁니다.
 */
function scheduleYtDlpUpdates() {
  ensureYtDlpFresh();
  const timer = setInterval(() => ensureYtDlpFresh(), ROUTINE_INTERVAL_MS);
  timer.unref(); // 이 타이머 때문에 프로세스가 종료되지 못하는 일은 없도록
  return timer;
}

module.exports = { ensureYtDlpFresh, scheduleYtDlpUpdates, FORCED_MIN_INTERVAL_MS };
