import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack 설정 - ENOENT 에러 방지
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // 개발 모드 최적화
  webpack: (config, { dev }) => {
    if (dev) {
      // 파일 시스템 감시 최적화 - ENOENT 에러 방지
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.turbo/**',
          '**/.git/**',
          '**/.DS_Store',
          '**/.tmp/**',
          '**/.cache/**'
        ]
      };
      
      // 메모리 사용량 최적화
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // 빌드 안정성 향상
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // 이미지 최적화
  images: {
    domains: [],
    unoptimized: true,
  },
};

export default nextConfig;
