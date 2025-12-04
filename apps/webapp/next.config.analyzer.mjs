import { withBundleAnalyzer } from '@next/bundle-analyzer';
import nextConfig from './next.config.mjs';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig);

