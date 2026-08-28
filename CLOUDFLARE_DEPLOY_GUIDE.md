# Cloudflare Pages 배포 가이드

## 1. GitHub
1. 새 저장소 `changwon-dermatology` 생성
2. 이 ZIP의 **내용물 자체를 저장소 루트**에 업로드합니다.
3. `package.json`, `content`, `public`, `scripts`, `src`, `site.config.mjs`가 저장소 최상단에 보여야 합니다.

## 2. Cloudflare Pages
- Workers & Pages → Create → Pages → Connect to Git
- 저장소: `changwon-dermatology`
- Production branch: `main`
- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Node: 20 이상

## 3. 도메인 연결
도메인 `상남동피부과.com`을 Cloudflare에 추가한 뒤 Pages 프로젝트 Custom domains에서 연결합니다.
Punycode는 `xn--vb0bq3eb8co9n65d4y2b.com`입니다.

`www` 호스트를 사용할 경우 `_redirects`에 설정된 대표 도메인으로 301 이동합니다.

## 4. 배포 확인
아래 주소가 200으로 열리는지 확인합니다.
- `/`
- `/sangnam/`
- `/jungdong/`
- `/sitemap.xml`
- `/rss.xml`
- `/robots.txt`

## 5. 네이버
배포 완료 후 `NAVER_SEARCH_ADVISOR_SETUP.md` 순서로 등록합니다.
