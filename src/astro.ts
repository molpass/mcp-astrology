// celestine 래퍼 — 네이탈 차트 계산 + 한국어 라벨. 결정론적(같은 입력 → 같은 출력).
import { calculateChart } from "celestine";

// 차트 렌더 + 텍스트에 쓰는 주요 천체 (전통 10행성 + 카이론).
const MAIN_BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron",
] as const;

const PLANET_KR: Record<string, string> = {
  Sun: "태양", Moon: "달", Mercury: "수성", Venus: "금성", Mars: "화성",
  Jupiter: "목성", Saturn: "토성", Uranus: "천왕성", Neptune: "해왕성",
  Pluto: "명왕성", Chiron: "카이론",
};

const SIGN_KR: Record<string, string> = {
  Aries: "양자리", Taurus: "황소자리", Gemini: "쌍둥이자리", Cancer: "게자리",
  Leo: "사자자리", Virgo: "처녀자리", Libra: "천칭자리", Scorpio: "전갈자리",
  Sagittarius: "궁수자리", Capricorn: "염소자리", Aquarius: "물병자리", Pisces: "물고기자리",
};

export function signKR(en: string): string {
  return SIGN_KR[en] ?? en;
}

export interface NatalPlanet {
  name: string;
  nameKR: string;
  signName: string;
  signKR: string;
  degree: number;
  minute: number;
  longitude: number;
  speed: number;
  house: number;
  isRetrograde: boolean;
}

export interface NatalAngle {
  signName: string;
  signKR: string;
  degree: number;
  minute: number;
  longitude: number;
}

export interface NatalChart {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  planets: NatalPlanet[];
  ascendant: NatalAngle;
  midheaven: NatalAngle;
  cusps: number[]; // 12 하우스 경계 황경
}

/** timezone(number offset | IANA | "+09:00" 등) → 시간(소수) 오프셋. IANA는 해당 벽시각 기준 DST 반영. */
export function resolveOffsetHours(
  tz: number | string,
  y: number, mo: number, d: number, h: number, mi: number
): number {
  if (typeof tz === "number") return tz;
  const s = String(tz).trim();
  const m = /^(?:GMT|UTC)?\s*([+-]?)(\d{1,2})(?::?(\d{2}))?$/i.exec(s);
  if (m && /\d/.test(s)) {
    const sign = m[1] === "-" ? -1 : 1;
    return sign * (Number(m[2]) + (m[3] ? Number(m[3]) / 60 : 0));
  }
  // IANA 존
  const approx = new Date(Date.UTC(y, mo - 1, d, h, mi));
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: s, timeZoneName: "longOffset" })
      .formatToParts(approx)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  const mm = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name);
  if (!mm) return 0;
  const sign = mm[1] === "-" ? -1 : 1;
  return sign * (Number(mm[2]) + (mm[3] ? Number(mm[3]) / 60 : 0));
}

export interface NatalInput {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  latitude: number;
  longitude: number;
  timezone: number | string;
}

export function computeNatalChart(input: NatalInput): NatalChart {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.birthDate);
  if (!dm) throw new Error(`birthDate 형식 오류 (YYYY-MM-DD): ${input.birthDate}`);
  const tm = /^(\d{2}):(\d{2})$/.exec(input.birthTime);
  if (!tm) throw new Error(`birthTime 형식 오류 (HH:MM): ${input.birthTime}`);

  const [year, month, day] = [Number(dm[1]), Number(dm[2]), Number(dm[3])];
  const [hour, minute] = [Number(tm[1]), Number(tm[2])];
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error(`날짜/시각 범위 오류: ${input.birthDate} ${input.birthTime}`);
  }

  const offset = resolveOffsetHours(input.timezone, year, month, day, hour, minute);

  const chart = calculateChart({
    year, month, day, hour, minute, second: 0,
    timezone: offset,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  const byName = new Map<string, any>((chart.planets ?? []).map((p: any) => [p.name, p]));
  const planets: NatalPlanet[] = [];
  for (const name of MAIN_BODIES) {
    const p = byName.get(name);
    if (!p) continue;
    planets.push({
      name: p.name,
      nameKR: PLANET_KR[p.name] ?? p.name,
      signName: p.signName,
      signKR: signKR(p.signName),
      degree: p.degree,
      minute: p.minute,
      longitude: p.longitude,
      speed: p.longitudeSpeed ?? 0,
      house: p.house,
      isRetrograde: !!p.isRetrograde,
    });
  }

  const asc = chart.angles.ascendant;
  const mc = chart.angles.midheaven;

  return {
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: offset,
    planets,
    ascendant: {
      signName: asc.signName, signKR: signKR(asc.signName),
      degree: asc.degree, minute: asc.minute, longitude: asc.longitude,
    },
    midheaven: {
      signName: mc.signName, signKR: signKR(mc.signName),
      degree: mc.degree, minute: mc.minute, longitude: mc.longitude,
    },
    cusps: (chart.houses.cusps ?? []).map((c: any) => c.longitude),
  };
}

/** 구조화 텍스트 (행성별 별자리·하우스, ASC·MC). */
export function formatNatalText(c: NatalChart): string {
  const tzStr = (c.timezone >= 0 ? "+" : "") + c.timezone;
  const lines = [
    `네이탈 차트 (${c.birthDate} ${c.birthTime}, 위도 ${c.latitude} 경도 ${c.longitude}, TZ ${tzStr})`,
    "",
    "[행성]",
  ];
  for (const p of c.planets) {
    const deg = `${String(p.degree).padStart(2, "0")}°${String(p.minute).padStart(2, "0")}'`;
    const retro = p.isRetrograde ? " (R)" : "";
    lines.push(`${p.nameKR}(${p.name})  ${p.signKR} ${deg}  · ${p.house}하우스${retro}`);
  }
  const a = c.ascendant, m = c.midheaven;
  lines.push(
    "",
    "[앵글]",
    `ASC(상승점)  ${a.signKR} ${String(a.degree).padStart(2, "0")}°${String(a.minute).padStart(2, "0")}'`,
    `MC(천정)     ${m.signKR} ${String(m.degree).padStart(2, "0")}°${String(m.minute).padStart(2, "0")}'`
  );
  return lines.join("\n");
}
