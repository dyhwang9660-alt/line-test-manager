# 맞춤 계산기 - Windows 바로가기 설치/제거 스크립트
# 설치.bat / 제거.bat 에서 실행됩니다.
param([switch]$Uninstall)
$ErrorActionPreference = 'Stop'

$name    = '맞춤 계산기'
$here    = Split-Path -Parent $MyInvocation.MyCommand.Path
$html    = Join-Path $here 'index.html'
$icon    = Join-Path $here 'icons\calculator.ico'
$desktop = [Environment]::GetFolderPath('Desktop')
$programs = [Environment]::GetFolderPath('Programs')
$links   = @((Join-Path $desktop "$name.lnk"), (Join-Path $programs "$name.lnk"))

if ($Uninstall) {
  foreach ($l in $links) { if (Test-Path $l) { Remove-Item $l -Force } }
  Write-Host ''
  Write-Host "  '$name' 바로가기를 삭제했습니다."
  Write-Host '  (계산기 데이터는 브라우저에 남아 있으며, 폴더는 직접 지우시면 됩니다.)'
  exit 0
}

if (-not (Test-Path $html)) {
  Write-Host '  index.html 을 찾을 수 없습니다. 압축을 푼 폴더 안에서 실행해 주세요.'
  exit 1
}

# 압축 파일 안에서 바로 실행한 경우 (임시 폴더) 경고
if ($here -like "$env:TEMP*") {
  Write-Host '  압축을 먼저 풀어 주세요. (압축 파일 안에서 실행하면 바로가기가 깨집니다)'
  exit 1
}

$candidates = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
$browser = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $browser) {
  Write-Host '  Microsoft Edge 또는 Chrome 을 찾지 못했습니다.'
  Write-Host '  index.html 을 브라우저로 직접 열어서 사용해 주세요.'
  exit 1
}

$url   = ([System.Uri]$html).AbsoluteUri
$shell = New-Object -ComObject WScript.Shell
foreach ($l in $links) {
  $s = $shell.CreateShortcut($l)
  $s.TargetPath       = $browser
  $s.Arguments        = "--app=`"$url`" --window-size=480,900"
  $s.WorkingDirectory = $here
  $s.Description      = '품목별 기준값을 등록해 쓰는 맞춤 계산기'
  if (Test-Path $icon) { $s.IconLocation = "$icon,0" }
  $s.Save()
}

Write-Host ''
Write-Host "  설치 완료! 바탕화면과 시작 메뉴에 '$name' 바로가기를 만들었습니다."
Write-Host "  사용 브라우저: $browser"
Write-Host ''
Write-Host '  ※ 이 폴더를 옮기거나 지우면 바로가기가 동작하지 않습니다.'
Write-Host '     폴더를 옮긴 뒤에는 설치.bat 을 다시 실행해 주세요.'
Start-Process -FilePath $browser -ArgumentList "--app=`"$url`"", '--window-size=480,900'
