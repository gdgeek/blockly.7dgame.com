/**
 * 自定义渲染器 - 去掉积木块的圆角，改为直角
 */
import * as Blockly from "blockly/core";

class SharpConstantProvider extends Blockly.blockRendering.ConstantProvider {
  constructor() {
    super();
  }

  init() {
    super.init();

    // 将所有圆角半径设为 0
    this.CORNER_RADIUS = 0;

    // 重新生成受圆角影响的路径
    this.OUTSIDE_CORNERS = this.makeOutsideCorners();
    this.INSIDE_CORNERS = this.makeInsideCorners();
  }

  /**
   * 外角路径 - 直角
   */
  makeOutsideCorners() {
    const radius = this.CORNER_RADIUS;

    const topLeft = Blockly.utils.svgPaths.moveBy(-radius, 0) +
      Blockly.utils.svgPaths.lineOnAxis("v", -radius);

    const topRight = Blockly.utils.svgPaths.lineOnAxis("h", radius) +
      Blockly.utils.svgPaths.lineOnAxis("v", radius);

    const bottomRight = Blockly.utils.svgPaths.lineOnAxis("v", radius) +
      Blockly.utils.svgPaths.lineOnAxis("h", -radius);

    const bottomLeft = Blockly.utils.svgPaths.lineOnAxis("h", -radius) +
      Blockly.utils.svgPaths.lineOnAxis("v", -radius);

    return {
      topLeft,
      topRight,
      bottomRight,
      bottomLeft,
      rightHeight: radius,
    };
  }

  /**
   * 内角路径 - 直角
   */
  makeInsideCorners() {
    const radius = this.CORNER_RADIUS;

    const pathTopLeft = Blockly.utils.svgPaths.lineOnAxis("h", -radius) +
      Blockly.utils.svgPaths.lineOnAxis("v", radius);

    const pathBottomLeft = Blockly.utils.svgPaths.lineOnAxis("v", radius) +
      Blockly.utils.svgPaths.lineOnAxis("h", -radius);

    return {
      pathTopLeft,
      pathBottomLeft,
      height: radius,
      width: radius,
    };
  }
}

class SharpRenderer extends Blockly.blockRendering.Renderer {
  constructor(name) {
    super(name);
  }

  makeConstants_() {
    return new SharpConstantProvider();
  }
}

// 注册自定义渲染器
Blockly.blockRendering.register("sharp", SharpRenderer);

export default SharpRenderer;
