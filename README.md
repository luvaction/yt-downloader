# yt-downloader

**yt-downloader**는 Express와 [youtube-dl-exec](https://www.npmjs.com/package/youtube-dl-exec)을 이용하여 유튜브 영상에서 음원(MP3) 또는 영상(MP4)을 스트리밍 방식으로 다운로드 받을 수 있는 웹 애플리케이션입니다.  
사용자는 브라우저에서 유튜브 URL과 원하는 파일명을 입력하고, 라디오 버튼을 통해 MP3 또는 MP4 중 한 종류만 선택하여 다운로드할 수 있습니다.

> **주의:**  
> 이 프로젝트는 교육용 예제입니다.  
> 유튜브와 같은 플랫폼에서 저작권 보호 콘텐츠를 다운로드하는 행위는 해당 서비스의 이용 약관 및 저작권법에 위배될 수 있습니다.  
> 본 프로젝트의 코드를 상업적 또는 불법적인 목적으로 사용하지 마시고, 사용 전 반드시 법적 검토를 진행해 주세요.

## 주요 기능

- **유튜브 URL 입력:** 사용자가 유튜브 영상 URL을 입력합니다.
- **파일명 지정:** 사용자가 원하는 파일명을 직접 입력할 수 있습니다.
- **다운로드 유형 선택:** 라디오 버튼을 통해 MP3 또는 MP4 중 하나만 선택 가능
- **스트리밍 다운로드:** 서버는 youtube-dl-exec를 이용하여 임시 파일로 다운로드 후, 그 파일을 읽어 브라우저에 스트리밍 방식으로 전송합니다.
- **브라우저 다운로드 대화상자:** 클라이언트는 응답받은 파일을 일반적인 브라우저 다운로드 방식으로 저장

## 기술 스택

- **서버:** Node.js, Express, body-parser
- **프론트엔드:** HTML, CSS, JavaScript (Fetch API)
- **프로세스 관리 (옵션):** [PM2](https://pm2.keymetrics.io/)

## 설치 및 실행

### 1. 클론 및 의존성 설치

```bash
git clone https://github.com/luvaction/yt-downloader.git
cd yt-downloader
npm install
```
