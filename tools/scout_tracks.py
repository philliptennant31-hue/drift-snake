"""Scout new track candidates for the drift soundtrack.

Walks the chosic.com catalogs of the vetted CC artists (see
music/CURATION.md), diffs against what tracks.js already has, and prints
the candidates as JSON. With --tags it also fetches each candidate's page
for mood tags and the direct mp3 URL (slower; ~2s per track, be polite).

Usage:
  python tools/scout_tracks.py tracks.js            # fast: titles + page URLs
  python tools/scout_tracks.py tracks.js --tags     # full: tags + mp3 URLs
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request

# chosic 403s generic clients; a browser UA is fine for their public pages
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"}

# only artists whose chosic uploads carry a redistribution-friendly license;
# verify the license on each track page before shipping a download
ARTISTS = [
    {"name": "Purrple Cat", "license": "CC BY-SA 3.0",
     "link": "https://soundcloud.com/purrplecat"},
    {"name": "Kevin MacLeod", "license": "CC BY 4.0",
     "link": "https://incompetech.com"},
]


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def catalog(artist):
    """All (id, title) pairs chosic lists for an artist."""
    seen, page = {}, 1
    while page < 30:
        suffix = f"page/{page}/" if page > 1 else ""
        url = (f"https://www.chosic.com/free-music/all/{suffix}"
               f"?keyword={urllib.parse.quote(artist)}&artist=")
        try:
            body = fetch(url)
        except Exception:
            break
        found = re.findall(
            r'href="https://www\.chosic\.com/download-audio/(\d+)/" >([^<]+)', body)
        new = {i: html.unescape(t).strip() for i, t in found if i not in seen}
        if not new:
            break
        seen.update(new)
        page += 1
        time.sleep(1.5)
    return seen


def track_page_details(track_id):
    body = fetch(f"https://www.chosic.com/download-audio/{track_id}/")
    mp3 = re.search(r'https://[^"]+\.mp3', body)
    tags = sorted(set(re.findall(r'class="tag-name">([^<]+)', body)))
    return {"mp3": mp3.group(0) if mp3 else None, "tags": tags}


def library_titles(tracks_path):
    src = open(tracks_path, encoding="utf-8").read()
    return {t.lower() for t in re.findall(r"title:\s*'([^']+)'", src)}


def main():
    tracks_path = sys.argv[1] if len(sys.argv) > 1 else "tracks.js"
    want_tags = "--tags" in sys.argv
    have = library_titles(tracks_path)
    out = []
    for artist in ARTISTS:
        for tid, title in catalog(artist["name"]).items():
            if title.lower() in have:
                continue
            cand = {"title": title, "artist": artist["name"],
                    "license": artist["license"], "artistLink": artist["link"],
                    "page": f"https://www.chosic.com/download-audio/{tid}/"}
            if want_tags:
                try:
                    cand.update(track_page_details(tid))
                except Exception as e:
                    cand["error"] = str(e)
                time.sleep(2)
            out.append(cand)
            print(f"  {artist['name']} — {title}", file=sys.stderr)
    json.dump(out, sys.stdout, indent=2)
    print(f"\n{len(out)} candidates not yet in the library", file=sys.stderr)


if __name__ == "__main__":
    main()
