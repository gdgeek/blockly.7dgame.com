import PrototypeType from "./type";
import * as Blockly from "blockly";
import type { BlockDefinition, BlocklyBlock, BlocklyGenerator } from "../helper";

const data = {
  name: "prototype_book",
} as const;

interface PrototypeItem {
  name?: string;
  uuid: string;
  data?: {
    type?: string;
    context?: string | { page?: number | string };
  };
}

interface BlockParameters {
  resource?: {
    phototype?: PrototypeItem[];
  };
}

interface DropdownFieldThis {
  sourceBlock_?: {
    getFieldValue: (name: string) => string;
  };
}

const block: BlockDefinition = {
  title: data.name,
  type: PrototypeType.name,
  colour: PrototypeType.colour,
  getBlockJson(parameters: unknown): object {
    const { resource } = parameters as BlockParameters;
    const Msg = Blockly.Msg as unknown as Record<string, Record<string, string>>;
    const json = {
      type: data.name,
      message0: Msg["PROTOTYPE_BOOK"][window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Book",
          options: function (): [string, string][] {
            const opt: [string, string][] = [["none", ""]];
            if (resource && resource.phototype) {
              resource.phototype.forEach((item: PrototypeItem) => {
                if (item.data && item.data.type === "book") {
                  opt.push([item.name || item.uuid, item.uuid]);
                }
              });
            }
            return opt;
          },
        },
        {
          type: "field_dropdown",
          name: "Page",
          options: function (this: DropdownFieldThis): [string, string][] {
            const opt: [string, string][] = [["0", "0"]];
            if (this.sourceBlock_) {
              const bookUuid = this.sourceBlock_.getFieldValue("Book");
              if (bookUuid && resource && resource.phototype) {
                const book = resource.phototype.find(
                  (i: PrototypeItem) => i.uuid === bookUuid
                );
                if (book && book.data && book.data.context) {
                  try {
                    const contextObj =
                      typeof book.data.context === "string"
                        ? JSON.parse(book.data.context)
                        : book.data.context;

                    if (contextObj && contextObj.page !== undefined) {
                      const pageCount = parseInt(String(contextObj.page));
                      const pages: [string, string][] = [];
                      for (let i = 0; i <= pageCount + 1; i++) {
                        pages.push([i.toString(), i.toString()]);
                      }
                      return pages;
                    }
                  } catch (e) {
                    console.error(
                      "Failed to parse book context for Page options",
                      e
                    );
                  }
                }
              }
            }
            return opt;
          },
        },
        {
          type: "input_dummy",
        },
        {
          type: "input_statement",
          name: "content",
        },
      ],
      colour: PrototypeType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock(parameters: unknown): object {
    const blockDef = {
      init: function (this: { jsonInit: (json: object) => void }) {
        const json = block.getBlockJson!(parameters);
        this.jsonInit(json);
      },
    };
    return blockDef;
  },
  getJavascript(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const javascript = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const book_uuid = block.getFieldValue("Book");
      const page_value = block.getFieldValue("Page");
      const statements_content = generator.statementToCode(block, "content");
      const code = `
meta['@${book_uuid}${page_value}'] = async function(parameter) {
  let isPlaying = true;
  console.log('');
  ${statements_content}
  isPlaying = false;
};
`;
      return code;
    };
    return javascript;
  },
  getLua(_parameters: unknown): (block: BlocklyBlock, generator: BlocklyGenerator) => string {
    const lua = function (block: BlocklyBlock, generator: BlocklyGenerator): string {
      const book_uuid = block.getFieldValue("Book");
      const page_value = block.getFieldValue("Page");
      const statements_content = generator.statementToCode(block, "content");
      const code = `
meta['@${book_uuid}${page_value}'] = function(parameter)
  is_playing = true
  print('')
${statements_content}
  is_playing = false
end
`;
      return code;
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
