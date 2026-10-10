import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

// The admin login route and user-creation route use bcryptjs (pure JavaScript)
// because the compiled "bcrypt" add-on failed to load on Hostinger, which
// returned a 500 page for every login attempt. Hashes made earlier by the
// native add-on must still verify, so existing admin accounts keep working.
const HASH_MADE_BY_NATIVE_BCRYPT =
  "$2b$12$14Iux0ydUOfVaQjgH0JPLeau.YCP4Slp8gw400XGiEZSXnyY4wwzG";

describe("admin password hashing (bcryptjs)", () => {
  it("verifies a hash created by the native bcrypt library", async () => {
    expect(await bcrypt.compare("Correct-Horse-1", HASH_MADE_BY_NATIVE_BCRYPT)).toBe(true);
  });

  it("rejects the wrong password for that hash", async () => {
    expect(await bcrypt.compare("not-the-password", HASH_MADE_BY_NATIVE_BCRYPT)).toBe(false);
  });

  it("round-trips a new hash with the same cost used in production", async () => {
    const hash = await bcrypt.hash("Another-Pass-2", 12);
    expect(hash.startsWith("$2b$12$")).toBe(true);
    expect(await bcrypt.compare("Another-Pass-2", hash)).toBe(true);
  });
});
