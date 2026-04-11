import { execFileSync } from 'child_process'
import ffmpeg from 'ffmpeg-static'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inputPath = path.join(__dirname, '31325-385863205_medium.mp4')
const outputPath = path.join(__dirname, 'public', 'hero.webp')

console.log('변환 시작...', inputPath)

try {
  // animated webp 만들기
  execFileSync(ffmpeg, [
    '-i', inputPath,
    '-vcodec', 'libwebp',
    '-lossless', '0',
    '-q:v', '50',
    '-loop', '0',
    '-preset', 'default',
    '-an',
    '-vsync', '0',
    '-y', outputPath
  ], { stdio: 'inherit' })
  
  console.log('animated webp 생성 완료!', outputPath)
} catch (e) {
  console.error('에러:', e)
}