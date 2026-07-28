from __future__ import annotations

import re
import time
from collections import deque
from pathlib import Path
from urllib.parse import urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen

BASE = "https://people.sc.fsu.edu/~gerlebacher/course/isc5305_f2026/"
OUTPUT = Path(__file__).parent / "course"
MAX_PAGES = 250

HREF_RE = re.compile(r"""href=(["'])(.*?)\1""", re.IGNORECASE)
HEAD_END_RE = re.compile(r"</head>", re.IGNORECASE)


def normalized_page_url(url: str) -> str | None:
    url, _ = urldefrag(url)
    parsed = urlparse(url)
    if not url.startswith(BASE):
        return None
    if parsed.query:
        return None
    suffix = Path(parsed.path).suffix.lower()
    if suffix and suffix not in {".html", ".htm"}:
        return None
    if not parsed.path.endswith("/") and not suffix:
        url += "/"
    return url


def local_path(url: str) -> Path:
    relative = url.removeprefix(BASE).strip("/")
    if not relative:
        return OUTPUT / "index.html"
    path = OUTPUT / relative
    if Path(relative).suffix.lower() in {".html", ".htm"}:
        return path
    return path / "index.html"


def theme_href(destination: Path) -> str:
    depth = len(destination.relative_to(OUTPUT).parents) - 1
    return "../" * depth + "student-theme.css"


def rewrite_course_links(html: str, page_url: str, destination: Path) -> str:
    def replace(match: re.Match[str]) -> str:
        quote, href = match.groups()
        absolute = urljoin(page_url, href)
        fragment = urlparse(absolute).fragment
        target_url = normalized_page_url(absolute)
        if target_url is None:
            if absolute.startswith(BASE):
                return f"href={quote}{absolute}{quote}"
            return match.group(0)
        target = local_path(target_url)
        relative = Path(
            __import__("os").path.relpath(target, start=destination.parent)
        ).as_posix()
        if fragment:
            relative += f"#{fragment}"
        return f"href={quote}{relative}{quote}"

    rewritten = HREF_RE.sub(replace, html)
    stylesheet = f'<link rel="stylesheet" href="{theme_href(destination)}">'
    return HEAD_END_RE.sub(f"{stylesheet}\n</head>", rewritten, count=1)


def fetch(url: str) -> str:
    request = Request(url, headers={"User-Agent": "ISC5305-local-mirror/1.0"})
    with urlopen(request, timeout=30) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    queue = deque([BASE])
    seen: set[str] = set()

    while queue and len(seen) < MAX_PAGES:
        url = queue.popleft()
        if url in seen:
            continue

        print(f"[{len(seen) + 1:03}] {url}")
        try:
            html = fetch(url)
        except Exception as error:
            print(f"      skipped: {error}")
            seen.add(url)
            continue

        destination = local_path(url)
        destination.parent.mkdir(parents=True, exist_ok=True)

        for _, href in HREF_RE.findall(html):
            candidate = normalized_page_url(urljoin(url, href))
            if candidate and candidate not in seen:
                queue.append(candidate)

        destination.write_text(
            rewrite_course_links(html, url, destination),
            encoding="utf-8",
        )
        seen.add(url)
        time.sleep(0.03)

    print(f"Mirrored {len(seen)} pages into {OUTPUT}")


if __name__ == "__main__":
    main()
