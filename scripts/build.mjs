import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { config } from '../site.config.mjs';
import { concerns, hubs, regionalArticles, blogPosts } from '../content/site-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const SRC = path.join(ROOT, 'src');
const TODAY = '2026-08-28';

const origin = config.domain.replace(/\/$/, '');
const isClinic = config.mode === 'clinic' && config.clinic.name;
const brandName = isClinic ? config.clinic.name : config.siteName;
const consultUrl = isClinic && config.clinic.kakaoUrl ? config.clinic.kakaoUrl : config.publisher.kakaoUrl;

const clean = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
};

const copyDir = (source, destination) => {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
};

const writeFile = (relative, content) => {
  const target = path.join(DIST, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};

const hashContent = (content) => createHash('sha256').update(content).digest('hex').slice(0, 12);
const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');
const escapeXml = escapeHtml;
const urlFor = (pathname = '/') => `${origin}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
const pathFor = (pathname = '/') => pathname === '/' ? 'index.html' : `${pathname.replace(/^\//, '').replace(/\/$/, '')}/index.html`;
const cdata = (value) => String(value).replaceAll(']]>', ']]]]><![CDATA[>');

clean(DIST);
copyDir(PUBLIC, DIST);

const rawCss = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8')
  .replaceAll('__PRIMARY__', config.theme.primary)
  .replaceAll('__PRIMARY_DARK__', config.theme.primaryDark)
  .replaceAll('__PRIMARY_SOFT__', config.theme.primarySoft)
  .replaceAll('__ACCENT__', config.theme.accent)
  .replaceAll('__ACCENT_SOFT__', config.theme.accentSoft)
  .replaceAll('__BACKGROUND__', config.theme.background)
  .replaceAll('__SURFACE__', config.theme.surface)
  .replaceAll('__TEXT__', config.theme.text)
  .replaceAll('__MUTED__', config.theme.muted)
  .replaceAll('__LINE__', config.theme.line);
const rawJs = fs.readFileSync(path.join(SRC, 'site.js'), 'utf8');
const cssPath = `/assets/styles.${hashContent(rawCss)}.css`;
const jsPath = `/assets/site.${hashContent(rawJs)}.js`;
writeFile(cssPath.slice(1), rawCss);
writeFile(jsPath.slice(1), rawJs);

function icon(name, className = '') {
  const cls = className ? ` class="${className}"` : '';
  const open = (viewBox = '0 0 24 24') => `<svg${cls} width="24" height="24" viewBox="${viewBox}" aria-hidden="true" focusable="false">`;
  const icons = {
    arrow: `${open()}<path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    menu: `${open()}<path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    search: `${open()}<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    note: `${open()}<path d="M6 4h12v16H6z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8h6M9 12h6M9 16h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    shield: `${open()}<path d="M12 3 5 6v5c0 4.8 2.7 8 7 10 4.3-2 7-5.2 7-10V6l-7-3Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m8.5 12 2.2 2.2 4.8-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    clock: `${open()}<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    check: `${open()}<path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    plus: `${open()}<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    person: `${open()}<circle cx="12" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5.5 20c.8-4.5 3-6.5 6.5-6.5s5.7 2 6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    pin: `${open()}<path d="M12 21s7-6.2 7-12A7 7 0 1 0 5 9c0 5.8 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="9" r="2.3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    chat: `${open()}<path d="M5 5h14v10H9l-4 4V5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 9h6M9 12h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  };
  return icons[name] || icons.arrow;
}

function button(href, label, style = 'primary', attrs = '') {
  return `<a class="btn btn-${style}" href="${escapeHtml(href)}" ${attrs}><span>${escapeHtml(label)}</span>${icon('arrow')}</a>`;
}

function consultButton(label = isClinic ? '상담·예약' : '정보·제휴 문의', location = 'header', style = 'primary') {
  return button(consultUrl, label, style, `target="_blank" rel="noopener noreferrer" data-consult="${escapeHtml(location)}"`);
}

function brand() {
  return `<a class="brand" href="/" aria-label="${escapeHtml(config.siteName)} 홈"><img class="brand-mark" src="/icons/brand-mark.svg" alt="" width="42" height="42"><span class="brand-name">${escapeHtml(brandName.replace('.com', ''))}<span class="com">.com</span></span></a>`;
}

function header(activePath = '/') {
  const overlayHero = hubs.some((hub) => hub.path === activePath);
  const links = [
    { href: '/', label: '창원 피부과' },
    { href: '/sangnam/', label: '상남동 피부과' },
    { href: '/jungdong/', label: '중동 피부과' },
    { href: '/blog/', label: '피부 정보' },
    { href: '/about/', label: '사이트 안내' },
  ];
  const nav = links.map((link) => {
    const active = link.href === '/' ? activePath === '/' : activePath.startsWith(link.href);
    return `<a href="${link.href}"${active ? ' aria-current="page"' : ''}>${escapeHtml(link.label)}</a>`;
  }).join('');
  return `<header class="site-header${overlayHero ? ' site-header-overlay' : ''}"><div class="container header-inner">${brand()}<nav class="main-nav" data-main-nav aria-label="주요 메뉴">${nav}</nav><div class="header-actions">${consultButton(undefined, 'header')}<button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false" data-menu-toggle>${icon('menu')}</button></div></div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container footer-main"><div class="footer-brand">${brand()}<p>${escapeHtml(config.tagline)}<br>본 사이트는 의료기관이 아니며 진단과 예약은 실제 의료기관에서 진행됩니다.</p></div><div class="footer-col"><h3>지역 정보</h3><a href="/">창원 피부과</a><a href="/sangnam/">상남동 피부과</a><a href="/jungdong/">중동 피부과</a><a href="/blog/">피부 정보</a></div><div class="footer-col"><h3>사이트 안내</h3><a href="/about/">사이트 소개</a><a href="/editorial-policy/">편집 원칙</a><a href="/authors/">작성자 안내</a><a href="/corrections/">정보 수정 요청</a></div><div class="footer-col"><h3>운영·제휴</h3><a href="/partner/">병원 입점 안내</a><a href="/advertising-policy/">광고·제휴 정책</a><a href="/privacy/">개인정보처리방침</a><a href="${escapeHtml(consultUrl)}" target="_blank" rel="noopener noreferrer">카카오톡 문의</a></div></div><div class="container footer-bottom"><span>운영사 ${escapeHtml(config.publisher.name)} · 콘텐츠 작성 ${escapeHtml(config.publisher.editorialName)}</span><span>© 2026 ${escapeHtml(config.siteName)}</span></div></footer><a class="mobile-consult" href="${escapeHtml(consultUrl)}" target="_blank" rel="noopener noreferrer" data-consult="mobile">${isClinic ? '상담·예약' : '정보·제휴 문의'}</a>`;
}

function publisherSchema() {
  if (isClinic) {
    return {
      '@context': 'https://schema.org',
      '@type': 'MedicalClinic',
      '@id': `${origin}/#clinic`,
      name: config.clinic.name,
      legalName: config.clinic.legalName || config.clinic.name,
      url: origin,
      logo: urlFor(config.clinic.logo || '/icons/brand-mark.svg'),
      image: urlFor('/images/common/og-default.webp'),
      telephone: config.clinic.phone || undefined,
      address: config.clinic.address ? { '@type': 'PostalAddress', streetAddress: config.clinic.address, addressCountry: 'KR' } : undefined,
      medicalSpecialty: config.clinic.specialties,
      sameAs: [config.clinic.kakaoUrl, config.clinic.naverBookingUrl].filter(Boolean),
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${origin}/#publisher`,
    name: config.publisher.name,
    url: origin,
    logo: urlFor('/icons/brand-mark.svg'),
    sameAs: [config.publisher.kakaoUrl],
  };
}

function editorialSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${origin}/#editorial`,
    name: config.publisher.editorialName,
    url: urlFor('/authors/'),
    parentOrganization: { '@id': isClinic ? `${origin}/#clinic` : `${origin}/#publisher` },
  };
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name: config.siteName,
    url: origin,
    description: config.tagline,
    publisher: { '@id': isClinic ? `${origin}/#clinic` : `${origin}/#publisher` },
    inLanguage: 'ko-KR',
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: urlFor(item.href) })),
  };
}

