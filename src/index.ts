#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { computeNatalChart, formatNatalText } from "./astro.js";
import { renderNatalChartPng } from "./chart.js";

const server = new McpServer({ name: "astrology", version: "1.0.0" });

server.registerTool(
  "get_natal_chart",
  {
    title: "Get Natal Chart",
    description:
      "출생 정보(날짜·시각·위경도·시간대)를 받아 서양 점성술 네이탈 차트를 계산한다. 행성별 별자리·하우스와 ASC·MC 텍스트, 그리고 네이탈 차트 PNG를 반환한다.",
    inputSchema: {
      birthDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("생년월일 (YYYY-MM-DD)"),
      birthTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .describe("출생시각 (HH:MM, 24시간)"),
      latitude: z.number().min(-90).max(90).describe("위도 (북위 +, 남위 −)"),
      longitude: z.number().min(-180).max(180).describe("경도 (동경 +, 서경 −)"),
      timezone: z
        .union([z.number(), z.string()])
        .describe('시간대: 숫자 오프셋(예: 9, -4) 또는 IANA 존(예: "Asia/Seoul")'),
    },
  },
  async ({ birthDate, birthTime, latitude, longitude, timezone }) => {
    const chart = computeNatalChart({ birthDate, birthTime, latitude, longitude, timezone });
    const text = formatNatalText(chart);
    const png = await renderNatalChartPng(chart);
    return {
      content: [
        { type: "text", text },
        { type: "image", data: png.toString("base64"), mimeType: "image/png" },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
