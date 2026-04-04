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
    width: 1040,
    height: 340,
    chartLeft: 84,
    chartRight: 36,
    chartTop: 20,
    chartBottom: 42,
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
          background: "#ffffff",
          color: "#21150c",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
          padding: "36px 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "#ffffff",
            padding: "8px 4px",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "820px" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#8a5b36",
                }}
              >
                Presidential Markets
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "44px",
                  fontWeight: 700,
                  marginTop: "14px",
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
                  marginTop: "12px",
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
                gap: "8px",
                alignItems: "flex-end",
                fontSize: "18px",
                color: "#5d4939",
              }}
            >
              <div
                style={{
                  display: "flex",
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
              height: "390px",
              position: "relative",
              background: "#ffffff",
              padding: "28px 18px 24px 18px",
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
            {chart.yearTicks.map((tick) => {
              const x =
                chart.chartLeft +
                Math.min(tick.elapsedDays / chart.maxElapsedDays, 1) * chart.plotWidth;
              const labelWidth = 84;
              const labelLeft = Math.min(
                Math.max(x - labelWidth / 2, 20),
                chart.width - labelWidth - 20,
              );

              return (
                <div
                  key={`year-label-${tick.label}`}
                  style={{
                    position: "absolute",
                    left: `${labelLeft + 18}px`,
                    bottom: "16px",
                    width: `${labelWidth}px`,
                    display: "flex",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "rgba(70,48,18,0.68)",
                  }}
                >
                  {tick.label}
                </div>
              );
            })}
            {chart.ticks.map((tick) => {
              const y =
                chart.chartTop +
                (chart.plotHeight -
                  ((tick - chart.min) / (chart.max - chart.min || 1)) * chart.plotHeight);

              return (
                <div
                  key={`value-label-${tick}`}
                  style={{
                    position: "absolute",
                    left: "18px",
                    top: `${(y / chart.height) * 100}%`,
                    width: "72px",
                    marginTop: "-8px",
                    display: "flex",
                    justifyContent: "flex-start",
                    fontSize: "12px",
                    color: "rgba(70,48,18,0.68)",
                  }}
                >
                  {chartMode === "relative"
                    ? formatMetricChange(benchmark, tick)
                    : formatMetricValue(benchmark, tick)}
                </div>
              );
            })}
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