function layout({ pathName = '/', title, description, body, schemas = [], noindex = false, ogImage = '/images/common/og-default.webp', bodyClass = '' }) {
  const canonical = urlFor(pathName);
  const robots = noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large';
  const schemaScripts = [publisherSchema(), editorialSchema(), ...schemas].map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join('\n');
  const ga = config.analytics.ga4Id ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(config.analytics.ga4Id)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${escapeHtml(config.analytics.ga4Id)}');</script>` : '';
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${robots}"><link rel="canonical" href="${canonical}"><link rel="icon" href="/icons/favicon.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${escapeHtml(config.siteName)} 블로그 RSS" href="${urlFor('/rss.xml')}"><meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="${escapeHtml(config.siteName)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${urlFor(ogImage)}"><meta name="twitter:card" content="summary_large_image"><link rel="preload" href="${cssPath}" as="style"><link rel="stylesheet" href="${cssPath}">${ga}${schemaScripts}<script src="${jsPath}" defer></script></head><body class="${escapeHtml(bodyClass)}"><a class="skip-link" href="#main">본문 바로가기</a>${header(pathName)}<main id="main">${body}</main>${footer()}</body></html>`;
}

function trustRow() {
  const items = [
    ['note', '공공기관 자료 참고', '질병관리청·식약처·심평원 자료를 확인합니다.'],
    ['clock', '최종 수정일 표시', '내용을 보완한 날짜를 각 글에 남깁니다.'],
    ['shield', '과장 없이 안내', '효과를 단정하기보다 확인할 기준을 정리합니다.'],
    ['chat', '정보 수정 요청', '오류나 누락은 확인한 뒤 바로잡습니다.'],
  ];
  return `<div class="trust-row">${items.map(([ic, title, text]) => `<div class="trust-item"><span class="trust-icon">${icon(ic)}</span><div><h3>${title}</h3><p>${text}</p></div></div>`).join('')}</div>`;
}

function concernStrip() {
  return `<section class="concern-strip" aria-labelledby="concern-title"><div class="container concern-inner"><h2 id="concern-title">많이 찾는<br>피부 고민</h2><div class="concern-list">${concerns.map((item) => `<a href="${item.href}"><span class="concern-thumb"><img src="${item.image}" alt="${escapeHtml(item.alt)}" width="540" height="540" loading="lazy"></span><span class="concern-label">${escapeHtml(item.label)}</span></a>`).join('')}</div></div></section>`;
}

function criteriaSection() {
  const criteria = [
    ['person', '의료진과 진료범위', '전문의 여부와 내가 원하는 진료를 실제로 다루는지 확인합니다.'],
    ['search', '장비와 제품 정보', '이름만 보기보다 선택 이유와 피부 상태에 맞는 계획을 들어봅니다.'],
    ['clock', '통증과 회복기간', '중요한 일정, 출근과 육아에 무리가 없는지 미리 확인합니다.'],
    ['shield', '사후 연락과 재진', '예상 밖의 증상이 있을 때 연락할 방법과 재진 기준을 알아둡니다.'],
  ];
  return `<section class="section section-white"><div class="container"><div class="section-head-center"><p class="section-kicker">상담 전에 확인하면 좋은 내용</p><h2 class="section-title">가까운 곳인지와 함께<br>설명과 관리도 살펴보세요</h2><p class="section-desc">피부과 선택은 한 가지 기준으로 끝나지 않습니다. 현재 고민과 생활 일정에 맞춰 네 가지를 차분히 확인해보세요.</p></div><div class="criteria-grid">${criteria.map(([ic, title, text]) => `<div class="criteria-item"><span class="criteria-icon">${icon(ic)}</span><h3>${title}</h3><p>${text}</p></div>`).join('')}</div></div></section>`;
}

function cardGrid(hub) {
  return `<section id="regional-guides" class="section"><div class="container"><div class="section-head"><div><p class="section-kicker">${escapeHtml(hub.name)} 주제별 안내</p><h2 class="section-title">${escapeHtml(hub.introTitle)}</h2><p class="section-desc">${escapeHtml(hub.introText)}</p></div><a class="btn-link" href="/blog/">블로그 더 보기 ${icon('arrow')}</a></div><div class="carousel-grid">${hub.cards.map((card) => `<article class="info-card"><a href="${card.href}" aria-label="${escapeHtml(card.title)}"><div class="card-image"><img src="${card.image}" alt="${escapeHtml(card.alt)}" width="1600" height="1067" loading="lazy"><span class="card-number">${card.number}</span></div><div class="card-body"><span class="card-category">${escapeHtml(card.category)}</span><h3 class="card-title">${escapeHtml(card.title)}</h3><p class="card-text">${escapeHtml(card.description)}</p><span class="card-link">정보 확인하기 ${icon('arrow')}</span></div></a></article>`).join('')}</div></div></section>`;
}

function regionSection(activeKey) {
  const regions = [
    { key: 'changwon', name: '창원 피부과', href: '/', image: '/images/common/region-changwon.webp', small: '창원 성산구·의창구', text: '창원 전반의 피부과 선택 기준과 여드름·색소·리프팅 정보를 폭넓게 확인하세요.' },
    { key: 'sangnam', name: '상남동 피부과', href: '/sangnam/', image: '/images/common/region-sangnam.webp', small: '성산구 상남동 생활권', text: '업무와 약속 일정에 맞춰 상담 시간, 회복기간과 재방문 기준을 정리했습니다.' },
    { key: 'jungdong', name: '중동 피부과', href: '/jungdong/', image: '/images/common/region-jungdong.webp', small: '의창구 중동 생활권', text: '주거 생활권에서 반복 방문과 가족 일정까지 고려한 피부 정보를 확인하세요.' },
  ];
  return `<section class="section section-soft"><div class="container"><div class="section-head"><div><p class="section-kicker">창원 지역별 피부 정보</p><h2 class="section-title">창원·상남동·중동, 검색 목적에 맞는 페이지로</h2><p class="section-desc">세 지역은 같은 템플릿에 지역명만 바꾼 페이지가 아니라 생활권과 검색 의도에 맞춰 내용과 상세 문서를 각각 다르게 구성했습니다.</p></div></div><div class="region-split region-triple">${regions.map((region) => `<article class="region-card"><img src="${region.image}" alt="${escapeHtml(region.name)} 관련 피부 이미지" width="1600" height="1067" loading="lazy"><div class="region-copy"><small>${region.small}${region.key === activeKey ? ' · 현재 페이지' : ''}</small><h3>${region.name}</h3><p>${region.text}</p><a href="${region.href}">${region.key === activeKey ? '현재 페이지 다시 보기' : '지역 정보 보기'} ${icon('arrow')}</a></div></article>`).join('')}</div></div></section>`;
}

function blogCards(limit = 4) {
  return `<section class="section section-white"><div class="container"><div class="section-head"><div><p class="section-kicker">피부과 블로그</p><h2 class="section-title">상담 전 궁금했던 내용을 읽어보세요</h2><p class="section-desc">장비 이름이나 유행하는 표현보다 실제 상담에서 확인하면 좋은 내용을 중심으로 작성합니다.</p></div><a class="btn-link" href="/blog/">전체 글 보기 ${icon('arrow')}</a></div><div class="blog-grid">${blogPosts.slice(0, limit).map((post) => blogCard(post)).join('')}</div></div></section>`;
}

function blogCard(post, heading = 'h3') {
  return `<article class="blog-card"><a href="/blog/${post.slug}/"><div class="blog-card-image"><img src="${post.image}" alt="${escapeHtml(post.title)} 대표 이미지" width="1200" height="630" loading="lazy"></div><div class="blog-card-body"><div class="blog-meta"><span class="blog-category">${escapeHtml(post.category)}</span><time datetime="${post.updated}">${post.updated.replaceAll('-', '.')}</time></div><${heading}>${escapeHtml(post.title)}</${heading}><p>${escapeHtml(post.description)}</p><span class="card-link">읽어보기 ${icon('arrow')}</span></div></a></article>`;
}

function ctaBanner() {
  return `<section class="section section-compact"><div class="container"><div class="cta-banner"><div class="cta-copy"><p class="section-kicker" style="color:#ead0ad">창원 지역 피부과 입점 안내</p><h2>창원피부과.com을<br>병원 홈페이지로 사용할 수 있습니다</h2><p>현재는 주식회사 지바가 운영하는 지역 피부정보 사이트입니다. 입점이 확정되면 병원명, 로고, 의료진, 실제 시설사진과 상담채널을 해당 병원 정보로 변경합니다.</p><div class="button-row">${button('/partner/', '병원 입점 안내', 'light')}${consultButton('입점 문의하기', 'home-partner', 'secondary')}</div></div><div class="cta-visual"><img src="/images/common/partner-hero.webp" alt="피부과 상담을 표현한 이미지" width="1600" height="1067" loading="lazy"></div></div></div></section>`;
}

function hubSchemas(hub) {
  const list = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${urlFor(hub.path)}#carousel`,
    name: `${hub.name} 주요 피부 정보`,
    numberOfItems: 6,
    itemListElement: hub.cards.map((card, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: card.title,
      image: urlFor(card.image),
      url: urlFor(card.href),
    })),
  };
  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${urlFor(hub.path)}#webpage`,
    url: urlFor(hub.path),
    name: hub.pageTitle,
    description: hub.description,
    isPartOf: { '@id': `${origin}/#website` },
    publisher: { '@id': isClinic ? `${origin}/#clinic` : `${origin}/#publisher` },
    about: [{ '@type': 'Thing', name: '피부과 진료·시술 정보' }, { '@type': 'Place', name: hub.name.replace(' 피부과', ''), containedInPlace: { '@type': 'City', name: '창원시' } }],
    spatialCoverage: hub.coverage.map((name) => ({ '@type': 'Place', name })),
    mainEntity: { '@id': `${urlFor(hub.path)}#carousel` },
    primaryImageOfPage: { '@type': 'ImageObject', url: urlFor(hub.heroPoster), contentUrl: urlFor(hub.heroPoster), width: 1600, height: 900 },
    inLanguage: 'ko-KR',
    datePublished: TODAY,
    dateModified: TODAY,
  };
  const video = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${urlFor(hub.path)}#hero-video`,
    name: `${hub.name} 히어로 영상`,
    description: hub.heroText,
    thumbnailUrl: [urlFor(hub.heroPoster)],
    uploadDate: `${TODAY}T09:00:00+09:00`,
    duration: hub.key === 'jungdong' ? 'PT6.8S' : 'PT7.5S',
    contentUrl: urlFor(hub.heroVideoDesktopMp4),
    inLanguage: 'ko-KR',
  };
  const crumbs = hub.path === '/' ? [{ name: '창원 피부과', href: '/' }] : [{ name: '창원 피부과', href: '/' }, { name: hub.name, href: hub.path }];
  return [websiteSchema(), page, video, list, breadcrumbSchema(crumbs)];
}

