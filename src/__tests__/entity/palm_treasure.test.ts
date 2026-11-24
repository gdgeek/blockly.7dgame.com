import { describe, expect, it } from "vitest";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import { luaGenerator } from "blockly/lua";
import { Setup } from "../../blocks/polygen";
import * as Palm from "../../blocks/palm";
import { Access } from "../../utils/Access";
import "../../localization";

describe("palm exhibit blocks", () => {
  it("serializes model selection, replacement and clearing in both languages", () => {
    window.lg = "zh-CN";
    const toolbox = { contents: [] };
    Setup(
      toolbox,
      {
        resource: {
          polygen: [
            { name: "天王", uuid: "king", animations: [] },
            { name: "法器", uuid: "prop", animations: [] },
          ],
        },
      },
      new Access({ role: "admin" }),
    );
    expect(JSON.stringify(toolbox)).not.toContain('"type":"set_palm_model"');
    Palm.Setup(toolbox, {}, true);
    expect(JSON.stringify(toolbox)).toContain('"type":"set_palm_model"');
    const w = new Blockly.Workspace();
    try {
      const set = w.newBlock("set_palm_model");
      const model = w.newBlock("polygen_entity");
      model.setFieldValue("king", "Polygen");
      set.getInput("polygen")!.connection!.connect(model.outputConnection!);
      const clear = w.newBlock("clear_palm_model");
      set.nextConnection!.connect(clear.previousConnection!);
      const saved = Blockly.serialization.workspaces.save(w);
      w.clear();
      Blockly.serialization.workspaces.load(saved, w);
      const js = javascriptGenerator.workspaceToCode(w),
        lua = luaGenerator.workspaceToCode(w);
      expect(js).toContain('point.setPalmModel(handlePolygen("king"));');
      expect(js).toContain("point.clearPalmModel();");
      expect(lua).toContain(
        '_G.point.set_palm_model(_G.helper.handler(index, "king"))',
      );
      expect(lua).toContain("_G.point.clear_palm_model()");
      for (const block of w.getAllBlocks(false)) {
        if (block.getField("HAND")) block.setFieldValue("left", "HAND");
      }
      expect(luaGenerator.workspaceToCode(w)).toContain('handler(index, "king"), "left")');
      expect(luaGenerator.workspaceToCode(w)).toContain('clear_palm_model("left")');
      expect(javascriptGenerator.workspaceToCode(w)).toContain('clearPalmModel("left")');
      expect(w.getTopBlocks(false)).toHaveLength(1);
    } finally {
      w.dispose();
    }
  });
});
