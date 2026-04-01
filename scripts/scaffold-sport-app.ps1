param(
  [Parameter(Mandatory = $true)]
  [string]$TargetDir,

  [Parameter(Mandatory = $true)]
  [string]$AppName,

  [Parameter(Mandatory = $true)]
  [string]$DisplayName,

  [Parameter(Mandatory = $true)]
  [string]$Sport,

  [Parameter(Mandatory = $true)]
  [string]$AndroidPackage
)

$ErrorActionPreference = 'Stop'

function To-KebabCase {
  param([string]$Value)

  return (($Value -replace '([a-z0-9])([A-Z])', '$1-$2') -replace '[^A-Za-z0-9]+', '-').ToLower().Trim('-')
}

function To-ComponentName {
  param([string]$Value)

  return ($Value -replace '[^A-Za-z0-9]', '')
}

function To-TitleCase {
  param([string]$Value)

  $culture = Get-Culture
  return $culture.TextInfo.ToTitleCase($Value.ToLower())
}

function Copy-TemplateTree {
  param(
    [string]$Source,
    [string]$Target
  )

  $excludeDirs = @(
    (Join-Path $Source '.git'),
    (Join-Path $Source 'node_modules'),
    (Join-Path $Source '_expo_android_backup'),
    (Join-Path $Source 'android\build'),
    (Join-Path $Source 'android\app\build'),
    (Join-Path $Source '.gradle')
  )

  $arguments = @($Source, $Target, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/XD') + $excludeDirs
  & robocopy @arguments | Out-Null

  if ($LASTEXITCODE -ge 8) {
    throw "robocopy failed with exit code $LASTEXITCODE"
  }
}

function Remove-EmptyParentDirectories {
  param(
    [string]$StartPath,
    [string]$StopPath
  )

  $current = Split-Path $StartPath -Parent
  $stop = [System.IO.Path]::GetFullPath($StopPath)

  while ($current -and ([System.IO.Path]::GetFullPath($current) -ne $stop)) {
    if (-not (Test-Path $current)) {
      break
    }

    $hasChildren = Get-ChildItem -Force -LiteralPath $current | Select-Object -First 1
    if ($hasChildren) {
      break
    }

    Remove-Item -LiteralPath $current
    $current = Split-Path $current -Parent
  }
}

function Move-AndroidPackageTree {
  param(
    [string]$ProjectRoot,
    [string]$OldPackage,
    [string]$NewPackage
  )

  if ($OldPackage -eq $NewPackage) {
    return
  }

  $javaRoot = Join-Path $ProjectRoot 'android\app\src\main\java'
  $oldPackageDir = Join-Path $javaRoot ($OldPackage -replace '\.', '\')
  $newPackageDir = Join-Path $javaRoot ($NewPackage -replace '\.', '\')

  if (-not (Test-Path $oldPackageDir)) {
    return
  }

  New-Item -ItemType Directory -Force $newPackageDir | Out-Null
  Get-ChildItem -Force -LiteralPath $oldPackageDir | ForEach-Object {
    Move-Item -LiteralPath $_.FullName -Destination $newPackageDir
  }

  Remove-Item -LiteralPath $oldPackageDir
  Remove-EmptyParentDirectories -StartPath $oldPackageDir -StopPath $javaRoot
}

$sourceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$currentRoot = (Get-Location).Path
$targetPath = if ([System.IO.Path]::IsPathRooted($TargetDir)) {
  [System.IO.Path]::GetFullPath($TargetDir)
} else {
  [System.IO.Path]::GetFullPath((Join-Path $currentRoot $TargetDir))
}

$sourceWithSeparator = $sourceRoot.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
$targetWithSeparator = $targetPath.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar

if ($targetWithSeparator.StartsWith($sourceWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'TargetDir must be outside the source repo so the scaffold does not copy into itself.'
}

if (Test-Path $targetPath) {
  $existing = Get-ChildItem -Force -LiteralPath $targetPath | Select-Object -First 1
  if ($existing) {
    throw "Target directory already exists and is not empty: $targetPath"
  }
} else {
  New-Item -ItemType Directory -Force $targetPath | Out-Null
}

$componentName = To-ComponentName $AppName
$packageSlug = To-KebabCase $DisplayName
$sportLower = $Sport.Trim().ToLower()
$sportTitle = To-TitleCase $Sport

if (-not $componentName) {
  throw 'AppName must contain at least one letter or number.'
}

if (-not $packageSlug) {
  throw 'DisplayName must contain at least one letter or number.'
}

if (-not ($AndroidPackage -match '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$')) {
  throw 'AndroidPackage must look like com.example.appname'
}

Copy-TemplateTree -Source $sourceRoot -Target $targetPath
Move-AndroidPackageTree -ProjectRoot $targetPath -OldPackage 'com.matthewelijahlogan.jolleyvolley' -NewPackage $AndroidPackage

$replacements = @(
  @('com.matthewelijahlogan.jolleyvolley', $AndroidPackage),
  @('Jolley Volley', $DisplayName),
  @('JolleyVolley', $componentName),
  @('jolley-volley', $packageSlug),
  @('Volleyball', $sportTitle),
  @('volleyball', $sportLower)
)

$textExtensions = @('.js', '.json', '.kt', '.gradle', '.xml', '.md', '.properties')
$skipSegments = @('\.git\', '\node_modules\', '\android\build\', '\android\app\build\')

Get-ChildItem -Path $targetPath -Recurse -File | Where-Object {
  $textExtensions -contains $_.Extension -and -not ($skipSegments | Where-Object { $_.FullName -like "*$_*" })
} | ForEach-Object {
  $original = Get-Content -Raw -LiteralPath $_.FullName
  $updated = $original

  foreach ($pair in $replacements) {
    $updated = $updated.Replace($pair[0], $pair[1])
  }

  if ($updated -ne $original) {
    Set-Content -LiteralPath $_.FullName -Value $updated
  }
}

Write-Host ''
Write-Host "Scaffolded $DisplayName in $targetPath" -ForegroundColor Green
Write-Host "Next: cd $targetPath; npm install; npm run android" -ForegroundColor Cyan
Write-Host 'This clones the Jolley framework shell and renames the brand/package/sport wording.' -ForegroundColor Yellow
Write-Host 'You should still tailor the sport-specific analysis rules, labels, and optional scoreboard behavior next.' -ForegroundColor Yellow

