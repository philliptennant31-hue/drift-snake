"""Resolve streaming links for the artist tracks.

Apple Music: iTunes Search API (free, no auth) gives canonical
music.apple.com track URLs. Spotify: generated search deep links
(open.spotify.com/search/<artist> <title>) — no API involved, which
matters because Spotify's developer terms prohibit API use in games,
and link aggregators (Odesli) lack Spotify mappings for these tracks.

Usage: python tools/resolve_links.py tracks.js > links.json
"""
import json
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

UA = {"User-Agent": "drift-snake-link-resolver/1.0"}


def get_json(url, tries=4):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < tries - 1:
                time.sleep(20 * (attempt + 1))
                continue
            raise


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def parse_tracks(path):
    src = open(path, encoding="utf-8").read()
    return [{"title": m.group(1), "artist": m.group(2)}
            for m in re.finditer(r"title:\s*'([^']+)',\s*artist:\s*'([^']+)'", src)]


def itunes_lookup(title, artist):
    # streaming credits "Erik Satie, perf. Kevin MacLeod" as just Kevin MacLeod
    search_artist = artist.split("perf. ")[-1]
    term = urllib.parse.quote(norm(f"{search_artist} {title}"))
    data = get_json(f"https://itunes.apple.com/search?term={term}&entity=song&limit=12")
    want_t, want_a = norm(title), norm(search_artist)
    for r in data.get("results", []):
        got_t, got_a = norm(r.get("trackName", "")), norm(r.get("artistName", ""))
        if want_a == got_a and (want_t == got_t or got_t.startswith(want_t)):
            url = r.get("trackViewUrl", "")
            if not url:
                return None
            # keep only the ?i= track anchor; drop affiliate/analytics params
            base, _, query = url.partition("?")
            i = dict(p.split("=", 1) for p in query.split("&") if "=" in p).get("i")
            return f"{base}?i={i}" if i else base
    return None


def main():
    tracks = parse_tracks(sys.argv[1] if len(sys.argv) > 1 else "tracks.js")
    results = {}
    for t in tracks:
        search_artist = t["artist"].split("perf. ")[-1]
        spotify = "https://open.spotify.com/search/" + urllib.parse.quote(
            f"{search_artist} {t['title']}")
        try:
            apple = itunes_lookup(t["title"], t["artist"])
        except Exception as e:
            apple = None
            print(f"  {t['title']}: ERROR {e}", file=sys.stderr)
        results[t["title"]] = {"spotify": spotify, "apple": apple}
        print(f"  {t['title']}: apple={'ok' if apple else 'missing'}", file=sys.stderr)
        time.sleep(3.5)  # stay friendly with the iTunes rate limit
    json.dump(results, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
