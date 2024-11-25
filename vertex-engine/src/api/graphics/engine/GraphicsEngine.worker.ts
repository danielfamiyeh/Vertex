import { Vector } from '../../math/vector/Vector';
import { Rasterizer } from '../rasterizer/Rasterizer';
import { Triangle } from '../triangle/Triangle';
import { printOne } from './GraphicsEngine';
import { PIPELINE_STAGES } from './GraphicsEngine.utils';

const triangleProto = new Triangle([], '', 'stroke', []);
onmessage = function (evt) {
  switch (evt.data.stage) {
    case PIPELINE_STAGES.rasterization: {
      const [vertexOutput] = evt.data.args;

      for (let i = 0; i < vertexOutput.length; i++) {}

      vertexOutput.forEach((vo) => {});

      for (let vo of vertexOutput) {
        const { centroid, worldNormal, triangle } = vo;
        triangle.__proto__ = triangleProto;
        printOne(vertexOutput);
      }
    }
  }
};
