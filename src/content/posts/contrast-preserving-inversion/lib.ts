// Copyright 2024 Jordan Yoon-Buck
// License: 0BSD (https://spdx.org/licenses/0BSD.html)
//
// Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby
// granted.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
// INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
// AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
// PERFORMANCE OF THIS SOFTWARE.

import { hsl, srgb, srgbLinear, type MaybeColor } from "@thi.ng/color";

/**
 * Calculates relative luminance of a color as defined by
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 *
 * Note the value 0.0405 is different from a previous version
 * of the specification, which used 0.03928. This has no effect
 * on the results of this function for 8-bit RGB color.
 *
 * @param color input color
 */
export const relativeLuminance = (color: MaybeColor) => {
  const { r, g, b } = srgb(color);

  return (
    srgbLinear(r) * 0.2126 + srgbLinear(g) * 0.7152 + srgbLinear(b) * 0.0722
  );
};

export const contrast = (c1: MaybeColor, c2: MaybeColor) => {
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);

  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

/**
 * Invert luminance in such a manner as to preserve the contrast ratio
 * between two luminances inverted by this function. See linked post
 * for derivation and more information.
 *
 * @see https://jordan.yoonbuck.com/post/contrast-preserving-inversion
 */
export const invertLuminance = (l: number) =>
  Math.min(1, Math.max(0, (1 - l) / (20 * l + 1)));

/**
 * Return a color with the same hue and saturation as the input color,
 * but with a lightness such that the relative luminance is very close
 * to the target luminance provided.
 */
export const withLuminance = (color: MaybeColor, targetLuminance: number) => {
  const { h, s } = hsl(color);
  let upperLightness = 1;
  let lowerLightness = 0;
  while (upperLightness - lowerLightness > 0.001) {
    const lightness = (upperLightness + lowerLightness) / 2;
    const luminance = relativeLuminance(hsl(h, s, lightness));
    if (luminance > targetLuminance) {
      upperLightness = lightness;
    } else {
      lowerLightness = lightness;
    }
  }
  return srgb(hsl(h, s, lowerLightness));
};

/**
 * Invert a color in such a manner as to preserve the contrast ratio
 * between any two colors if both are inverted by this function.
 * See linked post for derivation and more information.
 *
 * The hue and saturation of the input color are preserved to within
 * about 1º/%; only its lightness is changed.
 *
 * @see https://jordan.yoonbuck.com/post/contrast-preserving-inversion
 */
export const invertCP = (color: MaybeColor) =>
  withLuminance(color, invertLuminance(relativeLuminance(color)));

export const invertLightness = (color: MaybeColor) => {
  const { h, s, l } = hsl(color);
  return hsl(h, s, 1 - l);
};

export const invertRGB = (color: MaybeColor) => {
  const { r, g, b } = srgb(color);
  return srgb(1 - r, 1 - g, 1 - b);
};
