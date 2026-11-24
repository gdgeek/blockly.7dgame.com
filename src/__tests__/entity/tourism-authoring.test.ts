import * as Blockly from "blockly";
import { describe, expect, it } from "vitest";
import { setup } from "../../custom";
import { Access, ROLES } from "../../utils/Access";
import "../../localization";

describe("tourism authoring visibility", () => {
  it.each(Object.values(ROLES))("filters the toolbox for %s", (role) => {
    window.lg = "zh-CN";
    const toolbox = JSON.stringify(setup("base-meta", {}, new Access({ role })));
    const allowed = role === ROLES.ADMIN || role === ROLES.ROOT;
    for (const block of ["play_particle", "set_palm_model", "clear_palm_model", "show_subtitle", "hide_subtitle", "subtitle_display_mode"]) {
      expect(toolbox.includes(`"type":"${block}"`)).toBe(allowed);
    }
    for (const block of ["visual_execute", "play_sound", "play_video"]) {
      expect(toolbox).toContain(`"type":"${block}"`);
    }
    const workspace = new Blockly.Workspace();
    try {
      const visibility = workspace.newBlock("visual_execute");
      expect(visibility.getInput("EFFECT_SETTINGS")?.isVisible()).toBe(allowed);
      visibility.setFieldValue("dissolve", "EFFECT");
      expect(visibility.getFieldValue("EFFECT")).toBe("dissolve");
      for (const type of ["play_particle", "set_palm_model", "show_subtitle"]) {
        expect(workspace.newBlock(type).type).toBe(type);
      }
    } finally {
      workspace.dispose();
    }
  });
});
