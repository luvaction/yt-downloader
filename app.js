// app.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { downloadToTempFile, getVideoTitle } = require("./downloader");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * 파일명에 사용할 수 없는 문자를 제거하는 함수
 */
function sanitizeFilename(name) {
  return name.replace(/[\r\n"]/g, "").replace(/[\/\\:*?"<>|]/g, "");
}

app.post("/download", async (req, res) => {
  const { videoUrl, downloadType, filename } = req.body;
  let ext, options;
  if (downloadType === "mp3") {
    ext = "mp3";
    options = { noPlaylist: true, extractAudio: true, audioFormat: "mp3" };
  } else if (downloadType === "mp4") {
    ext = "mp4";
    // mergeOutputFormat 옵션을 추가하여 비디오와 오디오 스트림을 병합합니다.
    options = { noPlaylist: true, format: "bestvideo+bestaudio", mergeOutputFormat: "mp4" };
  } else {
    return res.status(400).json({ error: "다운로드 유형을 선택해주세요." });
  }

  try {
    let fileName = filename && filename.trim() ? sanitizeFilename(filename.trim()) : "downloaded_file";
    const downloadFilename = `${fileName}.${ext}`;
    res.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodeURIComponent(downloadFilename));
    res.setHeader("Content-Type", downloadType === "mp3" ? "audio/mpeg" : "video/mp4");

    // 임시 파일로 다운로드
    const tempFilePath = await downloadToTempFile(videoUrl, options);

    // 임시 파일을 스트리밍하여 클라이언트로 전송
    const fileStream = fs.createReadStream(tempFilePath);
    fileStream.pipe(res);

    fileStream.on("end", () => {
      // 전송 후 임시 파일 삭제
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("임시 파일 삭제 오류:", err);
      });
    });

    fileStream.on("error", (err) => {
      console.error("파일 스트림 오류:", err);
      res.status(500).json({ error: "파일 스트림 오류가 발생했습니다." });
    });
  } catch (err) {
    console.error("다운로드 중 오류:", err);
    res.status(500).json({ error: "다운로드 중 오류가 발생했습니다: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
