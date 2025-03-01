# YouTube Downloader 플로우 문서

이 문서는 YouTube Downloader 애플리케이션의 전체 다운로드 플로우를 설명합니다.

## 1. 클라이언트 측 입력 및 전송

- **HTML 폼 구성:**  
  사용자는 유튜브 영상 URL, 원하는 파일명(확장자 제외), 다운로드 유형(MP3 또는 MP4)을 입력합니다.

- **폼 제출 및 JavaScript 처리:**
  - 폼 제출 시 JavaScript가 입력 데이터를 수집합니다.
  - JSON 형식으로 `/download` 엔드포인트로 POST 요청을 보냅니다.
  - 사용자는 진행 상태(예: "다운로드 중...")를 확인할 수 있습니다.

## 2. 서버 측 처리 (app.js)

- **Express 서버 설정:**

  - 정적 파일 제공, URL 인코딩 및 JSON 파싱 미들웨어가 설정되어 있습니다.

- **POST `/download` 요청 처리:**
  - **입력 데이터 파싱 및 정제:**  
    `videoUrl`, `downloadType`, `filename` 데이터를 파싱하고, `sanitizeFilename` 함수로 파일명을 정제합니다.
  - **옵션 결정:**
    - MP3: `{ noPlaylist: true, extractAudio: true, audioFormat: "mp3" }`
    - MP4: `{ noPlaylist: true, format: "bestvideo+bestaudio", mergeOutputFormat: "mp4" }`
  - **응답 헤더 설정:**
    - `Content-Disposition`과 `Content-Type` 헤더를 설정하여 올바른 파일명이 표시되도록 함.
  - **임시 파일 다운로드 및 스트리밍:**
    - `downloadToTempFile` 함수를 통해 youtube-dl을 사용, 임시 파일로 다운로드.
    - 임시 파일을 스트리밍하여 클라이언트로 전송 후, 파일 전송 완료 시 임시 파일 삭제.

## 3. 다운로드 처리 (downloader.js)

- **youtube-dl-exec 사용:**

  - 주어진 URL과 옵션에 따라 동영상을 다운로드.
  - OS의 임시 디렉토리에 `yt-download-타임스탬프.ext` 형태의 파일로 저장.
  - 다운로드가 완료되면 파일 경로를 반환.

- **참고:**
  - `getVideoTitle` 함수는 영상 제목을 가져오는 보조 함수로 제공됩니다.

## 4. 클라이언트 파일 저장

- **응답 처리:**
  - 서버로부터 받은 파일 스트림을 blob으로 변환 후, 다운로드 링크를 자동 생성하여 파일 저장.
  - 다운로드 완료 후 URL 및 임시 링크를 해제하여 자원 정리.

## 전체 플로우 요약

1. **입력:** 웹페이지에서 유튜브 URL, 파일명, 다운로드 유형 입력.
2. **전송:** JSON 형태로 POST 요청 전송.
3. **서버 처리:**
   - 데이터 파싱, 파일명 정제, 옵션 결정.
   - 임시 파일 다운로드 및 스트리밍 전송.
4. **클라이언트 저장:**
   - 파일 스트림을 blob으로 변환 후, 다운로드 링크 생성 및 자동 클릭.

---
