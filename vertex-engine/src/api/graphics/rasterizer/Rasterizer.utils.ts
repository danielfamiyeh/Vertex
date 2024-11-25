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
