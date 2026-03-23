import PrototypeType from "./type";
import * as Blockly from "blockly";

const data = {
  name: "prototype_book",
};

const block = {
  title: data.name,
  type: PrototypeType.name,
  colour: PrototypeType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.PROTOTYPE_BOOK[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Book",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.phototype) {
              //console.log("resource:", resource);
              resource.phototype.forEach((item) => {
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
          options: function () {
            let opt = [["0", "0"]];
            if (this.sourceBlock_) {
              const bookUuid = this.sourceBlock_.getFieldValue("Book");
              if (bookUuid && resource && resource.phototype) {
                const book = resource.phototype.find(
                  (i) => i.uuid === bookUuid
                );
                if (book && book.data && book.data.context) {
                  try {
                    const contextObj =
                      typeof book.data.context === "string"
                        ? JSON.parse(book.data.context)
                        : book.data.context;

                    if (contextObj && contextObj.page !== undefined) {
                      const pageCount = parseInt(contextObj.page);
                      opt = [];
                      for (let i = 0; i <= pageCount + 1; i++) {
                        opt.push([i.toString(), i.toString()]);
                      }
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
  getBlock(parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
      },
    };
    return data;
  },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
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
  getLua(parameters) {
    const lua = function (block, generator) {
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
