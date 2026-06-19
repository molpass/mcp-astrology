---
name: astrology
description: Use when the user wants a Western astrology natal/birth chart — "내 네이탈 차트 그려줘", "출생 차트 봐줘", "내 별자리 차트". Collects birth date/time/place, calls get_natal_chart, returns a chart PNG with a short reading. Asks for missing place/time/timezone.
---

# astrology

`mcp-astrology` 서버의 `get_natal_chart` 도구를 호출해 서양 점성술 네이탈 차트(행성·별자리·하우스·ASC/MC)와
차트 휠 PNG를 만든다. 도구는 "사실"(천체 계산·렌더), 이 스킬은 "의미"(정보 수집 + 짧은 해석)를 담당한다.

## 트리거

- "내 네이탈 차트 / 출생 차트 그려줘"
- "내 별자리(태양/달/상승궁) 봐줘"
- 특정 출생 정보로 점성술 차트를 보려는 요청

## 필수 입력 — 없으면 반드시 질의

네이탈 차트는 **출생 시각과 장소**가 있어야 ASC·하우스가 정확하다.
다음 중 빠진 것이 있으면 **딱 필요한 것만 한 번에** 묻는다:

1. **생년월일** (YYYY-MM-DD)
2. **출생 시각** (HH:MM) — 모르면 알려달라고 안내(시간 미상이면 ASC/하우스는 부정확함을 고지)
3. **출생 장소** — 도시명을 받으면 위도(`latitude`)·경도(`longitude`)로 변환해 넣는다
4. **시간대** — 보통 출생 장소의 IANA 존으로 넣으면 된다 (예: 서울 → `"Asia/Seoul"`). DST는 자동 반영됨

예: "네이탈 차트를 그리려면 ① 생년월일 ② 출생 시각(HH:MM) ③ 출생 도시를 알려주세요."

## 동작

1. 위 입력을 확보한다(도시 → 위경도/시간대 매핑).
2. `get_natal_chart` 를 호출한다.
3. 반환된 **차트 PNG**를 보여주고, 핵심을 요약한다:
   - **태양·달·상승궁(ASC)** 3요소를 먼저 짚어준다(가장 많이 찾는 정보).
   - 이어 두드러진 배치(역행 `R`, 앵글 근처 행성 등)를 한두 줄로.

## 파라미터 요약

`birthDate`(YYYY-MM-DD), `birthTime`(HH:MM), `latitude`, `longitude`,
`timezone`(숫자 오프셋 또는 IANA). 모두 필수.

## 주의

- 좌표/시간대를 임의로 추정하지 말 것 — 모르면 사용자에게 묻는다(±오차가 ASC를 크게 바꾼다).
- 계산은 결정론적이며 Swiss Ephemeris 대조 검증된 라이브러리를 쓴다.
- 점성술은 신념 체계다. 해석은 재미/참고용으로 단정적이지 않게 전달한다.
