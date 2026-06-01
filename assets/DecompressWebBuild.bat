@echo off
setlocal

set "BUILD_DIR=%~dp0WebBuild\Build"

if not exist "%BUILD_DIR%" (
  echo Build folder was not found:
  echo %BUILD_DIR%
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference = 'Stop';" ^
  "$build = $env:BUILD_DIR;" ^
  "$files = @('WebBuild.data', 'WebBuild.framework.js', 'WebBuild.wasm');" ^
  "function Test-Gzip($path) {" ^
  "  if (!(Test-Path -LiteralPath $path)) { return $false }" ^
  "  $stream = [System.IO.File]::OpenRead($path);" ^
  "  try {" ^
  "    if ($stream.Length -lt 2) { return $false }" ^
  "    $first = $stream.ReadByte();" ^
  "    $second = $stream.ReadByte();" ^
  "    return $first -eq 0x1f -and $second -eq 0x8b;" ^
  "  } finally { $stream.Dispose() }" ^
  "}" ^
  "function Expand-GzipFile($source, $destination) {" ^
  "  $input = [System.IO.File]::OpenRead($source);" ^
  "  try {" ^
  "    $gzip = New-Object System.IO.Compression.GzipStream($input, [System.IO.Compression.CompressionMode]::Decompress);" ^
  "    try {" ^
  "      $output = [System.IO.File]::Create($destination);" ^
  "      try { $gzip.CopyTo($output) } finally { $output.Dispose() }" ^
  "    } finally { $gzip.Dispose() }" ^
  "  } finally { $input.Dispose() }" ^
  "}" ^
  "foreach ($file in $files) {" ^
  "  $path = Join-Path $build $file;" ^
  "  $gzPath = $path + '.gz';" ^
  "  if (Test-Path -LiteralPath $gzPath) {" ^
  "    Expand-GzipFile $gzPath $path;" ^
  "    $item = Get-Item -LiteralPath $path;" ^
  "    Write-Host ('Decompressed ' + [System.IO.Path]::GetFileName($gzPath) + ' -> ' + $file + ' (' + $item.Length + ' bytes)');" ^
  "  } elseif (Test-Gzip $path) {" ^
  "    $backup = $path + '.gz';" ^
  "    Copy-Item -LiteralPath $path -Destination $backup -Force;" ^
  "    Expand-GzipFile $backup $path;" ^
  "    $item = Get-Item -LiteralPath $path;" ^
  "    Write-Host ('Decompressed compressed ' + $file + ' in place (' + $item.Length + ' bytes)');" ^
  "  } elseif (Test-Path -LiteralPath $path) {" ^
  "    Write-Host ($file + ' is already decompressed');" ^
  "  } else {" ^
  "    Write-Warning ($file + ' was not found');" ^
  "  }" ^
  "}" ^
  "Write-Host '';" ^
  "Write-Host 'Done. You can hard-refresh the browser and run the WebGL page again.';"

if errorlevel 1 (
  echo.
  echo Decompression failed.
  pause
  exit /b 1
)

echo.
pause
