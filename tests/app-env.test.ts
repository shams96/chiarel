import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { computeDisputeRateReport, sendMail } = vi.hoisted(() => ({
  computeDisputeRateReport: vi.fn(),
  sendMail: vi.fn(),
}));
vi.mock("@/lib/dispute-monitoring", () => ({ computeDisputeRateReport }));
vi.mock("@/lib/mail", () => ({ sendMail }));

import { isStaging, rootRobotsMetadata } from "@/lib/app-env";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { GET as llmsGet } from "@/app/llms.txt/route";
import StagingBanner from "@/components/StagingBanner";
import { startDisputeMonitorSchedule } from "@/lib/dispute-alert-scheduler";

const original = process.env.APP_ENV;

function setEnv(v: string | undefined) {
  if (v === undefined) delete process.env.APP_ENV;
  else process.env.APP_ENV = v;
}

beforeEach(() => {
  computeDisputeRateReport.mockReset();
  sendMail.mockReset();
  (globalThis as { chiarelDisputeSchedulerStarted?: boolean }).chiarelDisputeSchedulerStarted = undefined;
});

afterEach(() => {
  setEnv(original);
  vi.restoreAllMocks();
});

describe("isStaging", () => {
  it("is false when unset, 'production', empty, or unrecognised", () => {
    for (const v of [undefined, "production", "", "Staging ", "stage"]) {
      setEnv(v);
      expect(isStaging()).toBe(false);
    }
  });
  it("is true only for exactly 'staging'", () => {
    setEnv("staging");
    expect(isStaging()).toBe(true);
  });
});

describe("production (APP_ENV unset)", () => {
  beforeEach(() => setEnv(undefined));

  it("root metadata robots stays index/follow", () => {
    expect(rootRobotsMetadata()).toEqual({ index: true, follow: true });
  });
  it("robots.txt allows crawling and advertises the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe("https://chiarel.com/sitemap.xml");
    const star = (r.rules as { userAgent: string; allow?: string; disallow?: string[] }[]).find(
      (x) => x.userAgent === "*"
    )!;
    expect(star.allow).toBe("/");
    expect(star.disallow).toEqual(["/checkout", "/account"]);
  });
  it("sitemap lists pages", () => {
    expect(sitemap().length).toBeGreaterThan(10);
  });
  it("llms.txt serves the real catalog", async () => {
    const body = await (await llmsGet()).text();
    expect(body).toContain("# CHIAREL");
  });
  it("renders no banner", () => {
    expect(StagingBanner()).toBeNull();
  });
  it("dispute scheduler starts", () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const si = vi.spyOn(globalThis, "setInterval").mockReturnValue(0 as unknown as NodeJS.Timeout);
    computeDisputeRateReport.mockResolvedValue({ overallTier: "ok" });
    startDisputeMonitorSchedule();
    expect(si).toHaveBeenCalledTimes(1);
    expect(computeDisputeRateReport).toHaveBeenCalledTimes(1);
  });
});

describe("staging (APP_ENV=staging)", () => {
  beforeEach(() => setEnv("staging"));

  it("root metadata robots is noindex, nofollow", () => {
    expect(rootRobotsMetadata()).toEqual({ index: false, follow: false });
  });
  it("robots.txt disallows everything for all agents, no sitemap, no AI-crawler allow", () => {
    const r = robots();
    expect(r.rules).toEqual([{ userAgent: "*", disallow: "/" }]);
    expect(r.sitemap).toBeUndefined();
  });
  it("sitemap is empty", () => {
    expect(sitemap()).toEqual([]);
  });
  it("llms.txt does not expose the catalog", async () => {
    const body = await (await llmsGet()).text();
    expect(body).toContain("staging");
    expect(body).not.toContain("# CHIAREL");
  });
  it("renders the banner", () => {
    const el = StagingBanner() as { props: { children: string } } | null;
    expect(el).not.toBeNull();
    expect(el!.props.children).toBe("STAGING — not the live store");
  });
  it("dispute scheduler is a no-op: no check, no timer, no mail", () => {
    const si = vi.spyOn(globalThis, "setInterval");
    startDisputeMonitorSchedule();
    expect(si).not.toHaveBeenCalled();
    expect(computeDisputeRateReport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });
});
