#!/bin/sh
cd /home/claude/pensieve
python3 -m remax_kb.cli pack docs/ -o pensieve.kbi --v2 \
  --codec remax --projection srht --dim 512 --k 4 \
  --embedder leaf-mt --pattern '**/*.md' \
  --source 'ATProto artifacts: austegard.com + muninn.austegard.com' \
  && echo ok > /tmp/pack.done