function renderHero(hub) {
  const media = `<div class="hero-media"><video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="${escapeHtml(hub.heroPoster)}" aria-label="${escapeHtml(hub.name)} 배경 영상"><source media="(max-width: 860px)" src="${escapeHtml(hub.heroVideoMobileWebm)}" type="video/webm"><source media="(max-width: 860px)" src="${escapeHtml(hub.heroVideoMobileMp4)}" type="video/mp4"><source src="${escapeHtml(hub.heroVideoDesktopWebm)}" type="video/webm"><source src="${escapeHtml(hub.heroVideoDesktopMp4)}" type="video/mp4"></video></div>`;
  const desktopTitle = hub.heroTitle.map((line) => `<span>${escapeHtml(line)}</span>`).join('');
  const mobileTitle = (hub.mobileTitle || hub.heroTitle).map((line) => `<span>${escapeHtml(line)}</span>`).join('');
  return `<section class="hero hero-${escapeHtml(hub.key)} hero-align-${escapeHtml(hub.heroAlign || 'left')}">${media}<div class="container hero-inner"><div class="hero-copy"><p class="eyebrow">${escapeHtml(hub.eyebrow)}</p><h1><span class="hero-title-desktop">${desktopTitle}</span><span class="hero-title-mobile">${mobileTitle}</span></h1><p class="hero-text"><span class="hero-text-desktop">${escapeHtml(hub.heroText)}</span><span class="hero-text-mobile">${escapeHtml(hub.mobileText || hub.heroText)}</span></p><div class="button-row">${button('#regional-guides', '피부 고민별 정보 보기', 'primary')}${consultButton(undefined, `hero-${hub.key}`, 'secondary')}</div><div class="hero-note"><span>${icon('note')} 공공기관 자료 참고</span><span>${icon('clock')} 최종 수정일 표시</span><span>${icon('shield')} 과장 없이 안내</span></div></div></div></section>`;
}

