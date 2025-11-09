console.log("Loading next.config.mjs");

/** @type {() => import('next').NextConfig} */
const createConfig = () => ({
  generateBuildId: async () => Date.now().toString(36),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        port: "",
        pathname: "/api/portraits/**"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**"
      }
    ]
  }
});

export default createConfig;


