/** @type {import('next').NextConfig} */
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://t1.kakaocdn.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:8080 http://127.0.0.1:8080 https://buyflow-system.168-110-117-4.nip.io ws://localhost:3000 ws://127.0.0.1:3000",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ")

const nextConfig = {
  output: "standalone",

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicyReportOnly,
          },
        ],
      },
    ]
  },
};

export default nextConfig;
