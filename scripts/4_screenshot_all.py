#!/usr/bin/env python3

import os
import os.path
import sys
import urllib.parse
from sh import mosquitto_pub, magick
import time

if __name__ == "__main__":
  if len(sys.argv) < 3:
    print(f"Usage: {sys.argv[0]} <DataDirectory> <ScreenshotDir> [StartAtNum]", file=sys.stderr)
    exit(1)

  warps = []
  for fileName in os.listdir(sys.argv[1]):
    if not fileName.endswith(".info"):
      continue
    warp = urllib.parse.unquote(fileName[:-len(".info")])
    warps.append(warp)

  time.sleep(5)
  startAtIndex = int(sys.argv[3]) - 1 if len(sys.argv) >= 4 else 0
  for i, warp in enumerate(warps):
    if i < startAtIndex:
      continue
    print(f"[{i+1}/{len(warps)}] {warp}...")
    if warp in [ "create", "remove" ]:
      # Use silly inventory instead
      mosquitto_pub("-h", "fd77::1", "-t", "minecraftclient/EnderKill98/cmd/chat", "-m", f"/pwarp open all -search {warp}")
      time.sleep(0.75)
      mosquitto_pub("-h", "fd77::1", "-t", "minecraftclient/EnderKill98/cmd/chat", "-m", f".cclick 0 0 pickup")
    else:
      mosquitto_pub("-h", "fd77::1", "-t", "minecraftclient/EnderKill98/cmd/chat", "-m", f"/pwarp {warp}")
    time.sleep(5)
    safeWarp = urllib.parse.quote(warp, safe="")
    screenshotFilePngPath = os.path.join(sys.argv[2], f"{safeWarp}.png")
    mosquitto_pub("-h", "fd77::1", "-t", "minecraftclient/EnderKill98/cmd/chat", "-m", f".screenshot {screenshotFilePngPath}")
    time.sleep(2)
    screenshotFileWebpPath = os.path.join(sys.argv[2], f"{safeWarp}.webp")
    magick(screenshotFilePngPath, "-quality", "70", screenshotFileWebpPath)
    os.unlink(screenshotFilePngPath)

