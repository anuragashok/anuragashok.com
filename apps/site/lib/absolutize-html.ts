// `[^>"']|"[^"]*"|'[^']*'` walks either a bare (non-quote, non-`>`) character or a fully-quoted
// attribute value, so an unescaped `>` inside a quoted attribute (e.g. human-authored `alt` text
// like `alt="Before -> after"`) doesn't prematurely end the tag match. `hast-util-to-html` escapes
// `"` and `&` in attribute values but NOT `>` (spec-compliant), so this is a real, live case.
const IMG_TAG_RE = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const A_TAG_RE = /<a\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
// Matches a double- or single-quoted attribute value. `hast-util-to-html` always emits
// double quotes, but tests (and any hand-written HTML that slips through) may use single
// quotes, so both are supported on read; writes always canonicalize to double quotes.
const ATTR_RE = (name: string) => new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i");

/** Decodes the small set of HTML entities that can appear inside a serialized attribute value. */
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x26;/gi, "&")
    .replace(/&#38;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getAttr(tag: string, name: string): string | null {
  const match = tag.match(ATTR_RE(name));
  if (!match) return null;
  const raw = match[1] ?? match[2] ?? "";
  return decodeHtmlEntities(raw);
}

/** Mirrors how the upstream serializer escapes attribute values, so re-serialization stays valid. */
function encodeAttrValue(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function setAttr(tag: string, name: string, value: string): string {
  const encoded = encodeAttrValue(value);
  // Always canonicalize the written attribute to double quotes, regardless of what quote style
  // (or none) the source tag used — this matches how `hast-util-to-html` always serializes.
  if (ATTR_RE(name).test(tag)) {
    return tag.replace(ATTR_RE(name), ` ${name}="${encoded}"`);
  }
  return tag.replace(/^<(\w+)/, `<$1 ${name}="${encoded}"`);
}

function removeAttr(tag: string, name: string): string {
  return tag.replace(ATTR_RE(name), "");
}

function joinUrl(baseUrl: string, rootRelativePath: string): string {
  return `${baseUrl.replace(/\/$/, "")}${rootRelativePath}`;
}

/**
 * Makes a root-relative URL absolute against `baseUrl`. Leaves everything else untouched:
 * fragment links (`#foo`), URLs that already carry a scheme (`https:`, `mailto:`, …),
 * and protocol-relative URLs (`//example.com`).
 */
function absolutizeUrl(url: string, baseUrl: string): string {
  if (url.startsWith("#")) return url;
  if (url.startsWith("//")) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  if (!url.startsWith("/")) return url;
  return joinUrl(baseUrl, url);
}

/**
 * Resolves an `<img src>` for feed consumption. Next's image optimizer URLs
 * (`/_next/image?url=%2Fstatic%2F...&w=1280&q=75`) are rewritten to point straight at the
 * original static asset (`/static/...`) rather than the optimizer: the optimizer URL is an
 * implementation detail that many RSS readers/proxies won't round-trip cleanly, whereas the
 * static asset is a plain file that always works and readers do their own image sizing anyway.
 */
function resolveImageSrc(src: string, baseUrl: string): string {
  const optimizerMatch = src.match(/^\/_next\/image\?url=([^&]+)(?:&.*)?$/);
  if (optimizerMatch) {
    // A malformed percent-encoding (e.g. a lone `%E0` truncated mid-sequence) throws a URIError.
    // This runs synchronously inside the feed route's GET() handler, so an uncaught throw here
    // would 500 the ENTIRE feed over one bad image, not just degrade that one image. Degrade
    // gracefully instead: fall back to absolutizing the raw (still root-relative) optimizer URL.
    try {
      const originalPath = decodeURIComponent(optimizerMatch[1]!);
      return absolutizeUrl(originalPath, baseUrl);
    } catch {
      return absolutizeUrl(src, baseUrl);
    }
  }
  return absolutizeUrl(src, baseUrl);
}

/**
 * Makes post HTML self-contained for RSS: rewrites root-relative image/link URLs to absolute
 * ones so the feed renders correctly in readers that don't resolve relative URLs against the
 * feed's own address (most don't — RSS 2.0 has no `xml:base`). Also strips `srcset`/`sizes`
 * from images, since those reference optimizer URLs that are meaningless outside the site and
 * readers do their own responsive sizing regardless.
 *
 * This is only ever applied to the feed. The site itself keeps serving the optimized
 * `/_next/image` markup with `srcset` unchanged.
 */
export function absolutizeHtml(html: string, baseUrl: string): string {
  let result = html.replace(IMG_TAG_RE, (imgTag) => {
    let tag = imgTag;
    const src = getAttr(tag, "src");
    if (src !== null) {
      tag = setAttr(tag, "src", resolveImageSrc(src, baseUrl));
    }
    tag = removeAttr(tag, "srcset");
    tag = removeAttr(tag, "sizes");
    return tag;
  });

  result = result.replace(A_TAG_RE, (aTag) => {
    const href = getAttr(aTag, "href");
    if (href === null) return aTag;
    return setAttr(aTag, "href", absolutizeUrl(href, baseUrl));
  });

  return result;
}
