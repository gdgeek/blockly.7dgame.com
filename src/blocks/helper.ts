import * as Blockly from "blockly";
import * as Lua from "blockly/lua";
import * as Javascript from "blockly/javascript";

interface BlocklyBlock {
  getFieldValue: (name: string) => string;
  [key: string]: unknown;
}

interface BlocklyGenerator {
  statementToCode: (block: object, name: string) => string;
  valueToCode: (block: object, name: string, order: unknown) => string;
  [key: string]: unknown;
}

interface BlockDefinition {
  title: string;
  type?: string;
  colour?: number;
  getBlockJson?: (parameters: unknown) => object;
  getBlock: (parameters: unknown) => object;
  getJavascript: (
    parameters: unknown
  ) => (block: BlocklyBlock, generator: BlocklyGenerator) => unknown;
  getLua: (
    parameters: unknown
  ) => (block: BlocklyBlock, generator: BlocklyGenerator) => unknown;
  toolbox?: {
    kind: string;
    type: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ToolboxCategory {
  kind: string;
  name: string;
  contents?: unknown[];
  [key: string]: unknown;
}

interface Toolbox {
  kind?: string;
  contents: ToolboxCategory[];
  [key: string]: unknown;
}

function RegisterData(data: BlockDefinition, parameters: unknown): void {
  Blockly.Blocks[data.title] = data.getBlock(parameters);
  Lua.luaGenerator.forBlock[data.title] = data.getLua(
    parameters
  ) as unknown as (
    block: Blockly.Block,
    generator: Lua.LuaGenerator
  ) => string | [string, number];
  Javascript.javascriptGenerator.forBlock[data.title] = data.getJavascript(
    parameters
  ) as unknown as (
    block: Blockly.Block,
    generator: Javascript.JavascriptGenerator
  ) => string | [string, number];
}

function Handler(uuid: string): string {
  return "_G.helper.handler(index, '" + uuid + "')";
}

function InputEvent(uuid: string): string {
  return "_G.helper.input_event(index, '" + uuid + "')";
}

function OutputEvent(uuid: string): string {
  return "_G.helper.output_event(index, '" + uuid + "')";
}

const SetupIt = (
  category: ToolboxCategory,
  register: (parameters: unknown) => void
): ((toolbox: Toolbox, parameters: unknown) => void) => {
  const func = (toolbox: Toolbox, parameters: unknown): void => {
    toolbox.contents.push(category);
    register(parameters);
  };
  return func;
};

function Number(value: number | string): string {
  return "_G.argument.number(" + value + ")";
}

function Boolean(value: boolean | string): string {
  return "_G.argument.boolean(" + value + ")";
}

function String(value: string): string {
  return "_G.argument.string(" + value + ")";
}

function Point(value: string): string {
  return "_G.argument.point(" + value + ")";
}

function Player(type: string, value?: string): string {
  switch (type) {
    case "index":
      return "_G.argument.index_player(" + value + ")";
    case "id":
      return "_G.argument.id_player(" + value + ")";
    case "server":
      return "_G.argument.server_player()";
    case "random_client":
      return "_G.argument.random_player()";
  }
  return "_G.argument.server_player()";
}

function Anchor(key: string): string {
  return "_G.argument.anchor('" + key + "')";
}

function Range(anchor: string, radius: string | number): string {
  return "_G.argument.range(" + anchor + ", " + radius + ")";
}

// --- JS code generation helpers (migrated from helperJS.js) ---

function HandlerJS(uuid: string): string {
  return `helper.handler(index, '${uuid}')`;
}

function InputEventJS(uuid: string): string {
  return `helper.inputEvent(index, '${uuid}')`;
}

function OutputEventJS(uuid: string): string {
  return `helper.outputEvent(index, '${uuid}')`;
}

function NumberJS(value: number | string): string {
  return `argument.number(${value})`;
}

function BooleanJS(value: boolean | string): string {
  return `argument.boolean(${value})`;
}

function StringJS(value: string): string {
  return `argument.string(${value})`;
}

function PointJS(value: string): string {
  return `argument.point(${value})`;
}

function PlayerJS(type: string, value?: string): string {
  switch (type) {
    case "index":
      return `argument.indexPlayer(${value})`;
    case "id":
      return `argument.idPlayer(${value})`;
    case "server":
      return `argument.serverPlayer()`;
    case "random_client":
      return `argument.randomPlayer()`;
    default:
      return `argument.serverPlayer()`;
  }
}

function AnchorJS(key: string): string {
  return `argument.anchor('${key}')`;
}

function RangeJS(anchor: string, radius: string | number): string {
  return `argument.range(${anchor}, ${radius})`;
}

export {
  RegisterData,
  Handler,
  InputEvent,
  OutputEvent,
  SetupIt,
  Number,
  String,
  Boolean,
  Range,
  Anchor,
  Player,
  Point,
  HandlerJS,
  InputEventJS,
  OutputEventJS,
  NumberJS,
  BooleanJS,
  StringJS,
  PointJS,
  PlayerJS,
  AnchorJS,
  RangeJS,
};

export type {
  BlockDefinition,
  BlocklyBlock,
  BlocklyGenerator,
  ToolboxCategory,
  Toolbox,
};
