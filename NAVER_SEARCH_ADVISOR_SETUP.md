# 네이버 서치어드바이저 등록

## 사이트 주소
`https://xn--vb0b562al4gzsfbrm.com`

## 소유확인
네이버에서 발급한 **창원 사이트 전용 HTML 확인 파일**을 `public/` 폴더에 그대로 넣습니다.
다른 사이트의 확인 파일을 재사용하지 않습니다.

확인 파일 추가 후 다시:
```bash
npm run build
npm run check
```

## 제출
- 사이트맵: `https://xn--vb0b562al4gzsfbrm.com/sitemap.xml`
- RSS: `https://xn--vb0b562al4gzsfbrm.com/rss.xml`

## 우선 URL 검사 / 수집 요청
1. `https://xn--vb0b562al4gzsfbrm.com/`
2. `https://xn--vb0b562al4gzsfbrm.com/sangnam/`
3. `https://xn--vb0b562al4gzsfbrm.com/jungdong/`
4. `https://xn--vb0b562al4gzsfbrm.com/blog/`

각 허브의 6개 상세 URL도 수집 상태를 확인합니다.

## 캐러셀 구조
각 지역 허브에는 ItemList가 한 개씩 있으며 6개 ListItem을 사용합니다.
각 항목은 서로 다른 제목, URL, 이미지 파일을 사용합니다.
구조화 데이터는 검색 결과 분석을 돕는 신호이며 캐러셀 형태의 실제 노출은 네이버가 결정합니다.
