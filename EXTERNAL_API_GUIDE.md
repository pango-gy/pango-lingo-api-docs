# 팡고링고 외부 API 가이드

팡고링고 CMS의 다국어 기사 처리 플로우를 위한 외부 API 문서입니다.

## 개요

워드프레스 등 외부 시스템에서 팡고링고 CMS로 기사를 생성하고, 번역을 요청하며, 번역 상태를 조회하고, 최종 승인하는 플로우를 제공합니다.

## 인증

모든 API는 `x-api-key` 헤더를 통한 인증이 필요합니다.

**인증 방법:**

- 헤더: `x-api-key: YOUR_API_KEY`
- 또는 헤더: `X-API-Key: YOUR_API_KEY`
- 또는 쿼리 파라미터: `?apiKey=YOUR_API_KEY`
- 또는 Authorization Bearer: `Authorization: Bearer YOUR_API_KEY`

**API 키 설정:**
API 키는 시스템 관리자가 `Config` 테이블에 다음 설정으로 등록해야 합니다:

- `configType`: `BASIC_CONFIG`
- `key`: `api_key`
- `value`: 실제 API 키 값

**에러 응답 (401 Unauthorized):**

```json
{
  "error": "API 키가 필요합니다. x-api-key 헤더 또는 apiKey 쿼리 파라미터를 제공하세요."
}
```

또는

```json
{
  "error": "유효하지 않은 API 키입니다."
}
```

---

## API 엔드포인트

### 1. 사용자(기자) 목록 조회

**엔드포인트:** `GET /api/external/users`

**인증:** `x-api-key` 헤더 필요

**설명:** 페이지네이션, 검색, 필터링을 지원하는 사용자(기자) 목록 조회

**쿼리 파라미터:**

- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지당 항목 수 (기본값: 10)
- `search` (선택): 검색어 (이름, 이메일, 로그인ID)
- `status` (선택): 상태 필터 (`ACTIVE`, `INACTIVE`, `DORMANT`)

**응답 (200 OK):**

