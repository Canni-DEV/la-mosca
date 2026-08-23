Add-Type -AssemblyName System.Drawing

function Resize-Image {
  param(
    [string]$Src,
    [string]$Dst,
    [int]$Width,
    [int]$Height,
    [bool]$Jpeg
  )
  if (-not (Test-Path $Src)) {
    Write-Host "MISSING $Src"
    return
  }
  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $Src))
  $ms = New-Object System.IO.MemoryStream (, $bytes)
  $img = [System.Drawing.Image]::FromStream($ms)
  $bmp = New-Object System.Drawing.Bitmap $Width, $Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($img, 0, 0, $Width, $Height)
  $dir = Split-Path $Dst -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $g.Dispose()
  $img.Dispose()
  $ms.Dispose()
  if ($Jpeg) {
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]82)
    $bmp.Save($Dst, $enc, $ep)
  } else {
    $bmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  $bmp.Dispose()
}

$c = "C:\Code\la-mosca\apps\web\src\assets"
# Card faces come from the Wikimedia atlas at native resolution; do not resample.
Resize-Image "$c\props\prop-fernet.png" "$c\props\fernet.png" 420 420 $false
Resize-Image "$c\props\prop-notepad.png" "$c\props\notepad.png" 420 420 $false
Resize-Image "$c\table\table-wood.png" "$c\table\wood.jpg" 1024 1024 $true
Resize-Image "$c\table\room-bg.png" "$c\table\room.jpg" 1600 900 $true
Remove-Item "$c\props\prop-fernet.png", "$c\props\prop-notepad.png", "$c\table\table-wood.png", "$c\table\room-bg.png" -ErrorAction SilentlyContinue
Get-ChildItem -Recurse $c | ForEach-Object { "{0}`t{1}" -f $_.Length, $_.FullName }
