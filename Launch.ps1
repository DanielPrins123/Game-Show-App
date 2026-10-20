$ErrorActionPreference = 'Stop'
$gameRoot = $PSScriptRoot
$gameUrl = 'http://127.0.0.1:4173/#/home'
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$gameNode = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $gameNode)) { throw 'Node.js is required. Install Node.js 22 or newer, then reopen Start Game.cmd.' }
& (Join-Path $gameRoot 'Build Game.ps1')
$gameReady = $false
try { $gameResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:4173/' -UseBasicParsing -TimeoutSec 2; $gameReady = $gameResponse.Content -match 'Family Feud Game Night' } catch { }
if (-not $gameReady) {
  $serverScript = Join-Path $gameRoot 'scripts\server.mjs'
  $gameProcess = Start-Process -FilePath $gameNode -ArgumentList ('"' + $serverScript + '"') -WorkingDirectory $gameRoot -WindowStyle Hidden -PassThru
  Set-Content -LiteralPath (Join-Path $gameRoot '.server-pid') -Value $gameProcess.Id
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 200
    try { $gameResponse = Invoke-WebRequest -Uri 'http://127.0.0.1:4173/' -UseBasicParsing -TimeoutSec 1; if ($gameResponse.Content -match 'Family Feud Game Night') { $gameReady = $true; break } } catch { }
  }
}
if (-not $gameReady) { throw 'Could not start the game. Port 4173 may be in use by another app.' }
Start-Process $gameUrl
