#!/usr/bin/env bash
set -e

# Install backend Python dependencies
pip install -r backend/requirements.txt

# Install frontend Node dependencies
pushd frontend >/dev/null
npm ci
popd >/dev/null