function renderHub(hub) {
  const body = `${renderHero(hub)}${concernStrip()}<section class="section local-intro-section"><div class="container local-intro"><p class="section-kicker">${escapeHtml(hub.name)} 생활권 안내</p><h2>${escapeHtml(hub.introTitle)}</h2><p>${escapeHtml(hub.localSummary)}</p></div></section>${cardGrid(hub)}${criteriaSection()}${regionSection(hub.key)}${blogCards()}<section class="section-compact"><div class="container">${trustRow()}</div></section>${ctaBanner()}`;
  const ogImage = hub.heroPoster || hub.heroImage || '/images/common/og-default.webp';
  return layout({ pathName: hub.path, title: hub.pageTitle, description: hub.description, body, schemas: hubSchemas(hub), ogImage, bodyClass: `overlay-hero-page hub-${hub.key}` });
}

function byline() {
  return `<div class="article-byline"><span><strong>작성</strong> ${escapeHtml(config.publisher.editorialName)}</span><span><strong>운영</strong> ${escapeHtml(config.publisher.name)}</span><span><strong>최종 수정</strong> ${TODAY.replaceAll('-', '.')}</span></div>`;
}

function sidebarFor(hub, currentHref = '') {
  const links = hub.cards.filter((card) => card.href !== currentHref).slice(0, 5);
  return `<aside class="article-sidebar"><div class="sidebar-sticky"><div class="sidebar-box"><h3>상담 전 더 확인할 내용</h3><p>${hub.name} 페이지에서 다른 피부 고민도 함께 살펴볼 수 있습니다.</p><div class="sidebar-links">${links.map((card) => `<a href="${card.href}">${escapeHtml(card.title)}</a>`).join('')}</div></div><div class="sidebar-box"><h3>정보·제휴 문의</h3><p>현재 문의는 ${config.siteName} 운영 상담창구로 연결됩니다. 실제 진료와 의학적 판단은 의료기관에서 진행됩니다.</p>${consultButton(undefined, 'article-sidebar')}</div></div></aside>`;
}

