// 예제 네이탈 차트 생성 (고정 출생정보 → 결정론적 재현).
//   실행: npm run example   (먼저 npm run build 필요)
import { computeNatalChart, formatNatalText } from "../dist/astro.js";
import { renderNatalChartPng } from "../dist/chart.js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 샘플: 1990-05-15 12:00, 서울 (37.5665°N, 126.9780°E), KST(+9)
const input = {
  birthDate: "1990-05-15",
  birthTime: "12:00",
  latitude: 37.5665,
  longitude: 126.978,
  timezone: "Asia/Seoul",
};

const chart = computeNatalChart(input);
console.log(formatNatalText(chart));

const png = await renderNatalChartPng(chart);
const out = join(__dirname, "astrology_example.png");
writeFileSync(out, png);
console.log(`\nwrote ${out} (${png.length} bytes)`);
