#!/usr/bin/env python3

import jinja2
import sys
import os
import os.path
import urllib.parse
import shutil
import pathlib
import datetime

if __name__ == "__main__":
  if len(sys.argv) != 4:
    print(f"Usage: {sys.argv[0]} <DataDirectory> <WebDirectory> <StaticDirectory>", file=sys.stderr)
    exit(1)
    warps = {} # Warp: FilePath
  dataDirectory, webDirectory, staticDirectory = sys.argv[1:4]

  warps = []
  for fileName in os.listdir(dataDirectory):
    if not fileName.endswith(".info"):
      continue
    fileNameBase = fileName[:-len(".info")]
    warp = urllib.parse.unquote(fileNameBase)
    #print(f"{warp}")
    infoFilePath = os.path.join(dataDirectory, f"{fileNameBase}.info")
    screenshotFilePath = os.path.join(dataDirectory, f"{fileNameBase}.webp")
    noteFilePath = os.path.join(dataDirectory, f"{fileNameBase}.note")

    screenshotHref = None
    if os.path.exists(screenshotFilePath):
      # Copy screenshot into static/imgs
      screenshotStaticImgFolderPath = os.path.join(staticDirectory, "img")
      screenshotStaticPath = os.path.join(screenshotStaticImgFolderPath, fileNameBase + ".webp")
      pathlib.Path(screenshotStaticImgFolderPath).mkdir(parents=True, exist_ok=True)
      shutil.copyfile(screenshotFilePath, screenshotStaticPath)
      screenshotHref = "img/" + urllib.parse.quote(fileNameBase) + ".webp" # Yes, it's double-quoted!

    note = None
    if os.path.exists(noteFilePath):
      with open(noteFilePath) as noteFile:
        note = noteFile.read().strip()

    info = None
    owner = None
    created = None
    visits = None
    if os.path.exists(infoFilePath):
      with open(infoFilePath) as infoFile:
        info = ""
        for i, line in enumerate(infoFile.readlines()):
          line = line.strip()
          if i == 0:
            continue # Skip first line
          info += line + "\n"
          if line.startswith("Owner: "):
            owner = line[len("Owner: "):].strip()
          if line.startswith("Time Created: "):
            time = line[line.index(":")+1:].strip()
            try:
              created = datetime.datetime.strptime(time, "%d/%m/%Y %H:%M:%S").isoformat()
            except:
              print(f"Failed to parse created time of {warp}: {time}")
          if line.startswith("Visits: "):
            visits = line[len("Visits: "):].strip()
        info = info.strip()

    safeName = urllib.parse.quote(warp, safe="")

    warps.append({
      "name": warp,
      "safeName": safeName,
      "owner": owner,
      "created": created,
      "visits": visits,
      "screenshotHref": screenshotHref,
      "info": info,
      "note": note,
    })

  # Copy files in web/ + render .j2 templates out, removing that extension
  env = jinja2.Environment(loader=jinja2.FileSystemLoader(webDirectory), autoescape=True)
  for srcRoot, dirs, files in os.walk(webDirectory):
    tgtRoot = os.path.normpath(os.path.join(staticDirectory, os.path.relpath(srcRoot, webDirectory)))
    print(f"SrcRoot: {srcRoot}, TgtRoot: {tgtRoot}")
    for fileName in files:
      srcPath = os.path.join(srcRoot, fileName)
      tgtPath = os.path.join(tgtRoot, fileName)
      tgtPaths = [ (warp, tgtPath.replace("%warp%", warp["safeName"])) for warp in warps ] if "%warp%" in tgtPath else [ (None, tgtPath) ]
      for warp, tgtPath in tgtPaths:
        if fileName.endswith(".j2"):
          renderSrcPath = os.path.relpath(os.path.join(srcRoot, fileName), webDirectory) # Relative to webdir as specified in Environment
          renderTgtPath = tgtPath[:-len(".j2")]
          renderTgtDir = os.path.dirname(tgtPath)
          if not os.path.exists(renderTgtDir):
            pathlib.Path(renderTgtDir).mkdir(parents=True) # Ensure directories in path exist
          relRootPath = os.path.relpath(staticDirectory, os.path.dirname(renderTgtPath))
          print(f"Rendering Jinja2: {renderSrcPath} ==> {renderTgtPath} (warp: {'None' if warp is None else warp['name']}, root: {relRootPath})")
          template = env.get_template(renderSrcPath)
          rendered = template.render(warp=warp, warps=warps, root=relRootPath)
          with open(renderTgtPath, "w") as renderedFile:
            renderedFile.write(rendered)
        else:
          shutil.copyfile(srcPath, tgtPath)