function articleBody(article, hub, isBlog = false) {
  const opening = article.opening || [article.lead];
  const summary = article.summary || article.checklist?.slice(0, 3) || [];
  const faq = article.faq || [];
  return `<section class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="현재 위치"><a href="/">창원 피부과</a><span>›</span>${isBlog ? `<a href="/blog/">블로그</a><span>›</span>` : hub.path !== '/' ? `<a href="${hub.path}">${hub.name}</a><span>›</span>` : ''}<span>${escapeHtml(article.category)}</span></nav><p class="section-kicker">${escapeHtml(article.category)}</p><h1>${escapeHtml(article.title)}</h1><p class="lead">${escapeHtml(article.description)}</p></div></section><div class="container article-wrap"><article class="article-main"><figure class="article-cover"><img src="${article.image}" alt="${escapeHtml(article.imageAlt || `${article.title} 대표 이미지`)}" width="1600" height="1067"></figure>${byline()}${summary.length ? `<section class="article-summary"><h2>먼저 확인할 내용</h2><ul>${summary.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>` : ''}${opening.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}${article.sections.map((section) => `<section class="article-section"><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('')}${article.checklist?.length ? `<section class="article-section"><h2>상담 전 체크리스트</h2><ul class="check-list">${article.checklist.map((item) => `<li>${icon('check')}${escapeHtml(item)}</li>`).join('')}</ul></section>` : ''}${faq.length ? `<section class="article-section"><h2>자주 묻는 질문</h2><div class="faq-list">${faq.map((item, index) => `<div class="faq-item${index === 0 ? ' open' : ''}"><button class="faq-question" type="button" aria-expanded="${index === 0 ? 'true' : 'false'}"><span>${escapeHtml(item.q)}</span>${icon('plus')}</button><div class="faq-answer">${escapeHtml(item.a)}</div></div>`).join('')}</div></section>` : ''}<section class="references"><h2>참고한 공식 자료</h2>${article.references.map((ref) => `<a href="${ref.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.name)}</a>`).join('')}<p style="font-size:12px;color:var(--muted)">이 글은 일반적인 정보 제공을 위한 내용이며 개인의 진단과 치료를 대신하지 않습니다.</p></section></article>${sidebarFor(hub, isBlog ? '' : `/${article.slug}/`)}</div>`;
}

function articleSchemas(article, hub, isBlog = false) {
  const pathName = isBlog ? `/blog/${article.slug}/` : `/${article.slug}/`;
  const articleType = isBlog ? 'BlogPosting' : 'Article';
  const schema = {
    '@context': 'https://schema.org',
    '@type': [articleType, 'MedicalWebPage'],
    '@id': `${urlFor(pathName)}#article`,
    headline: article.title,
    description: article.description,
    url: urlFor(pathName),
    mainEntityOfPage: { '@id': `${urlFor(pathName)}#webpage` },
    image: { '@type': 'ImageObject', url: urlFor(article.image), width: isBlog ? 1200 : 1600, height: isBlog ? 630 : 1067 },
    author: { '@id': `${origin}/#editorial` },
    publisher: { '@id': isClinic ? `${origin}/#clinic` : `${origin}/#publisher` },
    datePublished: article.published || TODAY,
    dateModified: article.updated || TODAY,
    lastReviewed: article.updated || TODAY,
    inLanguage: 'ko-KR',
    isAccessibleForFree: true,
    articleSection: article.category,
    about: [{ '@type': 'MedicalCondition', name: article.category }, { '@type': 'Place', name: hub.name.replace(' 피부과', ''), containedInPlace: { '@type': 'City', name: '창원시' } }],
    spatialCoverage: { '@type': 'Place', name: hub.name.replace(' 피부과', '') },
    citation: article.references.map((ref) => ref.url),
  };
  const webpage = { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${urlFor(pathName)}#webpage`, url: urlFor(pathName), name: article.title, description: article.description, isPartOf: { '@id': `${origin}/#website` }, primaryImageOfPage: { '@type': 'ImageObject', url: urlFor(article.image) } };
  const crumbs = isBlog ? [{ name: '창원 피부과', href: '/' }, { name: '피부 정보', href: '/blog/' }, { name: article.title, href: pathName }] : [{ name: '창원 피부과', href: '/' }, ...(hub.path === '/' ? [] : [{ name: hub.name, href: hub.path }]), { name: article.title, href: pathName }];
  return [websiteSchema(), webpage, schema, breadcrumbSchema(crumbs)];
}

function renderRegionalArticle(article) {
  const hub = hubs.find((item) => item.key === article.hubKey);
  const pathName = `/${article.slug}/`;
  return layout({ pathName, title: `${article.title} | ${config.siteName}`, description: article.description, body: articleBody(article, hub, false), schemas: articleSchemas(article, hub, false), ogImage: article.image });
}

function renderBlogIndex() {
  const pathName = '/blog/';
  const body = `<section class="blog-index-hero"><div class="container"><p class="section-kicker">창원피부과.com 피부 정보</p><h1>피부 정보</h1><p>여드름·색소·리프팅·주사 시술과 피부질환을 알아볼 때 상담 전에 확인하면 좋은 내용을 어렵지 않게 정리합니다.</p></div></section><div class="container blog-index-grid">${blogPosts.map((post) => blogCard(post, 'h2')).join('')}</div>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${urlFor(pathName)}#blog`,
    name: `${config.siteName} 피부과 블로그`,
    url: urlFor(pathName),
    description: '창원·상남동·중동 생활권에서 피부과를 알아볼 때 도움이 되는 진료·시술 정보를 정리합니다.',
    publisher: { '@id': isClinic ? `${origin}/#clinic` : `${origin}/#publisher` },
    blogPost: blogPosts.map((post) => ({ '@type': 'BlogPosting', headline: post.title, url: urlFor(`/blog/${post.slug}/`), image: urlFor(post.image) })),
  };
  return layout({ pathName, title: `피부 정보 | ${config.siteName}`, description: '피부과 전문의 확인, 여드름과 색소, 리프팅, 보톡스·필러, 스킨부스터와 피부질환 정보를 읽기 쉽게 정리합니다.', body, schemas: [websiteSchema(), schema, breadcrumbSchema([{ name: '창원 피부과', href: '/' }, { name: '피부 정보', href: '/blog/' }])] });
}

function renderBlogPost(post) {
  const hub = hubs[0];
  const pathName = `/blog/${post.slug}/`;
  return layout({ pathName, title: `${post.title} | ${config.siteName}`, description: post.description, body: articleBody(post, hub, true), schemas: articleSchemas(post, hub, true), ogImage: post.image });
}

