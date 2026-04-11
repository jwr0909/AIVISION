const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

const inputPath = 'c:\\Users\\dnfla\\Desktop\\KakaoTalk_20260328_163316169.mp4';
const outDir = path.join(__dirname, 'client/public/hero-frames');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

try {
  // 디렉토리 비우기
  const files = fs.readdirSync(outDir);
  for (const f of files) fs.unlinkSync(path.join(outDir, f));

  console.log('프레임 추출 중...');
  // 24fps로 추출, webp 단일 이미지 코덱 강제
  execFileSync(ffmpeg, [
    '-i', inputPath,
    '-r', '24',
    '-vcodec', 'libwebp',
    '-q:v', '50',
    path.join(outDir, 'frame_%04d.webp')
  ], { stdio: 'inherit' });
  
  const finalFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.webp'));
  console.log(`총 ${finalFiles.length}개의 프레임이 추출되었습니다.`);
} catch (err) {
  console.error('프레임 추출 오류:', err);
}