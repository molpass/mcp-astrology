# mcp-astrology

출생 정보를 받아 **서양 점성술 네이탈 차트**(행성별 별자리·하우스, ASC·MC 텍스트 + 차트 PNG)를
반환하는 MCP 서버. "내 네이탈 차트 그려줘"라고 하면 차트 휠 이미지를 돌려준다.

> 구조·네이밍·PNG·설치 규약은 [`STANDARD.md`](STANDARD.md)를 따른다. `mcp-qr` skeleton 복제본.

---

## 계산 / 렌더

- **계산**: [`celestine`](https://www.npmjs.com/package/celestine) — Swiss Ephemeris / JPL Horizons 대조 검증된 천체력.
- **렌더**: [`@astrodraw/astrochart`](https://www.npmjs.com/package/@astrodraw/astrochart)(SVG) → `jsdom`으로 헤드리스 구동 → [`sharp`](https://sharp.pixelplumbing.com)로 PNG 변환.
- 결정론적: 같은 입력 → 같은 차트.

---

## 도구

### `get_natal_chart`

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `birthDate` | string `YYYY-MM-DD` | ✅ | 생년월일 |
| `birthTime` | string `HH:MM` | ✅ | 출생시각 (24시간) |
| `latitude` | number | ✅ | 위도 (북위 +, 남위 −) |
| `longitude` | number | ✅ | 경도 (동경 +, 서경 −) |
| `timezone` | number \| string | ✅ | 숫자 오프셋(`9`, `-4`) 또는 IANA 존(`"Asia/Seoul"`) |

> IANA 존을 주면 해당 출생 시각의 DST를 반영해 오프셋을 산출한다.

**출력 (둘 다 반환)**:
1. 구조화 텍스트 — 행성별 별자리·도수·하우스(역행 `R` 표시), ASC·MC
2. 네이탈 차트 PNG (1080×1080)

예제 출력: [`examples/astrology_example.png`](examples/astrology_example.png)
(1990-05-15 12:00 · 서울 · Asia/Seoul).

---

## 설치

```bash
git clone https://github.com/molpass/mcp-astrology.git
cd mcp-astrology
npm install && npm run build
```

예제 차트를 직접 생성해 보려면:

```bash
npm run example   # examples/astrology_example.png 재생성
```

---

## MCP 등록 (서버명 `astrology`)

```json
{
  "mcpServers": {
    "astrology": {
      "command": "node",
      "args": ["/abs/path/mcp-astrology/dist/index.js"]
    }
  }
}
```

> `/abs/path`는 클론한 실제 절대경로로 바꾼다.
> Windows 예: `"args": ["C:/Users/<you>/mcp-astrology/dist/index.js"]`

---

## 스킬

페어링 스킬: [`skill/astrology.skill.md`](skill/astrology.skill.md) —
위·경도·시간대가 빠지면 사용자에게 질의하도록 안내한다.

## License

MIT