const prosePages = {
  '/about/': {
    title: `사이트 안내 | ${config.siteName}`,
    description: `${config.siteName}의 운영 목적과 정보 작성 기준을 안내합니다.`,
    heading: '창원·상남동·중동 피부 정보를 지역별로 정리합니다',
    intro: `${config.siteName}은 ${config.publisher.name}가 운영하는 지역 피부정보 사이트입니다. 현재 특정 의료기관의 홈페이지가 아니며, 상담 전에 확인하면 좋은 내용을 이해하기 쉽게 전달합니다.`,
    sections: [
      ['사이트에서 다루는 내용', '창원 피부과, 상남동 피부과, 중동 피부과를 찾을 때 자주 확인하는 병원 선택 기준과 여드름·색소·리프팅·주사 시술, 피부질환 정보를 다룹니다.'],
      ['지역 페이지를 나눈 이유', '세 페이지는 지역명만 바꾼 복제 문서가 아니라 창원 전반, 상남동의 도심 생활 일정, 중동의 주거·재방문 동선처럼 서로 다른 검색 목적에 맞춰 내용을 구성합니다.'],
      ['정보 작성 방법', '질병관리청, 식품의약품안전처와 건강보험심사평가원 등 공개자료를 참고하고 효과를 단정하기보다 상담에서 확인할 질문을 중심으로 작성합니다.'],
      ['병원이 입점하면', '입점 계약이 완료된 경우 병원명, 의료진, 실제 사진, 주소·진료시간과 상담채널을 사실 확인 후 해당 병원 정보로 변경합니다.'],
    ],
  },
  '/editorial-policy/': {
    title: `편집 원칙 | ${config.siteName}`,
    description: `${config.siteName}이 피부 정보를 선정하고 작성·수정하는 원칙입니다.`,
    heading: '검색을 위한 문장보다 도움이 되는 정보를 우선합니다',
    intro: '지역 키워드를 억지로 반복하지 않고 실제 상담 전에 필요한 내용을 중심으로 작성하며, 지역 허브와 상세 문서가 서로 다른 역할을 갖도록 관리합니다.',
    sections: [
      ['주제 선정', '여드름, 색소, 리프팅, 보톡스·필러, 스킨부스터와 피부질환처럼 실제 피부과 상담에서 자주 확인하는 내용을 우선합니다.'],
      ['지역 콘텐츠 차별화', '창원·상남동·중동 허브는 생활권과 방문 목적을 달리해 제목, 본문, 카드, 내부링크와 상세 문서를 별도로 구성합니다.'],
      ['문장 작성 원칙', '효과를 보장하거나 불안을 과도하게 자극하는 표현을 피하고 통증, 회복기간, 한계와 사후관리까지 함께 안내합니다.'],
      ['AI와 제작 도구', '초안 정리와 이미지·영상 제작에 도구를 사용할 수 있으나 공개 전 편집팀이 문맥과 사용자 혼동 가능성을 확인합니다. 생성 이미지는 실제 의료진이나 실제 병원 시설로 소개하지 않습니다.'],
    ],
  },
  '/authors/': {
    title: `작성자 안내 | ${config.siteName}`,
    description: `${config.siteName} 편집팀과 운영사 정보를 안내합니다.`,
    heading: '창원피부과.com 편집팀',
    intro: `${config.publisher.editorialName}은 ${config.publisher.name}가 운영하는 콘텐츠 편집 조직입니다. 의료인이 아니며 공개자료 조사와 지역 정보 정리, 문장·이미지 검수를 담당합니다.`,
    sections: [
      ['주요 업무', '피부 관련 공개자료를 확인하고 창원·상남동·중동 생활권에서 상담 전에 물어볼 내용을 지역별로 정리합니다.'],
      ['의료 검수 표기', '입점 후 실제 의료진이 글을 검수한 경우에만 해당 글에 검수자와 검수일을 표시합니다.'],
      ['문의', `내용 오류나 제휴 문의는 ${config.publisher.name} 카카오톡 채널을 통해 접수합니다.`],
    ],
  },
  '/corrections/': {
    title: `정보 수정 요청 | ${config.siteName}`,
    description: `${config.siteName}에 게시된 정보의 오류와 누락을 수정 요청하는 방법입니다.`,
    heading: '잘못된 정보나 누락을 알려주세요',
    intro: '오탈자뿐 아니라 출처 변경, 설명이 모호한 부분과 실제 의료기관 정보의 오류가 확인되면 수정합니다.',
    sections: [
      ['접수할 내용', '수정이 필요한 페이지 주소와 문장, 확인할 수 있는 공식 출처를 함께 보내주시면 확인이 빨라집니다.'],
      ['확인 절차', '제보 내용을 공개자료 또는 관련 기관의 공식 안내와 비교하고 필요한 경우 추가 자료를 요청합니다.'],
      ['반영 기준', '사실 오류는 확인 후 수정하고 최종 수정일을 갱신합니다. 의견 차이가 있는 내용은 한쪽 주장만 단정하지 않고 출처와 표현을 다시 검토합니다.'],
    ],
  },
};

function renderProsePage(pathName, page) {
  const body = `<div class="narrow prose-page"><p class="section-kicker">${config.siteName}</p><h1>${escapeHtml(page.heading)}</h1><p class="intro">${escapeHtml(page.intro)}</p>${page.sections.map(([heading, text]) => `<section class="prose-section"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text)}</p></section>`).join('')}</div>`;
  const schema = { '@context': 'https://schema.org', '@type': 'AboutPage', '@id': `${urlFor(pathName)}#webpage`, name: page.title, description: page.description, url: urlFor(pathName), publisher: { '@id': isClinic ? `${origin}/#clinic` : `${origin}/#publisher` } };
  return layout({ pathName, title: page.title, description: page.description, body, schemas: [websiteSchema(), schema, breadcrumbSchema([{ name: '창원 피부과', href: '/' }, { name: page.heading, href: pathName }])] });
}

