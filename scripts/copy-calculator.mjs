// 빌드 결과(dist)에 독립 계산기(calculator/)를 함께 넣어 /calculator/ 경로로 배포한다.
// Windows 설치용 스크립트(.bat, .ps1)는 웹에 올릴 필요가 없어 제외한다.
import { cpSync, existsSync } from 'node:fs'

if (!existsSync('dist')) {
  console.error('dist 폴더가 없습니다. vite build 이후에 실행하세요.')
  process.exit(1)
}
cpSync('calculator', 'dist/calculator', {
  recursive: true,
  filter: (src) => !/\.(bat|ps1)$/i.test(src),
})
console.log('calculator/ -> dist/calculator/ 복사 완료')
