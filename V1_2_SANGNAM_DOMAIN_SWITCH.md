# V1.2 상남동피부과.com 도메인 전환

## 핵심 원칙
도메인은 `상남동피부과.com`으로 변경하지만 홈페이지 메인(`/`)은 계속 **창원 피부과** 키워드에 랜딩하도록 유지합니다. 메인 Title과 H1 모두 `창원 피부과`를 명확히 포함합니다.

### 허브 구조
- `/` → 창원 피부과
- `/sangnam/` → 상남동 피부과
- `/jungdong/` → 중동 피부과

### 새 도메인
- 한글: `상남동피부과.com`
- Punycode: `xn--vb0bq3eb8co9n65d4y2b.com`
- Canonical origin: `https://xn--vb0bq3eb8co9n65d4y2b.com`

### 변경하지 않은 것
- 창원 메인 H1/Title/Description의 핵심 타깃
- 상남동/중동 독립 허브
- 3개 영상 히어로
- 18개 캐러셀용 상세문서
- 이미지 및 고화질 자산
- 운영사/카카오 문의 구조

### GitHub 적용
현재 `changwon-dermatology` 저장소에 이 패치의 파일을 루트 기준으로 덮어쓴 뒤 커밋하면 됩니다. 저장소 이름은 변경할 필요가 없습니다.

### Cloudflare
- Project name: `changwon-dermatology` 그대로 사용 가능
- Build command: `npm run build`
- Output directory: `dist`
- Custom domain: `xn--vb0bq3eb8co9n65d4y2b.com`
