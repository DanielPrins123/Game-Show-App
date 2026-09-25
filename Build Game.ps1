$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$gameNodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$gameNode = if ($gameNodeCommand) { $gameNodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $gameNode)) { throw 'Install Node.js 22 or newer, then run Start Game again.' }
& $gameNode 'scripts/dependencies.mjs' check
if ($LASTEXITCODE -ne 0) {
  $gameNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue
  $gamePnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
  if (-not $gameNpm -and -not $gamePnpm) { throw 'Install Node.js (including npm), then reopen Start Game.' }
  Write-Host 'Installing updated game dependencies. This setup step needs internet access...'
  if ($gameNpm) { & $gameNpm.Source install --include=dev --package-lock=false }
  else { & $gamePnpm.Source install --prod=false --frozen-lockfile }
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed. Check your internet connection and try again.' }
  & $gameNode 'scripts/dependencies.mjs' mark
  if ($LASTEXITCODE -ne 0) { throw 'Could not record dependency setup.' }
}
Write-Host 'Building the updated game...'
& $gameNode 'node_modules/typescript/bin/tsc' -b
if ($LASTEXITCODE -ne 0) { throw 'Game typecheck failed.' }
& $gameNode 'node_modules/vite/bin/vite.js' build --configLoader runner
if ($LASTEXITCODE -ne 0) { throw 'Game build failed.' }
Write-Host 'Game is ready.'
