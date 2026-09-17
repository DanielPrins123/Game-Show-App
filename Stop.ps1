$pidFile = Join-Path $PSScriptRoot '.server-pid'
if (Test-Path -LiteralPath $pidFile) {
  $gameProcessId = [int](Get-Content -LiteralPath $pidFile)
  $gameProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $gameProcessId" -ErrorAction SilentlyContinue
  $expectedScript = Join-Path $PSScriptRoot 'scripts\server.mjs'
  if ($gameProcess -and $gameProcess.Name -eq 'node.exe' -and $gameProcess.CommandLine.Contains($expectedScript)) { Stop-Process -Id $gameProcessId }
  Remove-Item -LiteralPath $pidFile
}
