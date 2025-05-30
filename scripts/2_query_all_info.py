#!/usr/bin/env python3

import os
import os.path
import sys
import urllib.parse
from sh import mosquitto_pub
import time

if __name__ == "__main__":
  if len(sys.argv) != 2:
    print(f"Usage: {sys.argv[0]} <DataDirectory>", file=sys.stderr)
    exit(1)

  warps = []
  for fileName in os.listdir(sys.argv[1]):
    if not fileName.endswith(".info"):
      continue
    warp = urllib.parse.unquote(fileName[:-len(".info")])
    warps.append(warp)

  for i, warp in enumerate(warps):
    print(f"[{i+1}/{len(warps)}] {warp}...")
    mosquitto_pub("-h", "fd77::1", "-t", "minecraftclient/EnderKill98/cmd/chat", "-m", f"/pwarp info {warp}")
    time.sleep(1.25)
