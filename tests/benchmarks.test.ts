import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getBenchmark } from "@/lib/benchmarks";

describe("benchmarks", () => {
  it("does not advertise S&P 500 coverage later than the bundled CSV history", () => {
    const csvPath = path.join(process.cwd(), "data", "SP500.csv");
    const [, firstDataRow] = readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
    const firstDate = firstDataRow?.split(",")[0];

    expect(firstDate).toBe("1789-05-01");
    expect(getBenchmark("sp500").inceptionDate).toBe(firstDate);
  });
});
