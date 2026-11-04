"use client";

import { useEffect } from "react";

// Server components cannot set cookies, so this one quiet request lets the
// session slide forward (database expiry and the cookie's own max-age).
export default function SessionKeepAlive() {
  useEffect(() => {
    fetch("/api/account/me", { cache: "no-store" }).catch(() => {});
  }, []);
  return null;
}
