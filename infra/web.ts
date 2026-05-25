// infra/web.ts — Vite SPA on S3 + CloudFront

export const site = new sst.aws.StaticSite('LionsWeb', {
  build: {
    command: 'npm run build',
    output: 'dist',
  },
  assets: {
    // SST v3.7.15 quirk: `fileOptions` acts as an include filter — files not
    // matching ANY pattern are NOT uploaded. So the rules below cover every
    // file type the Vite build produces. Order is specific → catch-all.
    //
    // Strategy:
    //  - Vite-hashed assets/* (content-hashed filenames) → immutable forever.
    //  - Static media (images, fonts) → immutable forever.
    //  - HTML → no cache (so deploys take effect immediately, since the JS
    //    bundle URL inside index.html changes on every build).
    fileOptions: [
      // Content-hashed Vite bundle output (immutable forever).
      // NOTE on glob quirks: `**` requires ≥1 path segment to expand, so
      // `assets/**` does NOT match `assets/file.js`; use `assets/*` (and
      // `assets/**/*` for any future nested files).
      {
        files: ['assets/*', 'assets/**/*'],
        cacheControl: 'public, max-age=31536000, immutable',
      },
      // Static media in public/.
      {
        files: ['players/*', 'players/**/*'],
        cacheControl: 'public, max-age=31536000, immutable',
      },
      {
        files: [
          '*.png',
          '*.jpg',
          '*.jpeg',
          '*.svg',
          '*.webp',
          '*.gif',
          '*.ico',
          '*.woff2',
          '**/*.png',
          '**/*.jpg',
          '**/*.jpeg',
          '**/*.svg',
          '**/*.webp',
          '**/*.gif',
          '**/*.ico',
          '**/*.woff2',
        ],
        cacheControl: 'public, max-age=31536000, immutable',
      },
      // HTML files (root + nested) → revalidate on every request so deploys
      // take effect immediately (the JS bundle URL inside index.html
      // changes on every build).
      {
        files: ['*.html', '**/*.html'],
        cacheControl: 'public, max-age=0, must-revalidate',
      },
      // Catch-all for anything else (sidesteps the SST include-filter
      // behaviour where unmatched files are excluded from upload).
      {
        files: '**/*',
        cacheControl: 'public, max-age=3600',
      },
    ],
  },
  // Deliberately NOT setting errorPage: "index.html" — this app uses React
  // state for view switching, not URL routing. Real 404s should stay 404s
  // so mistyped asset paths surface as errors instead of being masked by a
  // 200 + index.html body.
  //
  // No linked resources, no env vars. If/when a custom domain is added,
  // drop a `domain: { name, cert, dns: false }` block here (see
  // medicoach/infra/web.ts for the pattern).
});
