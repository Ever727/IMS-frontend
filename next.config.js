/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,
    transpilePackages: ['ahooks'],

    async rewrites() {
        return [{
            source: "/api/:path*",
            // Change to your backend URL in production
            destination: process.env.NODE_ENV !== 'production' ?
                "http://localhost:8000/:path*/" :
                "https://tasright-backend-tasright.app.secoder.net/:path*/",
        }];
    }
};

// eslint-disable-next-line no-undef
module.exports = nextConfig;
