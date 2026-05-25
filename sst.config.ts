/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: 'lions-smart-club',
      removal: input?.stage === 'prod' ? 'retain' : 'remove',
      protect: input?.stage === 'prod',
      home: 'aws',
      providers: {
        aws: { region: 'af-south-1', profile: 'medicoach' },
      },
    };
  },
  async run() {
    const { site } = await import('./infra/web');
    return {
      siteUrl: site.url,
    };
  },
});
