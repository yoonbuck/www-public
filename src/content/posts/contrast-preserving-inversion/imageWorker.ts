import { srgb } from "@thi.ng/color";
import { invertCP, invertLightness } from "./lib";

export type ImageWorkerMessage = DoneMessage | ProgressMessage;
type DoneMessage = {
  type: "done";
  rgbBuf: Uint8ClampedArray;
  lightBuf: Uint8ClampedArray;
  cpBuf: Uint8ClampedArray;
};

type ProgressMessage = {
  type: "progress";
  percentage: number;
};

self.onmessage = (event) => {
  const imageData = event.data.imageData as ImageData;
  const data = imageData.data;

  const rgbBuf = new Uint8ClampedArray(data.length);
  const lightBuf = new Uint8ClampedArray(data.length);
  const cpBuf = new Uint8ClampedArray(data.length);

  const length = data.length / 4;
  let percentage = 0;

  for (let i = 0; i < length; i++) {
    percentage = i / length;
    if (i % 1024 === 0) {
      self.postMessage({
        type: "progress",
        percentage,
      } satisfies ProgressMessage);
    }

    let r = data[i * 4 + 0]!;
    let g = data[i * 4 + 1]!;
    let b = data[i * 4 + 2]!;
    let a = data[i * 4 + 3]!;

    rgbBuf[i * 4 + 0] = 255 - r;
    rgbBuf[i * 4 + 1] = 255 - g;
    rgbBuf[i * 4 + 2] = 255 - b;
    rgbBuf[i * 4 + 3] = a;

    const color = srgb(r / 255, g / 255, b / 255);

    const { r: lr, g: lg, b: lb } = srgb(invertLightness(color));

    lightBuf[i * 4 + 0] = Math.round(lr * 255);
    lightBuf[i * 4 + 1] = Math.round(lg * 255);
    lightBuf[i * 4 + 2] = Math.round(lb * 255);
    lightBuf[i * 4 + 3] = a;

    const { r: cr, g: cg, b: cb } = invertCP(color);

    cpBuf[i * 4 + 0] = Math.round(cr * 255);
    cpBuf[i * 4 + 1] = Math.round(cg * 255);
    cpBuf[i * 4 + 2] = Math.round(cb * 255);
    cpBuf[i * 4 + 3] = a;
  }

  self.postMessage(
    { type: "done", rgbBuf, lightBuf, cpBuf } satisfies ImageWorkerMessage,
    { transfer: [rgbBuf.buffer, lightBuf.buffer, cpBuf.buffer] }
  );
};
