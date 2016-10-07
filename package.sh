#!/bin/sh

: "${VERSION:?Need to set VERSION}"

RELEASE_PATH="$(pwd)/release"
IMAGE_PATH="$(pwd)/release/images"

rm -r $IMAGE_PATH
mkdir $IMAGE_PATH

# Windows
echo "Packaging Windows..."
echo "ia32"
(
  cd $RELEASE_PATH/win32-ia32/ &&
  zip -q -r -9 $IMAGE_PATH/$VERSION-Markdeck-win32-ia32.zip Markdeck-win32-ia32 -x "*.DS_Store"
)
echo "x64"
(
  cd $RELEASE_PATH/win32-x64/ &&
  zip -q -r -9 $IMAGE_PATH/$VERSION-Markdeck-win32-x64.zip Markdeck-win32-x64 -x "*.DS_Store"
)

# Linux
echo "Packaging Linux..."
echo "ia32"
(
  cd $RELEASE_PATH/linux-ia32/ &&
  tar -cz --exclude="__MACOSX" --exclude=".DS_Store" -f $IMAGE_PATH/$VERSION-Markdeck-linux-ia32.tar.gz Markdeck-linux-ia32
)
echo "x64"
(
  cd $RELEASE_PATH/linux-x64/ &&
  tar -cz --exclude="__MACOSX" --exclude=".DS_Store" -f $IMAGE_PATH/$VERSION-Markdeck-linux-x64.tar.gz Markdeck-linux-x64
)

# macOS
echo "Packaging macOS..."
(
  cd $RELEASE_PATH/darwin-x64/Markdeck-darwin-x64/ &&
  zip -q -y -r -9 $IMAGE_PATH/$VERSION-Markdeck-macos.zip Markdeck.app -x "*.DS_Store"
)

echo "Done."
