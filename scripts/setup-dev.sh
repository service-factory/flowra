#!/bin/bash

# 개발 환경 최적화 스크립트
echo "🚀 개발 환경 최적화를 시작합니다..."

# 파일 시스템 감시 한계 늘리기 (macOS/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📁 macOS에서 파일 감시 한계를 늘립니다..."
    sudo sysctl -w kern.maxfiles=65536
    sudo sysctl -w kern.maxfilesperproc=65536
    ulimit -n 65536
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📁 Linux에서 파일 감시 한계를 늘립니다..."
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
fi

# 캐시 정리
echo "🧹 캐시를 정리합니다..."
rm -rf .next .turbo node_modules/.cache tsconfig.tsbuildinfo

# 의존성 재설치
echo "📦 의존성을 재설치합니다..."
npm install

echo "✅ 개발 환경 최적화가 완료되었습니다!"
echo "💡 이제 'npm run dev'로 개발 서버를 시작할 수 있습니다."
