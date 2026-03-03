export default $config({
  app(input) {
    return {
      name: "bip39-offline-wallet",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const site = new sst.aws.StaticSite("WebApp", {
      path: "web",
      build: {
        command: "npm run build",
        output: "dist",
      },
    });

    return {
      url: site.url,
    };
  },
});
