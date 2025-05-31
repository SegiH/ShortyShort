#!/bin/bash
OUTPUT_DIR="output"

DOCKER_MODE=false

# Check for --docker flag
for arg in "$@"; do
  if [ "$arg" == "--docker" ]; then
    DOCKER_MODE=true
    break
  fi
done

if [ -d "$OUTPUT_DIR" ]; then
  echo "Deleting existing output directory"
  rm -rf "$OUTPUT_DIR"
fi

mkdir -p "$OUTPUT_DIR/API" "$OUTPUT_DIR/Web"

cd API || { echo "API directory not found"; exit 1; }

if [ ! -d "node_modules" ]; then
  echo "node_modules not found in API. Running npm install..."
  npm install
fi

echo "Copying node_modules to ../$OUTPUT_DIR/API"
cp -r node_modules "../$OUTPUT_DIR/API/"

echo "Copying .env, package.json, ShortyShortAPI.js to ../$OUTPUT_DIR/API"
cp .env package.json ShortyShortAPI.js "../$OUTPUT_DIR/API/"

cd ../Web || { echo "Web directory not found"; exit 1; }

if [ ! -d "node_modules" ]; then
  echo "node_modules not found in Web. Running npm install..."
  npm install
fi

echo "Running npm build in Web"
npm run build

echo "Copying dist/bundle.js and dist/index.html to ../$OUTPUT_DIR/Web"
cp .env dist/bundle.js dist/index.html "../$OUTPUT_DIR/Web/"

sed -i 's|src="/dist/bundle.js"|src="/bundle.js"|' "../$OUTPUT_DIR/Web/index.html"

cp ../database.json "../$OUTPUT_DIR"

if $DOCKER_MODE; then
  echo "Docker mode enabled. Copying Docker-related files and building Docker image."

  cp ../Docker/Dockerfile "../$OUTPUT_DIR"

  cp ../Docker/docker-compose.yml "../$OUTPUT_DIR"

  cd "../$OUTPUT_DIR"

  sudo docker buildx build . -t shortyshort

  sudo docker stop ShortyShort

  sudo docker rm ShortyShort

  sudo docker compose up -d

  cd ..

  rm -rf "$OUTPUT_DIR"
fi

echo "Build completed successfully."