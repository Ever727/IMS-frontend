/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [{
            source: "/api/:path*",
            // Change to your backend URL in production
            // destination:  "http://localhost:8000/:path*/",
            destination:  "https://tasright-backend-tasright.app.secoder.net/:path*",
        }];
    }
};

// eslint-disable-next-line no-undef
module.exports = nextConfig;
