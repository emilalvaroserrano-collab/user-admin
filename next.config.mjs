/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async redirects() {
    return [{source:"/dashboard",destination:"/dashboard/overview",permanent:false}];
  },
  async headers() {
    return [{source:"/:path*",headers:[
      {key:"X-Content-Type-Options",value:"nosniff"},
      {key:"X-Frame-Options",value:"DENY"},
      {key:"Referrer-Policy",value:"no-referrer"}
    ]}, ...["/dashboard/:path*", "/production/signin", "/api/zendesk/:path*"].map(source=>({source,headers:[{key:"Cache-Control",value:"private, no-store"}]}))];
  }
};
export default nextConfig;
