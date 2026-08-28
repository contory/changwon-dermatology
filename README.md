# 창원피부과.com V1.1

창원·상남동·중동 생활권 피부정보 사이트입니다. 현재 기본 모드는 `publisher`이며 실제 의료기관으로 가장하지 않습니다.

## 핵심 구조
- `/` → 창원 피부과
- `/sangnam/` → 상남동 피부과
- `/jungdong/` → 중동 피부과
- 지역 허브당 6개 상세 문서 → 총 18개
- `/blog/` + 피부정보 글 8개
- `/about/`, `/editorial-policy/`, `/authors/`, `/corrections/`
- `/partner/` → 병원 입점 안내, noindex

## 히어로
- PC와 모바일 모두 `100svh` 풀스크린 영상
- 창원: 모델 오른쪽 / 텍스트 왼쪽
- 상남동: 모델 왼쪽 / 텍스트 오른쪽
- 중동: 모델 오른쪽 / 텍스트 왼쪽
- 흰 안개·전체 블러·강한 화면 오버레이 없음
- 스크롤 전 헤더는 영상 위, 스크롤 후 흰색 고정 헤더

## SEO / GEO
- canonical
- robots.txt / sitemap.xml / RSS
- WebSite / Organization / WebPage / Article / BreadcrumbList / VideoObject
- 허브별 ItemList 1개, 6개 ListItem
- ItemList는 네이버 서치어드바이저 예제의 직접 `{name,image,url,position}` 형태
- 지역 허브별 제목·설명·본문·상세 URL·이미지 차별화
- 18개 캐러셀 이미지 파일 해시 중복 없음
- llms.txt / humans.txt
- Publisher 모드에서 MedicalClinic 구조화 데이터 사용 안 함

## 로컬 실행
```bash
npm run build
npm run check
npm run preview
```
브라우저에서 `http://localhost:4173` 확인.

## Cloudflare Pages
- GitHub 저장소: `changwon-dermatology` 권장
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js: 20 이상

## 도메인
- 한글: `창원피부과.com`
- Punycode: `xn--vb0b562al4gzsfbrm.com`
- canonical origin: `https://xn--vb0b562al4gzsfbrm.com`

## 문의 버튼
기본 연결: `https://pf.kakao.com/_xfBcan`

## 병원 입점 시
`site.config.mjs`의 `mode`를 `clinic`으로 바꾸기 전에 실제 병원명, 의료진, 주소, 진료시간, 상담채널 등 확인된 정보만 입력하세요. 자세한 내용은 `CLINIC_SWITCH_GUIDE.md` 참고.
