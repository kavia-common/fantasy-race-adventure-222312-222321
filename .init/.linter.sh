#!/bin/bash
cd /home/kavia/workspace/code-generation/fantasy-race-adventure-222312-222321/game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

