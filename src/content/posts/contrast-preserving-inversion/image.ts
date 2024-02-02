import type { Writable } from "svelte/store";
import { makeTrigger } from "../../../lib/async";
import type { ImageWorkerMessage } from "./imageWorker";
import ImageWorker from "./imageWorker?worker";

export const blobToImage = (data: Blob) => {
  const url = URL.createObjectURL(data);
  const promise = urlToImage(url);
  promise.finally(() => URL.revokeObjectURL(url));
  return promise;
};

export const urlToImage = (url: string) =>
  new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });

export const downScale = (
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
) => {
  if (image.width <= maxWidth && image.height <= maxHeight) {
    return image;
  }
  // Calculate the new dimensions.
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = Math.floor(image.width * ratio);
  const height = Math.floor(image.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const steps = (image.width / width) >> 1;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `blur(${steps}px)`;
  ctx.drawImage(image, 0, 0);

  const canvas2 = document.createElement("canvas");
  canvas2.width = width;
  canvas2.height = height;
  const ctx2 = canvas2.getContext("2d")!;
  ctx2.drawImage(canvas, 0, 0, width, height);
  return urlToImage(canvas2.toDataURL());
};

type ImageTriplet = {
  rgbImage: HTMLImageElement;
  lightImage: HTMLImageElement;
  cpImage: HTMLImageElement;
};

export const invertImage = async (
  image: HTMLImageElement,
  progress?: Writable<number>,
  signal?: AbortSignal
): Promise<ImageTriplet> => {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d", { colorSpace: "srgb" })!;

  // Get image data from source
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const imageData = ctx.getImageData(0, 0, image.width, image.height, {
    colorSpace: "srgb",
  });

  const trigger = makeTrigger<ImageTriplet>();

  const render = async (
    data: ImageWorkerMessage & { type: "done" }
  ): Promise<ImageTriplet> => {
    const rgbData = new ImageData(data.rgbBuf, image.width, image.height, {
      colorSpace: "srgb",
    });
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.putImageData(rgbData, 0, 0);
    const rgbUrl = canvas.toDataURL();
    const lightData = new ImageData(data.lightBuf, image.width, image.height, {
      colorSpace: "srgb",
    });
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.putImageData(lightData, 0, 0);
    const lightUrl = canvas.toDataURL();
    const cpData = new ImageData(data.cpBuf, image.width, image.height, {
      colorSpace: "srgb",
    });
    ctx.clearRect(0, 0, image.width, image.height);
    ctx.putImageData(cpData, 0, 0);
    const cpUrl = canvas.toDataURL();
    return await Promise.all([
      urlToImage(rgbUrl),
      urlToImage(lightUrl),
      urlToImage(cpUrl),
    ]).then(([rgbImage, lightImage, cpImage]) => ({
      rgbImage,
      lightImage,
      cpImage,
    }));
  };

  const worker = new ImageWorker();
  const listener = (event: MessageEvent<ImageWorkerMessage>) => {
    if (!signal?.aborted) {
      if (event.data.type === "done") {
        render(event.data).then(trigger.fire);
      } else if (event.data.type === "progress") {
        progress?.set(event.data.percentage);
      }
    }
  };
  worker.addEventListener("message", listener);

  // Send image data to worker
  worker.postMessage({ imageData }, [imageData.data.buffer]);

  return trigger.signal;
};
