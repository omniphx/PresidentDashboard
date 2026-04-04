import { ImageResponse } from "next/og";

import { buildComparisonChartModel } from "@/lib/chart";
import { formatMetricChange, formatMetricValue } from "@/lib/format";
import { getHomePageState } from "@/lib/home-state";
import { getPresidentChartData } from "@/lib/market";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { benchmark, chartMode, resolvedLeftId, resolvedRightId } = getHomePageState({
    benchmark: searchParams.get("benchmark") ?? undefined,
    left: searchParams.get("left") ?? undefined,
    right: searchParams.get("right") ?? undefined,
    mode: searchParams.get("mode") ?? undefined,
  });
  const [leftChart, rightChart] = await Promise.all([
    getPresidentChartData(benchmark.id, resolvedLeftId, chartMode),
    getPresidentChartData(benchmark.id, resolvedRightId, chartMode),
  ]);
  const chart = buildComparisonChartModel({
    benchmark,
    chartMode,
    leftSeries: leftChart.series,
    rightSeries: rightChart.series,
    width: 980,
    height: 320,
    chartLeft: 68,
    chartRight: 12,
    chartTop: 16,
    chartBottom: 36,
  });
  const formatValue =
    chartMode === "relative"
      ? formatMetricChange(benchmark, leftChart.comparisonValue)
      : formatMetricValue(benchmark, leftChart.comparisonValue);
  const formatOtherValue =
    chartMode === "relative"
      ? formatMetricChange(benchmark, rightChart.comparisonValue)
      : formatMetricValue(benchmark, rightChart.comparisonValue);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          background:
            "linear-gradient(135deg, rgba(247,241,229,1) 0%, rgba(240,231,214,1) 45%, rgba(225,213,190,1) 100%)",
          color: "#21150c",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
          padding: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            borderRadius: "28px",
            border: "1px solid rgba(122,47,0,0.12)",
            background: "rgba(255,255,255,0.7)",
            padding: "34px",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "760px" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  textTransform: "uppercase",
                  letterSpacing: "0.24em",
                  color: "#bb4d00",
                }}
              >
                Presidential Markets
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "46px",
                  fontWeight: 700,
                  marginTop: "16px",
                  lineHeight: 1.1,
                }}
              >
                {leftChart.entry.displayName} vs {rightChart.entry.displayName}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "20px",
                  color: "#5d4939",
                  marginTop: "14px",
                  lineHeight: 1.4,
                }}
              >
                {benchmark.label} •{" "}
                {chartMode === "relative" ? "Relative term change" : "Absolute term values"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "12px 16px",
                  borderRadius: "999px",
                  background: "rgba(187,77,0,0.08)",
                  border: "1px solid rgba(122,47,0,0.12)",
                  fontSize: "18px",
                  color: "#6d543d",
                }}
              >
                <span style={{ color: "#a84300", marginRight: "10px", fontWeight: 700 }}>
                  {leftChart.entry.displayName}
                </span>
                {formatValue}
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "12px 16px",
                  borderRadius: "999px",
                  background: "rgba(14,165,233,0.08)",
                  border: "1px solid rgba(8,91,122,0.12)",
                  fontSize: "18px",
                  color: "#6d543d",
                }}
              >
                <span style={{ color: "#0f7490", marginRight: "10px", fontWeight: 700 }}>
                  {rightChart.entry.displayName}
                </span>
                {formatOtherValue}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: "360px",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(122,47,0,0.12)",
              background: "rgba(255,255,255,0.84)",
              padding: "20px",
            }}
          >
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} width="100%" height="100%">
              {chart.yearTicks.map((tick) => {
                const x =
                  chart.chartLeft +
                  Math.min(tick.elapsedDays / chart.maxElapsedDays, 1) * chart.plotWidth;

                return (
                  <g key={tick.label}>
                    <line
                      x1={x}
                      x2={x}
                      y1={chart.chartTop}
                      y2={chart.chartTop + chart.plotHeight}
                      stroke="rgba(70,48,18,0.08)"
                    />
                    <text
                      x={x}
                      y={chart.height - 8}
                      textAnchor={
                        tick.elapsedDays === 0
                          ? "start"
                          : tick.elapsedDays >= chart.maxElapsedDays
                            ? "end"
                            : "middle"
                      }
                      fill="rgba(70,48,18,0.68)"
                      fontSize="12"
                    >
                      {tick.label}
                    </text>
                  </g>
                );
              })}
              {chart.ticks.map((tick) => {
                const y =
                  chart.chartTop +
                  (chart.plotHeight -
                    ((tick - chart.min) / (chart.max - chart.min || 1)) * chart.plotHeight);

                return (
                  <g key={tick}>
                    <line
                      x1={chart.chartLeft}
                      x2={chart.chartLeft + chart.plotWidth}
                      y1={y}
                      y2={y}
                      stroke="rgba(70,48,18,0.14)"
                      strokeDasharray="6 8"
                    />
                    <text
                      x="0"
                      y={Math.max(chart.chartTop + 12, y - 8)}
                      fill="rgba(70,48,18,0.68)"
                      fontSize="12"
                    >
                      {chartMode === "relative"
                        ? formatMetricChange(benchmark, tick)
                        : formatMetricValue(benchmark, tick)}
                    </text>
                  </g>
                );
              })}
              <g transform={`translate(${chart.chartLeft} ${chart.chartTop})`}>
                <path
                  d={chart.leftPath}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d={chart.rightPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
