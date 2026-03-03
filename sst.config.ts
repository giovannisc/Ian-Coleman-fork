/// <reference path=".sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "bip39-offline-wallet",
      removal: input?.stage === "prod" ? "retain" : "remove",
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
      domain: {
        name: `${$app.stage}.${process.env.HOSTED_ZONE}`,
      },
    });

    return {
      url: site.url,
    };
  },
});
