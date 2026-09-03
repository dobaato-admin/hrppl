import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The behaviour of `enforcePublicRateLimit`, proved rather than assumed.
 *
 * This needed a real test because the function is *designed* to do nothing in
 * most failure cases, and "does nothing" is indistinguishable from "is broken"
 * from the outside. During the audit it silently no-opped on the dev server —
 * correct (no proxy header, so no identity to key on) but it meant the happy
 * path had never actually executed anywhere.
 *
 * A security control that only runs in production is a security control nobody
 * has tested.
 */

const rpc = vi.fn();
const headers: Record<string, string | undefined> = {};
let socketIp: string | null = null;

vi.mock("@tanstack/react-start/server", () => ({
  getRequestHeader: (h: string) => headers[h],
  getRequestIP: () => socketIp ?? undefined,
}));

vi.mock("@/integrations/supabase/client.server", () => ({
  get supabaseAdmin() {
    return { rpc };
  },
}));

const load = async () => (await import("../src/lib/rate-limit.functions")).enforcePublicRateLimit;

beforeEach(() => {
  vi.resetModules();
  rpc.mockReset();
  socketIp = null;
  for (const k of Object.keys(headers)) delete headers[k];
});
afterEach(() => vi.restoreAllMocks());

describe("identity resolution", () => {
  it("prefers the FIRST x-forwarded-for entry — the original client", async () => {
    // The last entry is the nearest proxy; keying on it buckets every visitor
    // behind that proxy together, which is the same as no limit at all.
    headers["x-forwarded-for"] = "203.0.113.9, 70.41.3.18, 150.172.238.178";
    rpc.mockResolvedValue({ data: true, error: null });
    await (
      await load()
    )("b", 5, 60);
    expect(rpc).toHaveBeenCalledWith(
      "check_public_rate_limit",
      expect.objectContaining({ _client_key: "203.0.113.9" }),
    );
  });

  it("falls back through vendor headers, then the socket address", async () => {
    headers["cf-connecting-ip"] = "198.51.100.4";
    rpc.mockResolvedValue({ data: true, error: null });
    await (
      await load()
    )("b", 5, 60);
    expect(rpc).toHaveBeenCalledWith(
      "check_public_rate_limit",
      expect.objectContaining({ _client_key: "198.51.100.4" }),
    );

    vi.resetModules();
    rpc.mockReset();
    delete headers["cf-connecting-ip"];
    socketIp = "192.0.2.55";
    rpc.mockResolvedValue({ data: true, error: null });
    await (
      await load()
    )("b", 5, 60);
    expect(rpc).toHaveBeenCalledWith(
      "check_public_rate_limit",
      expect.objectContaining({ _client_key: "192.0.2.55" }),
    );
  });

  it("does not call the RPC when there is no identity at all", async () => {
    await (
      await load()
    )("b", 5, 60);
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe("the limit itself", () => {
  it("throws a plain-language refusal when the RPC says no", async () => {
    headers["x-forwarded-for"] = "203.0.113.9";
    rpc.mockResolvedValue({ data: false, error: null });
    await expect((await load())("b", 5, 60)).rejects.toThrow(/Too many requests/);
  });

  it("passes when the RPC says yes", async () => {
    headers["x-forwarded-for"] = "203.0.113.9";
    rpc.mockResolvedValue({ data: true, error: null });
    await expect((await load())("b", 5, 60)).resolves.toBeUndefined();
  });
});

describe("it fails open on every infrastructure failure", () => {
  /**
   * Deliberate. A limiter that fails closed on a public careers page takes the
   * page offline for real applicants; a spam wave is the smaller problem. The
   * authenticated limiter already made the same trade.
   */
  it("passes when the RPC returns an error", async () => {
    headers["x-forwarded-for"] = "203.0.113.9";
    rpc.mockResolvedValue({ data: null, error: { message: "does not exist" } });
    await expect((await load())("b", 5, 60)).resolves.toBeUndefined();
  });

  it("passes when the service-role client cannot be constructed", async () => {
    headers["x-forwarded-for"] = "203.0.113.9";
    rpc.mockImplementation(() => {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    });
    await expect((await load())("b", 5, 60)).resolves.toBeUndefined();
  });

  it("still throws OUR refusal, which must not be swallowed by the catch", async () => {
    // The catch that implements fail-open must not also swallow the one error
    // the function exists to raise.
    headers["x-forwarded-for"] = "203.0.113.9";
    rpc.mockResolvedValue({ data: false, error: null });
    await expect((await load())("b", 5, 60)).rejects.toThrow(/Too many requests/);
  });
});
