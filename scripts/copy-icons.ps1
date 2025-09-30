# Copy icons script for PowerShell
$sourceFile = "public\TheMovieGame Logo.png"
$iconsDir = "public\icons"

# Create icons directory if it doesn't exist
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force
}

# Icon sizes to create
$iconSizes = @(
    "16x16", "32x32", "48x48", "60x60", "72x72", "76x76", "96x96", 
    "114x114", "120x120", "128x128", "144x144", "150x150", "152x152", 
    "180x180", "192x192", "310x310", "384x384", "512x512", "1024x1024"
)

# Copy the source file to each icon size
foreach ($size in $iconSizes) {
    $destinationFile = "$iconsDir\icon-$size.png"
    Copy-Item $sourceFile $destinationFile -Force
    Write-Host "Created: icon-$size.png"
}

Write-Host "All icons created successfully!"