```json
{
  "items": [
    {
      "id": 1,
      "name": "홍길동",
      "email": "hong@example.com",
      "loginId": "hong",
      "userType": "REPORTER",
      "userGradeId": 1,
      "gradeName": "기자",
      "departmentId": 1,
      "departmentName": "사회부",
      "authorDisplayId": 1,
      "authorDisplayName": "홍길동 기자",
      "profileImage": "https://example.com/profile.jpg",
      "profileDescription": "기자 프로필",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

**에러 응답:**

- `401`: 인증 실패
- `500`: 서버 오류

---

### 2. 카테고리 목록 조회

**엔드포인트:** `GET /api/external/categories`

**인증:** `x-api-key` 헤더 필요

**설명:** 카테고리 목록을 조회합니다. RSS 활성화 여부로 필터링 가능합니다.

**쿼리 파라미터:**

- `rssEnabled` (선택): RSS 활성화 여부로 필터링 (`true`, `false`)

**응답 (200 OK):**

```json
[
  {
    "id": 1,
    "name": "정치",
    "code": "politics",
    "regionCode": "ko-kr",
    "parentCategoryId": null,
    "rssEnabled": true,
    "rssDescription": "정치 뉴스",
    "rssItemCount": 20,
    "rssUpdateInterval": 60,
    "sortOrder": 1,
    "article_count": 150,
    "childCategories": [
      {
        "id": 2,
        "name": "국회",
        "code": "parliament",
        "regionCode": "ko-kr",
        "parentCategoryId": 1,
        "rssEnabled": true,
        "sortOrder": 1,
        "article_count": 50
      }
    ]
  }
]
```

**에러 응답:**

- `401`: 인증 실패
- `500`: 서버 오류

---

### 3. 원문 기사 생성

**엔드포인트:** `POST /api/external/articles`

**인증:** `x-api-key` 헤더 필요

**설명:** 워드프레스에서 사용 중인 고유 기사 ID를 포함하여 팡고링고 CMS의 기사를 생성합니다.

**요청 본문:**

```json
{
  "externalId": "1234567890", // 필수: 워드프레스 고유 기사 ID (Long)
  "title": "기사 제목", // 필수
  "subTitle": "기사 부제목", // 선택
  "articleContent": "<p>기사 내용 HTML</p>", // 필수
  "thumbnailUrl": "https://example.com/image.jpg", // 선택
  "keyword": "키워드1, 키워드2", // 선택
  "categoryIds": [1, 2, 3], // 선택: 카테고리 ID 목록
  "reporterIds": [1, 2] // 선택: 기자 ID 목록
}
```

**응답 (201 Created):**

```json
{
  "id": 1234567890,
  "externalId": "1234567890",
  "title": "기사 제목",
  "subTitle": "기사 부제목",
  "status": "DRAFT",
  "message": "기사가 성공적으로 생성되었습니다."
}
```

**중요:**

- `id`는 `externalId`와 동일한 값입니다. `externalId`로 전달한 값이 그대로 `Article.id`로 사용됩니다.
- 이후 모든 API 호출 시 이 `id` 값을 사용하세요 (예: `/api/external/articles/{id}/translate`).

**에러 응답:**

- `400`: 필수 필드 누락 또는 잘못된 요청
- `409`: 이미 존재하는 externalId
- `500`: 서버 오류

---

### 4. 번역 요청

**엔드포인트:** `POST /api/external/articles/{id}/translate`

**인증:** `x-api-key` 헤더 필요

**설명:** 생성된 기사 ID와 번역이 필요한 타깃 언어(Region)를 전달하여 번역 요청합니다. 번역 처리는 비동기 방식으로 동작하며, API 응답에서는 즉시 결과물을 반환하지 않습니다.

**경로 파라미터:**

- `id`: 원문 기사 ID (integer)

**요청 본문:**

```json
{
  "regions": ["en-us", "ja-jp"], // 필수: 번역이 필요한 타깃 언어 코드 목록
  "prompt": "번역 시 추가 지시사항" // 선택: 번역 시 추가적인 지시사항
}
```

**응답 (202 Accepted):**

```json
{
  "message": "번역 요청이 성공적으로 접수되었습니다.",
  "articleId": 1234567890,
  "targetRegions": ["en-us", "ja-jp"]
}
```

**에러 응답:**

- `400`: 잘못된 요청 (유효하지 않은 지역 코드)
- `404`: 기사를 찾을 수 없음
- `500`: 서버 오류

**참고:**

- 번역 요청은 비동기로 처리되며, 즉시 결과를 반환하지 않습니다.
- 번역 진행 상태는 번역 상태 조회 API를 통해 확인할 수 있습니다.

---

### 5. 번역 상태 및 결과 조회

**엔드포인트:** `GET /api/external/articles/{id}/translations`

**인증:** `x-api-key` 헤더 필요

**설명:** 원문 기사 ID 기준으로 번역본의 상태와 결과를 조회합니다.

**경로 파라미터:**

- `id`: 원문 기사 ID (integer)

**응답 (200 OK):**

```json
{
  "articleId": 1234567890,
  "translations": [
    {
      "region": "en-us",
      "status": "SUCCESS", // SUCCESS, PROGRESS, FAILED
      "previewUrl": "https://example.com/preview/en-us/desktop/preview?returnUrl=/en-us/articles/101",
      "title": "Article Title",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "region": "ja-jp",
      "status": "PROGRESS",
      "previewUrl": "https://example.com/preview/ja-jp/desktop/preview?returnUrl=/ja-jp/articles/102",
      "title": "",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**번역 상태:**

- `SUCCESS`: 번역 완료
- `PROGRESS`: 번역 진행 중
- `FAILED`: 번역 실패

**에러 응답:**

- `400`: 잘못된 기사 ID
- `404`: 기사를 찾을 수 없음
- `500`: 서버 오류

---

### 6. 기사 승인 처리

**엔드포인트:** `POST /api/external/articles/{id}/approve`

**인증:** `x-api-key` 헤더 필요

**설명:** 번역 검수 후 승인 시 팡고링고 CMS의 승인 API를 호출하여 게시 상태를 최종 확정합니다.

**경로 파라미터:**

- `id`: 원문 기사 ID (integer)

**요청 본문:**

```json
{
  "publishAt": "2024-01-01T00:00:00.000Z" // 선택: 게시 날짜 (ISO 8601 형식, 기본값: 현재 시간)
}
```

**응답 (200 OK):**

```json
{
  "message": "기사가 성공적으로 승인되고 게시되었습니다.",
  "articleId": 1234567890,
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

**에러 응답:**

- `400`: 잘못된 기사 ID
- `404`: 기사를 찾을 수 없음
- `500`: 서버 오류

**참고:**

- 승인 시 번역 완료된 번역본(`status: SUCCESS`)만 게시됩니다.
- 번역 진행 중이거나 실패한 번역본은 게시되지 않습니다.

---

### 7. 기사 원본 수정

**엔드포인트:** `PUT /api/external/articles/{id}`

**인증:** `x-api-key` 헤더 필요

**설명:** 생성된 기사 원본의 내용을 수정합니다. 변경된 필드만 업데이트되며, 번역본(RegionalArticle)도 함께 업데이트됩니다.

**경로 파라미터:**

- `id`: 원문 기사 ID (integer)

**요청 본문:**

```json
{
  "title": "수정된 기사 제목", // 선택
  "subTitle": "수정된 기사 부제목", // 선택
  "articleContent": "<p>수정된 기사 내용 HTML</p>", // 선택
  "thumbnailUrl": "https://example.com/new-image.jpg", // 선택
  "keyword": "수정된 키워드", // 선택
  "categoryIds": [1, 2, 3], // 선택: 카테고리 ID 목록 (전체 교체)
  "reporterIds": [1, 2], // 선택: 기자 ID 목록 (전체 교체)
  "relatedArticleIds": [10, 20], // 선택: 관련 기사 ID 목록 (전체 교체)
  "grade": "IMPORTANT", // 선택: NORMAL, IMPORTANT, HEADLINE
  "status": "REVIEW", // 선택: DRAFT, REVIEW, PUBLISHED, REJECTED, DELETED
  "type": "ARTICLE", // 선택
  "exposureStartTime": "2024-01-01T00:00:00.000Z", // 선택
  "exposureEndTime": "2024-01-31T23:59:59.000Z", // 선택
  "isMemberOnly": false, // 선택: 회원 전용 여부
  "webhookTriggerEnabled": true, // 선택: 웹훅 트리거 활성화 여부
  "webPushEnabled": false // 선택: 웹푸시 전송 활성화 여부
}
```

**응답 (200 OK):**

```json
{
  "message": "기사가 성공적으로 수정되었습니다.",
  "article": {
    "id": 1234567890,
    "title": "수정된 기사 제목",
    "subTitle": "수정된 기사 부제목",
    "articleContent": "<p>수정된 기사 내용 HTML</p>",
    "status": "REVIEW",
    "categories": [
      {
        "category": {
          "id": 1,
          "name": "정치",
          "code": "politics"
        }
      }
    ],
    "reporters": [
      {
        "reporter": {
          "id": 1,
          "name": "홍길동",
          "email": "hong@example.com"
        }
      }
    ]
  }
}
```

**에러 응답:**

- `400`: 잘못된 기사 ID 또는 잘못된 요청
- `404`: 기사를 찾을 수 없음
- `500`: 서버 오류

**참고:**

- 요청 본문에 포함된 필드만 업데이트됩니다. 포함되지 않은 필드는 기존 값이 유지됩니다.
- `categoryIds`, `reporterIds`, `relatedArticleIds`를 전달하면 기존 관계가 모두 삭제되고 새로운 관계로 교체됩니다.
- 기사 수정 시 한국어 번역본(ko-kr)도 함께 업데이트됩니다.
- 썸네일 이미지는 S3에 자동으로 복사되어 지역별 폴더에 저장됩니다.

---

### 8. 게시 취소

**엔드포인트:** `DELETE /api/external/articles/{id}/cancel`

**인증:** `x-api-key` 헤더 필요

**설명:** 게시된 기사를 취소하고 원본 기사 상태를 DRAFT로 변경합니다. PublishedArticle 및 관련 데이터가 모두 삭제되며, 소셜 미디어 포스트(트위터, 페이스북)도 함께 삭제됩니다.

**경로 파라미터:**

- `id`: 원문 기사 ID (integer)

**응답 (200 OK):**

```json
{
  "message": "게시가 성공적으로 취소되었습니다.",
  "articleId": 1234567890
}
```

**에러 응답:**

- `400`: 잘못된 기사 ID
- `404`: 기사를 찾을 수 없음 또는 게시된 기사를 찾을 수 없음
- `500`: 서버 오류

**참고:**

- 게시 취소 시 다음 작업이 수행됩니다:
  - PublishedArticle 및 관련 데이터 삭제 (카테고리, 기자, 관련기사, 댓글 등)
  - 원본 기사 상태를 `DRAFT`로 변경
  - NewsSubmission 상태 업데이트 (MSN, ZUM: `NOT_SUBMITTED`, TWITTER, FACEBOOK: `DELETED`)
  - 트위터/페이스북 포스트 삭제 (비동기 처리)
  - 캐시 무효화
- 게시되지 않은 기사에 대해 호출하면 `404` 오류가 발생합니다.

---

## 전체 플로우 예시

### 0단계: 사용자 및 카테고리 조회 (선택)

기사 생성 전에 사용 가능한 기자와 카테고리를 조회할 수 있습니다:

```bash
# 사용자(기자) 목록 조회
curl "https://api.example.com/api/external/users?page=1&limit=10&status=ACTIVE" \
  -H "x-api-key: YOUR_API_KEY"

# 카테고리 목록 조회
curl "https://api.example.com/api/external/categories" \
  -H "x-api-key: YOUR_API_KEY"
```

### 1단계: 원문 기사 생성

```bash
curl -X POST https://api.example.com/api/external/articles \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "externalId": "1234567890",
    "title": "새로운 기사",
    "articleContent": "<p>기사 내용</p>"
  }'
```

**응답:**

```json
{
  "id": 1234567890,
  "externalId": "1234567890",
  "title": "새로운 기사",
  "subTitle": "테스트 기사 부제목",
  "status": "DRAFT",
  "message": "기사가 성공적으로 생성되었습니다."
}
```

**참고:** `id`는 `externalId`와 동일한 값입니다. 이후 API 호출 시 이 `id`를 사용하세요.

### 2단계: 번역 요청

```bash
# 위에서 받은 id를 사용 (예: 1234567890)
curl -X POST https://api.example.com/api/external/articles/1234567890/translate \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "regions": ["en-us", "ja-jp"]
  }'
```

**응답:**

```json
{
  "message": "번역 요청이 성공적으로 접수되었습니다.",
  "articleId": 1234567890,
  "targetRegions": ["en-us", "ja-jp"]
}
```

### 3단계: 번역 상태 조회 (폴링)

```bash
# articleId를 사용 (예: 1234567890)
curl https://api.example.com/api/external/articles/1234567890/translations \
  -H "x-api-key: YOUR_API_KEY"
```

**응답 (번역 진행 중):**

```json
{
  "articleId": 1234567890,
  "translations": [
    {
      "region": "en-us",
      "status": "PROGRESS",
      "previewUrl": "https://example.com/preview/en-us/desktop/preview?returnUrl=/en-us/articles/101",
      "title": "",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "region": "ja-jp",
      "status": "PROGRESS",
      "previewUrl": "https://example.com/preview/ja-jp/desktop/preview?returnUrl=/ja-jp/articles/102",
      "title": "",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**응답 (번역 완료):**

```json
{
  "articleId": 1234567890,
  "translations": [
    {
      "region": "en-us",
      "status": "SUCCESS",
      "previewUrl": "https://example.com/preview/en-us/desktop/preview?returnUrl=/en-us/articles/101",
      "title": "New Article",
      "updatedAt": "2024-01-01T01:00:00.000Z"
    },
    {
      "region": "ja-jp",
      "status": "SUCCESS",
      "previewUrl": "https://example.com/preview/ja-jp/desktop/preview?returnUrl=/ja-jp/articles/102",
      "title": "新しい記事",
      "updatedAt": "2024-01-01T01:00:00.000Z"
    }
  ]
}
```

### 4단계: 기사 승인

```bash
# articleId를 사용 (예: 1234567890)
curl -X POST https://api.example.com/api/external/articles/1234567890/approve \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "publishAt": "2024-01-01T12:00:00.000Z"
  }'
```

**응답:**

```json
{
  "message": "기사가 성공적으로 승인되었습니다. 2024-01-01 오후 12:00:00에 게시됩니다.",
  "articleId": 1234567890,
  "publishedAt": "2024-01-01T12:00:00.000Z"
}
```

### 5단계: 기사 원본 수정 (선택)

게시 전 또는 게시 후에도 기사 원본을 수정할 수 있습니다:

```bash
# articleId를 사용 (예: 1234567890)
curl -X PUT https://api.example.com/api/external/articles/1234567890 \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "수정된 기사 제목",
    "articleContent": "<p>수정된 기사 내용</p>",
    "categoryIds": [1, 2]
  }'
```

**응답:**

```json
{
  "message": "기사가 성공적으로 수정되었습니다.",
  "article": {
    "id": 1234567890,
    "title": "수정된 기사 제목",
    "status": "DRAFT"
  }
}
```

### 6단계: 게시 취소 (선택)

게시된 기사를 취소하고 원본 상태로 되돌릴 수 있습니다:

```bash
# articleId를 사용 (예: 1234567890)
curl -X DELETE https://api.example.com/api/external/articles/1234567890/cancel \
  -H "x-api-key: YOUR_API_KEY"
```

**응답:**

```json
{
  "message": "게시가 성공적으로 취소되었습니다.",
  "articleId": 1234567890
}
```

---

## 주의사항

1. **externalId와 id의 관계**: `externalId`로 전달한 값이 그대로 `Article.id`로 사용됩니다. 즉, `id`와 `externalId`는 동일한 값입니다. 이후 모든 API 호출 시 이 `id` 값을 경로 파라미터로 사용하세요.

2. **externalId 중복 방지**: 동일한 `externalId`로 중복 생성 시 `409 Conflict` 오류가 발생합니다.

3. **번역 비동기 처리**: 번역 요청은 비동기로 처리되므로, 번역 상태 조회 API를 통해 주기적으로 상태를 확인해야 합니다.

4. **번역 상태 확인**: 번역이 완료되기 전에 승인하면, 번역 완료된 번역본만 게시됩니다.

5. **미리보기 URL**: 번역 상태 조회 API에서 반환되는 `previewUrl`을 통해 번역된 기사 내용을 검토할 수 있습니다.

6. **지역 코드**: 지원되는 지역 코드는 시스템 설정에 따라 다를 수 있습니다. 일반적으로 `ko-kr`, `en-us`, `ja-jp`, `zh-cn` 등을 지원합니다.

7. **id 사용**: 기사 생성 후 반환되는 `id`는 `externalId`와 동일한 값입니다. 이후 번역 요청, 번역 상태 조회, 승인 등 모든 API 호출에서 이 `id`를 경로 파라미터로 사용하세요.

8. **기사 수정**: 기사 수정 시 변경된 필드만 업데이트되며, 포함되지 않은 필드는 기존 값이 유지됩니다. `categoryIds`, `reporterIds`, `relatedArticleIds`를 전달하면 기존 관계가 모두 삭제되고 새로운 관계로 교체됩니다.

9. **게시 취소**: 게시 취소 시 PublishedArticle 및 관련 데이터가 모두 삭제되며, 원본 기사 상태가 `DRAFT`로 변경됩니다. 소셜 미디어 포스트도 함께 삭제됩니다.

---

## 에러 처리

모든 API는 표준 HTTP 상태 코드를 사용합니다:

- `200`: 성공
- `201`: 생성 성공
- `202`: 요청 접수 (비동기 처리)
- `400`: 잘못된 요청
- `401`: 인증 실패
- `404`: 리소스를 찾을 수 없음
- `409`: 리소스 충돌 (중복)
- `500`: 서버 오류

에러 응답 형식:

```json
{
  "error": "에러 메시지",
  "details": "상세 에러 정보 (선택)"
}
```
