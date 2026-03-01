#!/usr/bin/env bash
# Minimal instructions to prepare the frontend for WeChat mini program using Taro or uni-app.
set -e
echo "This script only contains guidance. Install Taro or uni-app locally to build the mini program."
echo "Suggested steps:"
echo "1) Install Taro: npm i -g @tarojs/cli" 
echo "2) Scaffold a Taro project and copy frontend/ pages into src/" 
echo "3) Run: taro build --type weapp --watch (or without --watch)"
echo "Alternatively, use uni-app and its HBuilderX or CLI to build a WeChat package."