function renderPartner() {
  const pathName = '/partner/';
  const body = `<section class="partner-hero"><div class="partner-copy"><p class="section-kicker">창원 지역 피부과 유료 입점</p><h1>이미 구축된 창원피부과.com을<br>병원 홈페이지로 전환할 수 있습니다</h1><p>현재 검색 수집을 위한 지역 피부정보 사이트로 운영합니다. 입점이 확정되면 병원명과 로고, 의료진, 실제 시설사진, 진료과목과 상담채널을 병원의 실제 정보로 변경합니다.</p><div class="button-row">${consultButton('병원 입점 상담하기', 'partner-hero')}${button('#included', '포함 항목 보기', 'secondary')}</div></div><div class="partner-image"><img src="/images/common/partner-hero.webp" alt="피부과 입점 상담을 표현한 이미지" width="1600" height="1067"></div></section><section class="section section-white"><div class="container"><div class="section-head-center"><p class="section-kicker">병원 브랜드에 맞춰 전환</p><h2 class="section-title">입점 뒤에는 실제 병원 정보와 상담 동선을 적용합니다</h2><p class="section-desc">검색 순위나 캐러셀 표시를 보장하는 상품이 아니라 독립 웹사이트와 지역 콘텐츠를 운영하는 방식입니다.</p></div><div class="partner-benefits"><div class="partner-benefit"><h3>병원 브랜드 적용</h3><p>병원명, 로고, 메인 색상과 문구를 병원 브랜딩에 맞춰 변경합니다.</p></div><div class="partner-benefit"><h3>실제 의료정보 반영</h3><p>의료진, 진료과목, 주소·진료시간과 실제 사진을 병원 확인 후 적용합니다.</p></div><div class="partner-benefit"><h3>상담채널 직접 연결</h3><p>현재 지바 카카오채널을 병원 카카오, 전화와 네이버 예약 동선으로 변경합니다.</p></div></div></div></section><section id="included" class="section section-soft"><div class="container"><div class="section-head"><div><p class="section-kicker">입점 포함 항목</p><h2 class="section-title">병원 자료를 전달하면 홈페이지 전체를 실제 정보로 맞춥니다</h2></div></div><div class="criteria-grid"><div class="criteria-item"><span class="criteria-icon">${icon('person')}</span><h3>병원·의료진 소개</h3><p>병원 소개와 의료진 약력, 전문과목을 실제 자료로 구성합니다.</p></div><div class="criteria-item"><span class="criteria-icon">${icon('note')}</span><h3>진료·시술 페이지</h3><p>실제 운영하는 진료와 시술만 확인해 반영합니다.</p></div><div class="criteria-item"><span class="criteria-icon">${icon('pin')}</span><h3>위치·시간·주차</h3><p>주소, 진료시간, 휴진과 주차 정보를 실제 기준으로 적용합니다.</p></div><div class="criteria-item"><span class="criteria-icon">${icon('chat')}</span><h3>상담·예약 연결</h3><p>카카오톡, 전화와 네이버 예약 버튼을 병원 채널로 연결합니다.</p></div></div></div></section><section class="section section-dark"><div class="container section-head" style="margin-bottom:0"><div><p class="section-kicker" style="color:#e3c9a7">입점 비용과 운영 범위는 상담 후 안내합니다</p><h2 class="section-title">창원 지역 제휴 피부과를 모집합니다</h2><p class="section-desc" style="color:rgba(255,255,255,.72)">실제 병원 자료와 적용 범위를 확인한 뒤 전환 일정을 안내드립니다.</p></div>${consultButton('카카오로 입점 문의', 'partner-bottom', 'light')}</div></section>`;
  return layout({ pathName, title: `병원 입점 안내 | ${config.siteName}`, description: `${config.siteName}을 실제 병원 정보와 상담채널로 전환해 사용하는 유료 입점 상품을 안내합니다.`, body, schemas: [websiteSchema(), breadcrumbSchema([{ name: '창원 피부과', href: '/' }, { name: '병원 입점', href: pathName }])], noindex: true, ogImage: '/images/common/partner-hero.webp' });
}

function renderPolicy(pathName, title, description, sections) {
  const body = `<div class="narrow prose-page"><h1>${escapeHtml(title)}</h1><p class="intro">${escapeHtml(description)}</p>${sections.map(([heading, text]) => `<section class="prose-section"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text)}</p></section>`).join('')}</div>`;
  return layout({ pathName, title: `${title} | ${config.siteName}`, description, body, noindex: true, schemas: [breadcrumbSchema([{ name: '창원 피부과', href: '/' }, { name: title, href: pathName }])] });
}

