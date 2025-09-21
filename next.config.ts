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
  webpack: (config, { dev, isServer }) => {
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

    // Discord.js 관련 패키지들을 서버 사이드에서만 사용하도록 설정
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
      };

      // Discord.js 관련 패키지들을 외부로 처리
      config.externals = config.externals || [];
      config.externals.push({
        'discord.js': 'commonjs discord.js',
        '@discordjs/rest': 'commonjs @discordjs/rest',
        'discord-api-types': 'commonjs discord-api-types',
        'zlib-sync': 'commonjs zlib-sync',
      });
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
