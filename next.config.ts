import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next blocks /_next/* dev resources from non-localhost origins by default.
  // Without this, opening the dev server by LAN IP (e.g. from a phone) serves
  // the HTML but blocks every JS chunk — the page renders unhydrated, so no
  // scroll animation runs at all.
  //
  // The LAN IP changes when the machine gets a new lease; these cover the
  // private ranges rather than pinning one address. Dev-only setting.
  allowedDevOrigins: ["10.*.*.*", "172.16.*.*", "192.168.*.*", "localhost"],
};

export default nextConfig;
