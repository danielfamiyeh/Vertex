import { Rasterizer } from '../rasterizer/Rasterizer';
import { Triangle } from '../triangle/Triangle';
import { PIPELINE_STAGES } from './GraphicsEngine.utils';

const triangleProto = new Triangle([], '', 'stroke', []);
onmessage = function (evt) {
  switch (evt.data.stage) {
    case PIPELINE_STAGES.rasterization: {
      const { vertexOutput, imageData } = evt.data.args;

      for (let vo of vertexOutput) {
        const { centroid, worldNormal, triangle } = vo;
        triangle.__proto__ = triangleProto;
      }
      // if (imageData) printOne(imageData);
      const fragments = Rasterizer.compute(vertexOutput, imageData);

      this.postMessage({ stage: evt.data.stage, fragments });
    }
  }
};
