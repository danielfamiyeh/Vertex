import { printOne } from '../engine/GraphicsEngine';

export const getImageDataAtPixel = (
  x: number,
  y: number,
  imageData: ImageData
) => {
  const idx = (x + y * imageData.width) * 4;

  return [
    imageData.data[idx],
    imageData.data[idx + 1],
    imageData.data[idx + 2],
    imageData.data[idx + 3],
  ];
};

export const setImageDataPixel = (
  newValues: number[],
  x: number,
  y: number,
  imageData: ImageData
) => {
  if (!imageData) return;
  const idx = 4 * (y * imageData.width + x);
  newValues.forEach((v, i) => (imageData.data[idx + i] = v));
};
