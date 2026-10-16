import { type CSSProperties, useId } from 'react';

export type LogoImageProps = {
  src: string;
  alt?: string;
  /**
   * Hex color (e.g. "#FFFFFF"): renders the logo as a flat silhouette of this
   * color. Null/undefined renders the image untouched.
   */
  fillColor?: string | null;
  className?: string;
  style?: CSSProperties;
};

/**
 * An <img> that can recolor its logo into a flat silhouette via an inline SVG
 * filter (a plain CSS `filter` can't target an arbitrary hex color). Both
 * transparent and near-white pixels are treated as background — the latter so
 * logos exported on a solid white background don't become a solid rectangle —
 * and every other pixel is flooded with `fillColor`, preserving the alpha
 * channel (anti-aliased edges keep their opacity).
 *
 * Uses inline styles only: it is bundled into the SDK and rendered on
 * style-less customer pages.
 */
export function LogoImage({
  src,
  alt,
  fillColor,
  className,
  style,
}: LogoImageProps) {
  // useId output contains characters (":") that break `url(#...)` references.
  const filterId = `logo-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (!fillColor) {
    return <img src={src} alt={alt ?? ''} className={className} style={style} />;
  }

  return (
    <>
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id={filterId} colorInterpolationFilters="sRGB">
          {/* alpha = luminance (white -> 1, dark -> 0) */}
          <feColorMatrix
            in="SourceGraphic"
            type="luminanceToAlpha"
            result="lum"
          />
          {/* invert with a steep ramp: luminance >= ~0.95 -> 0, <= ~0.9 -> 1,
              so near-white counts as background */}
          <feComponentTransfer in="lum" result="notWhite">
            <feFuncA type="linear" slope="-20" intercept="19" />
          </feComponentTransfer>
          {/* mask = notWhite * original alpha (keeps transparency) */}
          <feComposite
            in="notWhite"
            in2="SourceAlpha"
            operator="in"
            result="mask"
          />
          <feFlood floodColor={fillColor} />
          <feComposite in2="mask" operator="in" />
        </filter>
      </svg>
      <img
        src={src}
        alt={alt ?? ''}
        className={className}
        style={{ ...style, filter: `url(#${filterId})` }}
      />
    </>
  );
}
