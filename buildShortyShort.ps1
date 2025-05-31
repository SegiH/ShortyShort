$OUTPUT_DIR = "output"

# Check for --docker flag
$DOCKER_MODE = $false

foreach ($arg in $args) {
    if ($arg -eq "--docker") {
        $DOCKER_MODE = $true
        break
    }
}

# Delete output directory if it exists
if (Test-Path $OUTPUT_DIR) {
    Write-Host "Deleting existing output directory"
    Remove-Item -Recurse -Force $OUTPUT_DIR
}

# Create necessary directories
New-Item -ItemType Directory -Force -Path "$OUTPUT_DIR/API" | Out-Null
New-Item -ItemType Directory -Force -Path "$OUTPUT_DIR/Web" | Out-Null

# Navigate to API directory
if (-Not (Test-Path "API")) {
    Write-Host "API directory not found"
    exit 1
}
Set-Location "API"

# Check for node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "node_modules not found in API. Running npm install..."
    npm install
}

# Copy files to OUTPUT_DIR/API
Write-Host "Copying node_modules to ../$OUTPUT_DIR/API"
Copy-Item -Recurse "node_modules" -Destination "../$OUTPUT_DIR/API"

Write-Host "Copying .env, package.json, ShortAPI.js to ../$OUTPUT_DIR/API"
Copy-Item ".env", "package.json", "ShortAPI.js" -Destination "../$OUTPUT_DIR/API"

# Navigate to Web directory
Set-Location ".."
if (-Not (Test-Path "Web")) {
    Write-Host "Web directory not found"
    exit 1
}
Set-Location "Web"

# Check for node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "node_modules not found in Web. Running npm install..."
    npm install
}

# Run npm build
Write-Host "Running npm build in Web"
npm run build

# Copy built files
Write-Host "Copying dist/bundle.js and dist/index.html to ../$OUTPUT_DIR/Web"
Copy-Item ".env", "dist/bundle.js", "dist/index.html" -Destination "../$OUTPUT_DIR/Web"

# Modify index.html bundle path
(Get-Content "../$OUTPUT_DIR/Web/index.html") -replace 'src="/dist/bundle.js"', 'src="/bundle.js"' | Set-Content "../$OUTPUT_DIR/Web/index.html"

Copy-Item "../database.json" -Destination "../$OUTPUT_DIR"

# Docker-related operations
if ($DOCKER_MODE) {
    Write-Host "Docker mode enabled. Copying Docker-related files and building Docker image."

    Copy-Item "../Docker/Dockerfile" -Destination "../$OUTPUT_DIR"
    Copy-Item "../Docker/docker-compose.yml" -Destination "../$OUTPUT_DIR"

    Set-Location "../$OUTPUT_DIR"

    docker buildx build . -t short
    docker stop Short
    docker rm Short
    docker compose up -d

    Set-Location ".."

    Remove-Item -Recurse -Force $OUTPUT_DIR
}

Write-Host "Build completed successfully."