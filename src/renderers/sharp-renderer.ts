/**
 * 自定义渲染器 - 去掉积木块的圆角，改为直角
 */
import * as Blockly from "blockly/core";

interface SharpOutsideCorners {
  topLeft: string;
  topRight: string;
  bottomRight: string;
  bottomLeft: string;
  rightHeight: number;
}

interface SharpInsideCorners {
  pathTop: string;
  pathBottom: string;
  pathTopLeft: string;
  pathBottomLeft: string;
  height: number;
  width: number;
}

class SharpConstantProvider extends Blockly.blockRendering.ConstantProvider {
  constructor() {
    super();
  }

  override init(): void {
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
  override makeOutsideCorners(): SharpOutsideCorners {
    const radius: number = this.CORNER_RADIUS;

    const topLeft: string = Blockly.utils.svgPaths.moveBy(-radius, 0) +
      Blockly.utils.svgPaths.lineOnAxis("v", -radius);

    const topRight: string = Blockly.utils.svgPaths.lineOnAxis("h", radius) +
      Blockly.utils.svgPaths.lineOnAxis("v", radius);

    const bottomRight: string = Blockly.utils.svgPaths.lineOnAxis("v", radius) +
      Blockly.utils.svgPaths.lineOnAxis("h", -radius);

    const bottomLeft: string = Blockly.utils.svgPaths.lineOnAxis("h", -radius) +
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
  override makeInsideCorners(): SharpInsideCorners {
    const radius: number = this.CORNER_RADIUS;

    const pathTopLeft: string = Blockly.utils.svgPaths.lineOnAxis("h", -radius) +
      Blockly.utils.svgPaths.lineOnAxis("v", radius);

    const pathBottomLeft: string = Blockly.utils.svgPaths.lineOnAxis("v", radius) +
      Blockly.utils.svgPaths.lineOnAxis("h", -radius);

    return {
      pathTop: pathTopLeft,
      pathBottom: pathBottomLeft,
      pathTopLeft,
      pathBottomLeft,
      height: radius,
      width: radius,
    };
  }
}

class SharpRenderer extends Blockly.blockRendering.Renderer {
  constructor(name: string) {
    super(name);
  }

  protected override makeConstants_(): SharpConstantProvider {
    return new SharpConstantProvider();
  }
}

// 注册自定义渲染器
Blockly.blockRendering.register("sharp", SharpRenderer);

export default SharpRenderer;
