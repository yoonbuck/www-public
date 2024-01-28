<script lang="ts">
  import { css, srgb } from "@thi.ng/color";
  import {
    contrast,
    invertCP,
    invertLightness,
    invertRGB,
    relativeLuminance,
  } from "./lib";

  interface Props {
    strategy: "naive" | "lightness" | "contrast-preserving";
  }

  let { strategy } = $props<Props>();
  let invert = $derived(
    strategy === "naive"
      ? invertRGB
      : strategy === "lightness"
        ? invertLightness
        : invertCP
  );

  function round2(n: number) {
    return Math.round(n * 100) / 100;
  }
  function round3(n: number) {
    return Math.round(n * 1000) / 1000;
  }

  let color1 = $state("#591a9f");
  let color2 = $state("#c4cfe0");

  let color1Inverted = $derived(css(srgb(invert(color1))));
  let color2Inverted = $derived(css(srgb(invert(color2))));
</script>

<div class="container">
  <div class="block">
    <input type="color" bind:value={color1} />
    <input type="color" bind:value={color2} />
    <div class="demo-block" style="background-color: {color2};">
      <p style="color: {color1};">Text</p>
    </div>
    <div class="info">
      <p>
        <strong>Contrast:</strong>
        <span>{round2(contrast(color1, color2))}</span>
      </p>
      <p>
        <strong>Foreground:</strong>
        <span>{color1}</span> <span>({round3(relativeLuminance(color1))})</span>
      </p>
      <p>
        <strong>Background:</strong>
        <span>{color2}</span> <span>({round3(relativeLuminance(color2))})</span>
      </p>
    </div>
  </div>
  <div class="block">
    <input type="color" disabled value={color1Inverted} />
    <input type="color" disabled value={color2Inverted} />
    <div class="demo-block" style="background-color: {color2Inverted};">
      <p style="color: {color1Inverted};">Text</p>
    </div>
    <div class="info">
      <p>
        <strong>Contrast:</strong>
        <span>{round2(contrast(color1Inverted, color2Inverted))}</span>
      </p>
      <p>
        <strong>Foreground:</strong>
        <span>{color1Inverted}</span>
        <span>({round3(relativeLuminance(color1Inverted))})</span>
      </p>
      <p>
        <strong>Background:</strong>
        <span>{color2Inverted}</span>
        <span>({round3(relativeLuminance(color2Inverted))})</span>
      </p>
    </div>
  </div>
</div>

<style lang="scss">
  @use "../../../styles/type.scss";
  @use "../../../styles/space.scss";
  @use "../../../styles/color.scss";

  .container {
    margin: space.sp(2) 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: space.sp(2);
  }
  .block {
    display: flex;
    flex: 1;
    min-width: 14rem;
    flex-direction: column;
    align-items: stretch;
    padding: space.sp(0);
    gap: space.sp(0);
    justify-content: center;
    background-color: color.$background-secondary;
    border-radius: space.sp(0);
  }

  input {
    width: 100%;
    border: 0;
    border-radius: space.sp(-5);
    appearance: none;
  }

  .demo-block {
    border-radius: space.sp(-5);
    padding: space.sp(1);
    p {
      text-align: center;
      margin: 0 auto;
      @include type.scale(1);
    }
  }

  .info {
    border-radius: space.sp(-5);
    background: color.$background;
    padding: space.sp(0);
    span {
      font-family: monospace;
    }
    p {
      @include type.scale(-1);
      margin: 0;
    }
  }
</style>
