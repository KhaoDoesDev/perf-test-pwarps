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
  dataDirectory = sys.argv[1]

  # Find all warp names from .info files in data directory
  warps = []
  for fileName in os.listdir(dataDirectory):
    if not fileName.endswith(".info"):
      continue
    warp = urllib.parse.unquote(fileName[:-len(".info")])
    warps.append(warp)

  # Request info on every single warp
  for i, warp in enumerate(warps):
    print(f"[{i+1}/{len(warps)}] {warp}...")
    mosquitto_pub("-h", "fd77::1", "-t", "minecraftclient/EnderKill98/cmd/chat", "-m", f"/pwarp info {warp}")
    time.sleep(1.1)
