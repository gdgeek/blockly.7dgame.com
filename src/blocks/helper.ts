import * as Blockly from "blockly";
import * as Lua from "blockly/lua";
import * as Javascript from "blockly/javascript";

interface BlockDefinition {
  title: string;
  getBlock: (parameters: unknown) => object;
  getJavascript: (parameters: unknown) => (block: object, generator: object) => unknown;
  getLua: (parameters: unknown) => (block: object, generator: object) => unknown;
}

interface ToolboxCategory {
  kind: string;
  name: string;
  contents?: unknown[];
  [key: string]: unknown;
}

interface Toolbox {
  contents: ToolboxCategory[];
}

function RegisterData(data: BlockDefinition, parameters: unknown): void {
  Blockly.Blocks[data.title] = data.getBlock(parameters);
  Lua.luaGenerator.forBlock[data.title] = data.getLua(parameters);
  Javascript.javascriptGenerator.forBlock[data.title] =
    data.getJavascript(parameters);
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
};

export type { BlockDefinition, ToolboxCategory, Toolbox };
