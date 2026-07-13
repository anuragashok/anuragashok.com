/**
 * The widths post images are served at, and the one quality level.
 *
 * Next's image optimizer REJECTS any `w` that is not in `images.deviceSizes ∪
 * images.imageSizes` — it answers 400, and a 400 on an `<img>` is a broken image
 * with nothing in the build log. The rehype plugin was emitting 960 and 1280,
 * neither of which is in Next's defaults, so every hero image on every post was
 * broken in production. Nothing failed: not the build, not the tests.
 *
 * So the widths have exactly one definition. `next.config.ts` feeds them to
 * `images.deviceSizes` (making them legal) and `lib/rehype-optimize-images.ts`
 * writes them into the srcset. They cannot drift apart.
 *
 * The prose column is `max-w-2xl` (672px), so 640 covers 1x, and 960/1280 cover
 * the retina cases.
 */
export const POST_IMAGE_WIDTHS = [640, 960, 1280] as const;

/** Next only permits qualities listed in `images.qualities` (default: 75 alone). */
export const POST_IMAGE_QUALITY = 75;
