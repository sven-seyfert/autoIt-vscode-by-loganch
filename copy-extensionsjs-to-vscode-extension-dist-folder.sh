#!/bin/bash

version="1.0.14"
username=$(whoami)
vscodeExtensionFolder="C:/Users/$username/.vscode/extensions/damien.autoit-$version"
targetFile="$vscodeExtensionFolder/dist/extension.js"
newTargetFile="./dist/extension.js"

if [ -f "$targetFile" ]; then
    mv "$targetFile" "$targetFile.old"
else
    echo "Error: Target file '$targetFile' does not exist."
    exit 1
fi

if [ -f "$newTargetFile" ]; then
    cp "$newTargetFile" "$targetFile"
else
    echo "Error: New target file '$newTargetFile' does not exist."
    exit 1
fi

echo -e "\ncopy-extensionsjs-to-vscode-extension-dist-folder.sh done"

# Reference:
# https://github.com/sven-seyfert/autoIt-vscode-by-loganch/compare/master...develop
