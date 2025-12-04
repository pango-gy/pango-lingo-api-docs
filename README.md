# 팡고링고 API 문서

팡고링고 CMS의 다국어 기사 처리를 위한 외부 API 문서 사이트입니다.

## 🌐 라이브 문서

GitHub Pages를 통해 배포된 문서를 확인하세요:
**[https://pango-gy.github.io/pango-lingo-api-docs](https://pango-gy.github.io/pango-lingo-api-docs)**

## 🚀 GitHub Pages 배포 방법

1. **저장소 Settings로 이동**
   - GitHub 저장소 페이지에서 `Settings` 탭 클릭

2. **Pages 설정**
   - 왼쪽 메뉴에서 `Pages` 클릭
   - Source를 `Deploy from a branch`로 설정
   - Branch를 `main` (또는 `master`) 선택
   - 폴더는 `/ (root)` 선택
   - `Save` 클릭

3. **배포 확인**
   - 몇 분 후 `https://pango-gy.github.io/pango-lingo-api-docs`에서 확인

## 📁 프로젝트 구조 (Jekyll 템플릿)

```
pango-lingo-api-docs/
├── _config.yml              # Jekyll 설정 파일
├── _layouts/
│   └── default.html         # 기본 레이아웃
├── _includes/
│   ├── head.html            # <head> 태그 내용
│   ├── header.html          # 헤더 네비게이션
│   ├── sidebar.html         # 사이드바 메뉴
│   ├── footer.html          # 푸터
│   ├── hero.html            # 히어로 섹션
│   ├── scripts.html         # 스크립트 로딩
│   ├── sections/            # 섹션별 HTML
│   │   ├── overview.html
│   │   ├── authentication.html
│   │   ├── examples.html
│   │   ├── errors.html
│   │   └── notes.html
│   └── endpoints/           # API 엔드포인트별 HTML
│       ├── create-article.html
│       ├── translate.html
│       ├── get-translations.html
│       └── approve.html
├── assets/
│   ├── css/
│   │   └── styles.css       # 스타일시트
│   └── js/
│       └── main.js          # JavaScript
├── index.html               # 메인 페이지
└── README.md                # 이 파일
```

## ✨ 기능

- 🎨 다크 테마의 현대적인 디자인
- 📱 반응형 레이아웃 (모바일/데스크톱)
- 🔍 사이드바 네비게이션
- 📋 코드 복사 기능
- 🎯 구문 하이라이팅 (Highlight.js)
- 🧩 Jekyll 템플릿으로 모듈화된 구조

## 📚 API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/external/articles` | 원문 기사 생성 |
| POST | `/api/external/articles/{id}/translate` | 번역 요청 |
| GET | `/api/external/articles/{id}/translations` | 번역 상태 조회 |
| POST | `/api/external/articles/{id}/approve` | 기사 승인 |

## 🛠️ 로컬 개발

### Jekyll 설치 및 실행

```bash
# Ruby & Bundler 설치 (macOS)
brew install ruby
gem install bundler

# 의존성 설치
bundle install

# 로컬 서버 실행
bundle exec jekyll serve

# http://localhost:4000 에서 확인
```

### Gemfile 생성 (선택사항)

로컬에서 Jekyll을 실행하려면 `Gemfile`을 생성하세요:

```ruby
source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "webrick"
```

## 🔧 파일 구조 설명

| 폴더/파일 | 설명 |
|-----------|------|
| `_layouts/` | 페이지의 기본 구조를 정의하는 레이아웃 파일 |
| `_includes/` | 재사용 가능한 HTML 조각 (컴포넌트) |
| `assets/css/` | 스타일시트 파일 |
| `assets/js/` | JavaScript 파일 |
| `_config.yml` | Jekyll 설정 및 사이트 메타데이터 |

## 📝 수정 방법

### 콘텐츠 수정
- API 엔드포인트: `_includes/endpoints/` 폴더의 해당 파일 수정
- 섹션 내용: `_includes/sections/` 폴더의 해당 파일 수정

### 스타일 수정
- `assets/css/styles.css` 파일 수정

### 레이아웃 수정
- `_layouts/default.html` 또는 `_includes/` 폴더의 파일 수정

## 📄 라이선스

© 2024 팡고링고. All rights reserved.
