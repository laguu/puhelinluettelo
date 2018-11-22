#!/bin/sh
npm run build
rm -rf ../puhelinluettelo-backend/build
cp -r build ../puhelinluettelo-backend/