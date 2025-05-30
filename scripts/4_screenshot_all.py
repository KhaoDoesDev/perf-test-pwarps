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
  dataDirectory, screenshotDirectory = sys.argv[1:3]
  startAtIndex = int(sys.argv[3]) - 1 if len(sys.argv) >= 4 else 0

  # Gather warp names by looking up all .info files
  warps = []
  for fileName in os.listdir(dataDirectory):
    if not fileName.endswith(".info"):
      continue
    warp = urllib.parse.unquote(fileName[:-len(".info")])
    warps.append(warp)

  # Setup-time (focus minecraft, hide options and hud)
  time.sleep(5)

  prevMagickResult = None
  prevMagickPngFilePath = None

  mqdo = lambda chat: mosquitto_pub("-h", "fd77::1", "-t", "minecraftclient/EnderKill98/cmd/chat", "-m", chat)

  for i, warp in enumerate(warps):
    if i < startAtIndex:
      continue # Skip to warp index

    print(f"[{i+1}/{len(warps)}] {warp}...")

    # Teleport to warp (use GUI if it's a known inaccessible name)
    if warp in [ "create", "help", "set", "remove", "open", "list", "desc", "amount", "rtp", "icon", "category", "rate", "lock", "cost", "reset", "rename", "setowner", "password", "whitelist", "ban", "managers", "favourite", "info" ]:
      # GUI workaround (can access stupid names, but may have the wrong warp as wrong first search result)
      mqdo(f"/pwarp open all -search {warp}")
      time.sleep(0.75)
      mqdo(f".cclick 0 0 pickup")
    else:
      mqdo(f"/pwarp {warp}")

    # Wait for teleport to complete and chunks to load in
    time.sleep(5)

    # Wait for prev webp conversion to complete and remove old png
    if prevMagickResult is not None and prevMagickPngFilePath is not None:
      prevMagickResult.wait()
      os.unlink(prevMagickPngFilePath)

    # Trigger screenshot
    safeWarp = urllib.parse.quote(warp, safe="")
    screenshotFilePngPath = os.path.join(sys.argv[2], f"{safeWarp}.png")
    mqdo(f".screenshot {screenshotFilePngPath}")

    # Wait until screenshot exists, bigger than 0 bytes and did not grow in past 0.5s
    lastSize, newSize = -1, -1
    while (newSize := (-1 if not os.path.exists(screenshotFilePngPath) else os.stat(screenshotFilePngPath)) ) != lastSize or newSize in [ -1, 0 ]:
      lastSize = newSize
      time.sleep(0.5)

    # Kick off conversion to webp in background
    screenshotFileWebpPath = os.path.join(sys.argv[2], f"{safeWarp}.webp")
    prevMagickResult = magick(screenshotFilePngPath, "-quality", "75", screenshotFileWebpPath, _bg=True)
    prevMagickPngFilePath = screenshotFilePngPath


  # Wait for prev webp conversion to complete and remove old png
  if prevMagickResult is not None and prevMagickPngFilePath is not None:
    prevMagickResult.wait()
    os.unlink(prevMagickPngFilePath)
