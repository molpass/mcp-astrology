// @astrodraw/astrochart(브라우저 UMD)를 jsdom으로 헤드리스 구동 → SVG → sharp로 PNG 변환.
import { JSDOM } from "jsdom";
import { createRequire } from "node:module";
import sharp from "sharp";
import type { NatalChart } from "./astro.js";

const require = createRequire(import.meta.url);

// astrochart가 아는 천체 키만 전달.
const CHART_BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron",
];

export async function renderNatalChartPng(chart: NatalChart, size = 1080): Promise<Buffer> {
  // astrochart는 DOM/SVG에 의존 → jsdom으로 전역 제공.
  const dom = new JSDOM(`<!DOCTYPE html><body><div id="paper"></div></body>`, {
    pretendToBeVisual: true,
  });
  const g = globalThis as any;
  g.window = dom.window;
  g.document = dom.window.document;
  g.self = dom.window;
  g.SVGElement = dom.window.SVGElement;

  const astro = require("@astrodraw/astrochart");
  const Chart = astro.Chart;

  const planets: Record<string, number[]> = {};
  for (const p of chart.planets) {
    if (CHART_BODIES.includes(p.name)) {
      // [황경, 속도] — 속도 음수면 역행 표시.
      planets[p.name] = [p.longitude, p.speed];
    }
  }

  const c = new Chart("paper", size, size);
  c.radix({ planets, cusps: chart.cusps });

  const paper = dom.window.document.getElementById("paper");
  const svgEl = paper ? paper.querySelector("svg") : null;
  const svg = svgEl ? svgEl.outerHTML : paper ? paper.innerHTML : "";
  if (!svg) throw new Error("차트 SVG 생성 실패");

  // 흰 배경 위에 합성(astrochart 기본 배경은 투명).
  return sharp(Buffer.from(svg))
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
}