function render404() {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지를 찾을 수 없습니다 | ${escapeHtml(config.siteName)}</title><meta name="robots" content="noindex"><link rel="stylesheet" href="${cssPath}"></head><body>${header('')}<main class="error-page"><div><h1>404</h1><h2>페이지를 찾을 수 없습니다</h2><p>주소가 바뀌었거나 삭제된 페이지입니다.</p>${button('/', '홈으로 이동', 'primary')}</div></main>${footer()}<script src="${jsPath}" defer></script></body></html>`;
}

// Generate pages.
for (const hub of hubs) writeFile(pathFor(hub.path), renderHub(hub));
for (const article of regionalArticles) writeFile(pathFor(`/${article.slug}/`), renderRegionalArticle(article));
writeFile(pathFor('/blog/'), renderBlogIndex());
for (const post of blogPosts) writeFile(pathFor(`/blog/${post.slug}/`), renderBlogPost(post));
for (const [pathname, page] of Object.entries(prosePages)) writeFile(pathFor(pathname), renderProsePage(pathname, page));
writeFile(pathFor('/partner/'), renderPartner());
writeFile(pathFor('/privacy/'), renderPolicy('/privacy/', '개인정보처리방침', '창원피부과.com은 홈페이지 안에서 직접 상담정보를 입력받지 않으며 외부 카카오톡 채널 연결을 사용합니다.', [
  ['수집하는 정보', '현재 홈페이지 자체에서는 이름, 전화번호, 증상과 사진을 입력받는 별도 상담폼을 운영하지 않습니다. 카카오톡 채널에서 전달하는 정보는 해당 채널 운영 정책과 별도 안내를 따릅니다.'],
  ['분석 도구', '방문 통계를 설정하는 경우 쿠키와 접속 환경 정보가 수집될 수 있으며, 설정된 분석 도구와 이용 목적을 이 페이지에 추가로 고지합니다.'],
  ['문의', `${config.publisher.name} 카카오톡 채널을 통해 개인정보 관련 문의를 접수할 수 있습니다.`],
]));
writeFile(pathFor('/advertising-policy/'), renderPolicy('/advertising-policy/', '광고·제휴 정책', '일반 피부정보와 유료 입점·제휴 콘텐츠를 구분해 표시하는 기준을 안내합니다.', [
  ['유료 제휴 표시', '특정 의료기관이 비용을 지급하고 입점하거나 콘텐츠를 제공하는 경우 광고 또는 제휴 관계를 페이지에서 확인할 수 있도록 표시합니다.'],
  ['사실 확인', '병원명, 의료진, 장비, 진료시간과 비용은 병원이 제공한 자료와 공식 채널을 기준으로 확인하며 과장된 효과 표현은 사용하지 않습니다.'],
  ['검색 노출', '검색 순위와 캐러셀 표시를 보장하지 않으며 네이버 검색 시스템과 정책에 따라 노출 형태가 달라질 수 있습니다.'],
]));
writeFile('404.html', render404());

const indexable = [
  ...hubs.map((hub) => ({ path: hub.path, image: hub.heroPoster || '/images/common/og-default.webp', lastmod: TODAY, priority: hub.path === '/' ? '1.0' : '0.9' })),
  ...regionalArticles.map((article) => ({ path: `/${article.slug}/`, image: article.image, lastmod: TODAY, priority: '0.8' })),
  { path: '/blog/', image: '/images/common/og-default.webp', lastmod: TODAY, priority: '0.8' },
  ...blogPosts.map((post) => ({ path: `/blog/${post.slug}/`, image: post.image, lastmod: post.updated, priority: '0.7' })),
  ...Object.keys(prosePages).map((pathname) => ({ path: pathname, image: '/images/common/og-default.webp', lastmod: TODAY, priority: '0.4' })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${indexable.map((item) => `  <url><loc>${escapeXml(urlFor(item.path))}</loc><lastmod>${item.lastmod}</lastmod><changefreq>${item.path.startsWith('/blog/') ? 'monthly' : 'weekly'}</changefreq><priority>${item.priority}</priority><image:image><image:loc>${escapeXml(urlFor(item.image))}</image:loc></image:image></url>`).join('\n')}\n</urlset>`;
writeFile('sitemap.xml', sitemap);

const rssItems = blogPosts.map((post) => {
  const content = `<p>${escapeHtml(post.lead)}</p>${post.sections.map((section) => `<h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}`).join('')}<h2>상담 전 체크리스트</h2><ul>${post.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><p>작성: ${escapeHtml(config.publisher.editorialName)} · 최종 수정: ${post.updated}</p>`;
  return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(urlFor(`/blog/${post.slug}/`))}</link><guid isPermaLink="true">${escapeXml(urlFor(`/blog/${post.slug}/`))}</guid><description>${escapeXml(post.description)}</description><pubDate>${new Date(`${post.published}T00:00:00+09:00`).toUTCString()}</pubDate><dc:creator>${escapeXml(config.publisher.editorialName)}</dc:creator><content:encoded><![CDATA[${cdata(content)}]]></content:encoded></item>`;
}).join('\n');
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>${escapeXml(config.siteName)} 피부과 블로그</title><link>${escapeXml(urlFor('/blog/'))}</link><description>${escapeXml(config.tagline)}</description><language>ko-KR</language><lastBuildDate>${new Date(`${TODAY}T00:00:00+09:00`).toUTCString()}</lastBuildDate>${rssItems}</channel></rss>`;
writeFile('rss.xml', rss);
writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${urlFor('/sitemap.xml')}\n`);
writeFile('_headers', `/*\n  Cache-Control: public, max-age=0, must-revalidate\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: SAMEORIGIN\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/videos/*\n  Cache-Control: public, max-age=86400\n\n/images/*\n  Cache-Control: public, max-age=86400\n`);
writeFile('_redirects', `https://changwon-dermatology.pages.dev/* ${origin}/:splat 301\nhttps://www.xn--vb0b562al4gzsfbrm.com/* ${origin}/:splat 301\n`);
writeFile('llms.txt', `# ${config.siteName}\n\n${config.tagline}\n\n## Core pages\n- ${urlFor('/')} 창원 피부과\n- ${urlFor('/sangnam/')} 상남동 피부과\n- ${urlFor('/jungdong/')} 중동 피부과\n- ${urlFor('/blog/')} 피부 정보\n\n## Publisher\n- ${config.publisher.name}\n- ${urlFor('/about/')}\n- ${urlFor('/editorial-policy/')}\n\nThis website provides general information and is not a medical clinic in publisher mode.\n`);
writeFile('humans.txt', `Site: ${config.siteName}\nPublisher: ${config.publisher.name}\nEditorial: ${config.publisher.editorialName}\nUpdated: ${TODAY}\n`);
writeFile('manifest.webmanifest', JSON.stringify({ name: config.siteName, short_name: '창원피부과', start_url: '/', display: 'standalone', background_color: config.theme.background, theme_color: config.theme.primary, icons: [{ src: '/icons/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2));

console.log(`Built ${indexable.length} indexable URLs and ${regionalArticles.length + blogPosts.length} article pages into ${DIST}`);
console.log(`Canonical origin: ${origin}`);
console.log(`Mode: ${config.mode}`);
