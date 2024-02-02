<script lang="ts">
  import { writable } from "svelte/store";
  import { blobToImage, downScale, invertImage } from "./image.ts";
  import Button from "../../../components/Button.svelte";

  let dragging = $state(false);
  let progress = writable(0);
  let imageSrcOriginal = $state<string | null>(null);
  let imageSrcRGB = $state<string | null>(null);
  let imageSrcLight = $state<string | null>(null);
  let imageSrcCP = $state<string | null>(null);

  const drop = async (event: DragEvent) => {
    event.preventDefault();
    dragging = false;
    process(event.dataTransfer!.files[0]!);
  };

  const dragover = (event: DragEvent) => {
    event.preventDefault();
    dragging = true;
  };

  const cancel = () => {
    dragging = false;
  };

  let stage = $state<"rest" | "working" | "result" | "error">("rest");

  let abortLast: (() => void) | undefined = undefined;
  const process = async (file: File) => {
    let abortController = new AbortController();
    let abortSignal = abortController.signal;
    abortLast?.();
    abortLast = () => abortController.abort();
    try {
      const image = await blobToImage(file);

      const resized = await downScale(image, 600, 600);
      stage = "working";
      imageSrcOriginal = resized.src;

      const { rgbImage, lightImage, cpImage } = await invertImage(
        resized,
        progress,
        abortSignal
      );
      if (abortSignal.aborted) {
        return;
      }

      imageSrcRGB = rgbImage.src;
      imageSrcLight = lightImage.src;
      imageSrcCP = cpImage.src;
      stage = "result";
    } catch (e) {
      console.error(e);
      stage = "error";
    }
  };

  let inputEl: HTMLInputElement | null = null;
  const choose = () => {
    inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = "image/*";
    inputEl.onchange = () => {
      if (inputEl!.files!.length > 0) {
        process(inputEl!.files![0]!);
      }
    };
    inputEl.click();
  };
</script>

<section
  aria-label="Image inverter widget"
  aria-busy={stage === "working"}
  class="drop-target"
  class:dragging
  on:drop={drop}
  on:dragover={dragover}
  on:dragend={cancel}
  on:dragleave={cancel}
  on:dragexit={cancel}
>
  {#if stage === "rest"}
    <div class="full-width stack">
      <p>Drag an image here to compare inversion modes.</p>
      <Button on:click={choose}>Choose file</Button>
    </div>
  {/if}
  {#if stage !== "rest" && stage !== "error"}
    <h5>Original</h5>
    <img src={imageSrcOriginal} alt="Original with no color inversion" />
  {/if}
  {#if stage === "working"}
    <div class="full-width stack">
      <p>Inverting...</p>
      <div
        role="progressbar"
        aria-valuenow={$progress}
        aria-valuemin="0"
        aria-valuemax="1"
      >
        <div class="inner" style="width: {$progress * 100}%" />
      </div>
    </div>
  {/if}
  {#if stage === "result"}
    <h5>RGB inversion</h5>
    <img src={imageSrcRGB} alt="RGB inversion" />
    <h5>Lightness inversion</h5>
    <img src={imageSrcLight} alt="Lightness inversion" />
    <h5>Contrast preserving inversion</h5>
    <img src={imageSrcCP} alt="Contrast preserving inversion" />
    <div class="full-width stack">
      <Button on:click={choose}>Choose another image</Button>
    </div>
  {/if}
  {#if stage === "error"}
    <div class="full-width stack">
      <p>Failed to process image!</p>
      <Button on:click={choose}>Try again</Button>
    </div>
  {/if}
</section>

<style lang="scss">
  @use "../../../styles/type.scss";
  @use "../../../styles/space.scss";
  @use "../../../styles/color.scss";

  .drop-target {
    appearance: none;
    border: none;
    font: inherit;
    border-radius: space.sp(0);
    min-height: space.sp(4);
    padding: space.sp(0);
    background-color: color.$background-secondary;
    display: grid;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: space.sp(0);
    margin: space.sp(2) 0;
    grid-template-columns: 6rem 1fr;
    color: inherit;
  }

  img {
    max-width: 100%;
  }

  .full-width {
    grid-column: 1 / 3;
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: space.sp(0);
    gap: space.sp(0);
  }
  p {
    margin: 0;
  }

  [role="progressbar"] {
    width: 100%;
    max-width: 12rem;
    height: space.sp(-2);
    background-color: color.$background;
    border-radius: space.sp(-2);
    overflow: hidden;

    .inner {
      background: color.$link;
      height: 100%;
      border-radius: space.sp(-2);
    }
  }

  .dragging {
    border: space.sp(-4) dotted color.$secondary;
  }

  p {
    grid-column: 1 / 3;
    color: color.$secondary;
    margin: space.sp(0) 0;
  }

  @keyframes processing {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
</style>
