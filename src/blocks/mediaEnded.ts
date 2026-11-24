import type { BlockDefinition } from "./helper";

interface MediaResource {
  name: string;
  uuid: string;
}

interface MediaParameters {
  resource?: Partial<Record<"sound" | "video", MediaResource[]>>;
}

export function mediaEnded(
  kind: "sound" | "video",
  category: { name: string; colour: number },
  label: string,
): BlockDefinition {
  const type = kind + "_ended";
  const eventKey = (uuid: string) => JSON.stringify("@" + kind + "-ended:" + uuid);

  return {
    title: type,
    type: category.name,
    colour: category.colour,
    toolbox: { kind: "block", type },
    getBlock(parameters) {
      const resources = (parameters as MediaParameters).resource?.[kind] ?? [];
      return {
        init(this: { jsonInit(json: object): void }) {
          this.jsonInit({
            type,
            colour: category.colour,
            message0: `当${label} %1 自然播放结束时 %2 %3`,
            args0: [
              {
                type: "field_dropdown",
                name: category.name,
                options: resources.length
                  ? resources.map(resource => [resource.name, resource.uuid])
                  : [[`请选择${label}`, ""]],
              },
              { type: "input_dummy" },
              { type: "input_statement", name: "content" },
            ],
          });
        },
      };
    },
    getJavascript: () => (block, generator) => {
      const key = eventKey(block.getFieldValue(category.name));
      return `meta[${key}] = async function(parameter) {\n${generator.statementToCode(block, "content")}};\n`;
    },
    getLua: () => (block, generator) => {
      const key = eventKey(block.getFieldValue(category.name));
      return `meta[${key}] = function(parameter)\n  is_playing = true\n${generator.statementToCode(block, "content")}  is_playing = false\nend\n`;
    },
  };
}
