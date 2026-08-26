@echo off
setlocal
title Unity WebGL build - decompress and normalize

rem ============================================================
rem  Drag a Unity WebGL "Build" (or "WebBuild") folder onto this
rem  file, or just double-click it while it sits in /assets/.
rem
rem  It will:
rem    1. find the Build folder automatically
rem    2. decompress every .gz / .unityweb file it contains
rem    3. rename the files to the names the website expects
rem       (WebBuild.loader.js / .data / .framework.js / .wasm)
rem    4. delete the leftover compressed and stale files
rem    5. verify the result and tell you if anything is wrong
rem
rem  Set KEEP_COMPRESSED=1 below to keep the .gz files instead.
rem ============================================================

set "KEEP_COMPRESSED=0"

set "SCRIPT_DIR=%~dp0"
set "DROPPED=%~1"

rem The marker is split in two halves on purpose, so this line does not
rem match itself when we search the file for the start of the script.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=[IO.File]::ReadAllText('%~f0'); $i=$s.IndexOf('#:PS' + '_BEGIN'); Invoke-Expression $s.Substring($i)"
set "RESULT=%errorlevel%"

echo.
pause
exit /b %RESULT%

#:PS_BEGIN
$ErrorActionPreference = 'Stop'

function Say  ($m) { Write-Host $m }
function Head ($m) { Write-Host ''; Write-Host $m -ForegroundColor Cyan }
function Ok   ($m) { Write-Host ('  [ ok ] ' + $m) -ForegroundColor Green }
function Warn ($m) { Write-Host ('  [warn] ' + $m) -ForegroundColor Yellow }
function Bad  ($m) { Write-Host ('  [fail] ' + $m) -ForegroundColor Red }

$scriptDir = $env:SCRIPT_DIR.TrimEnd('\')
$dropped   = $env:DROPPED
$keepGz    = ($env:KEEP_COMPRESSED -eq '1')

function Is-Gzip($path) {
  if (!(Test-Path -LiteralPath $path)) { return $false }
  $fs = [IO.File]::OpenRead($path)
  try {
    if ($fs.Length -lt 2) { return $false }
    return ($fs.ReadByte() -eq 0x1f) -and ($fs.ReadByte() -eq 0x8b)
  } finally { $fs.Dispose() }
}

function Expand-Gzip($source, $destination) {
  $tmp = $destination + '.tmp_expand'
  $src = [IO.File]::OpenRead($source)
  try {
    $gz = New-Object IO.Compression.GzipStream($src, [IO.Compression.CompressionMode]::Decompress)
    try {
      $out = [IO.File]::Create($tmp)
      try { $gz.CopyTo($out) } finally { $out.Dispose() }
    } finally { $gz.Dispose() }
  } finally { $src.Dispose() }
  Move-Item -LiteralPath $tmp -Destination $destination -Force
}

function Nice-Size($bytes) {
  if ($bytes -ge 1MB) { return ('{0:N1} MB' -f ($bytes / 1MB)) }
  if ($bytes -ge 1KB) { return ('{0:N0} KB' -f ($bytes / 1KB)) }
  return "$bytes bytes"
}

# ---------------------------------------------------------------- 1. locate
Head 'Looking for the Build folder...'

$candidates = @()
if ($dropped) { $candidates += $dropped }
$candidates += $scriptDir
$candidates += (Join-Path $scriptDir 'WebBuild')

$buildDir = $null
foreach ($c in $candidates) {
  if (-not $c) { continue }
  $c = $c.Trim('"')
  if (-not (Test-Path -LiteralPath $c)) { continue }
  if (-not (Get-Item -LiteralPath $c).PSIsContainer) { $c = Split-Path -Parent $c }
  $hit = Get-ChildItem -LiteralPath $c -Recurse -File -Filter '*loader.js*' -ErrorAction SilentlyContinue |
         Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $hit) {
    $hit = Get-ChildItem -LiteralPath $c -Recurse -File -Filter '*.wasm*' -ErrorAction SilentlyContinue |
           Sort-Object LastWriteTime -Descending | Select-Object -First 1
  }
  if ($hit) { $buildDir = $hit.Directory.FullName; break }
}

if (-not $buildDir) {
  Bad 'No Unity WebGL build was found.'
  Say ''
  Say 'Looked in:'
  foreach ($c in $candidates) { if ($c) { Say ('  ' + $c) } }
  Say ''
  Say 'Fix: drag the Build folder (the one holding the .loader.js file)'
  Say 'onto this .bat file, or copy it to assets\WebBuild\Build first.'
  exit 1
}
Ok ('Build folder: ' + $buildDir)

$webRoot = Split-Path -Parent $buildDir
if (Test-Path -LiteralPath (Join-Path $webRoot 'StreamingAssets')) { $scanRoot = $webRoot } else { $scanRoot = $buildDir }

# ---------------------------------------------------------------- 2. brotli check
$brotli = @(Get-ChildItem -LiteralPath $scanRoot -Recurse -File -Filter '*.br' -ErrorAction SilentlyContinue)
if ($brotli.Count -gt 0) {
  Head 'Brotli files detected'
  foreach ($b in $brotli) { Warn $b.Name }
  Say ''
  Bad 'Windows PowerShell cannot unpack Brotli (.br) files.'
  Say 'Fix: in Unity go to Project Settings > Player > WebGL > Publishing Settings'
  Say 'and set Compression Format to "Gzip" (or "Disabled"), then rebuild.'
  exit 1
}

# ---------------------------------------------------------------- 3. decompress
Head 'Decompressing...'

$packed = @(Get-ChildItem -LiteralPath $scanRoot -Recurse -File |
            Where-Object { $_.Extension -eq '.gz' -or $_.Extension -eq '.unityweb' })

$didSomething = $false
foreach ($f in $packed) {
  $dest = Join-Path $f.DirectoryName ([IO.Path]::GetFileNameWithoutExtension($f.Name))
  if (Is-Gzip $f.FullName) {
    Expand-Gzip $f.FullName $dest
    Ok ($f.Name + ' -> ' + (Split-Path -Leaf $dest) + '  (' + (Nice-Size (Get-Item -LiteralPath $dest).Length) + ')')
  } else {
    Copy-Item -LiteralPath $f.FullName -Destination $dest -Force
    Ok ($f.Name + ' -> ' + (Split-Path -Leaf $dest) + '  (was not compressed, copied)')
  }
  $didSomething = $true
}

# files that carry a plain name but are still gzip inside
foreach ($f in @(Get-ChildItem -LiteralPath $buildDir -File)) {
  if ($f.Extension -eq '.gz' -or $f.Extension -eq '.unityweb') { continue }
  if (Is-Gzip $f.FullName) {
    $backup = $f.FullName + '.gz'
    Copy-Item -LiteralPath $f.FullName -Destination $backup -Force
    Expand-Gzip $backup $f.FullName
    Remove-Item -LiteralPath $backup -Force
    Ok ($f.Name + ' was gzip inside, decompressed in place  (' + (Nice-Size (Get-Item -LiteralPath $f.FullName).Length) + ')')
    $didSomething = $true
  }
}
if (-not $didSomething) { Say '  nothing to decompress, files are already plain' }

# ---------------------------------------------------------------- 4. normalize names
Head 'Matching the names the website uses...'

$targetPrefix = 'WebBuild'
$siteRoot = Split-Path -Parent $scriptDir
if (Test-Path -LiteralPath $siteRoot) {
  $pages = @(Get-ChildItem -LiteralPath $siteRoot -Recurse -File -Filter '*.html' -ErrorAction SilentlyContinue |
             Where-Object { $_.FullName -notmatch '\\vendor\\' })
  foreach ($p in $pages) {
    $m = [regex]::Match((Get-Content -LiteralPath $p.FullName -Raw), '([A-Za-z0-9_\-]+)\.loader\.js')
    if ($m.Success) { $targetPrefix = $m.Groups[1].Value; Say ('  ' + $p.Name + ' expects "' + $targetPrefix + '.*"'); break }
  }
}

$loader = Get-ChildItem -LiteralPath $buildDir -File -Filter '*.loader.js' |
          Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $loader) {
  Bad 'No *.loader.js in the Build folder - this does not look like a WebGL build.'
  exit 1
}
$prefix = $loader.Name -replace '\.loader\.js$', ''

$parts = @('.loader.js', '.data', '.framework.js', '.wasm')
if ($prefix -ne $targetPrefix) {
  foreach ($ext in $parts) {
    $src = Join-Path $buildDir ($prefix + $ext)
    $dst = Join-Path $buildDir ($targetPrefix + $ext)
    if (Test-Path -LiteralPath $src) {
      Move-Item -LiteralPath $src -Destination $dst -Force
      Ok ($prefix + $ext + ' -> ' + $targetPrefix + $ext)
    }
  }
} else {
  Say ('  names already match ("' + $targetPrefix + '.*")')
}

# ---------------------------------------------------------------- 5. clean up
Head 'Cleaning up...'
$removed = 0
foreach ($f in @(Get-ChildItem -LiteralPath $scanRoot -Recurse -File)) {
  $kill = $false
  if (($f.Extension -eq '.gz' -or $f.Extension -eq '.unityweb') -and -not $keepGz) { $kill = $true }
  foreach ($ext in $parts) {
    if ($f.Name.EndsWith($ext) -and $f.Name -ne ($targetPrefix + $ext)) { $kill = $true }
  }
  if ($kill) { Remove-Item -LiteralPath $f.FullName -Force; Say ('  removed ' + $f.Name); $removed++ }
}
if ($removed -eq 0) { Say '  nothing to remove' }

# ---------------------------------------------------------------- 6. verify
Head 'Checking the result...'
$problems = 0
foreach ($ext in $parts) {
  $p = Join-Path $buildDir ($targetPrefix + $ext)
  if (-not (Test-Path -LiteralPath $p)) { Bad ($targetPrefix + $ext + ' is MISSING'); $problems++; continue }
  $item = Get-Item -LiteralPath $p
  if ($item.Length -eq 0) { Bad ($item.Name + ' is empty'); $problems++; continue }
  if (Is-Gzip $item.FullName) { Bad ($item.Name + ' is still compressed'); $problems++; continue }
  Ok ($item.Name + '  ' + (Nice-Size $item.Length))
}
if (-not (Test-Path -LiteralPath (Join-Path $webRoot 'StreamingAssets'))) {
  Warn 'No StreamingAssets folder next to Build (fine if the game does not use it).'
}

Say ''
if ($problems -gt 0) {
  Bad ('Not ready - ' + $problems + ' problem(s) above.')
  exit 1
}
Write-Host 'All good. Commit the changes, then hard-refresh the page (Ctrl+F5).' -ForegroundColor Green
exit 0
