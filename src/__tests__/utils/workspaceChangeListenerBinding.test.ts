import { describe, expect, it, vi } from "vitest";
import type * as Blockly from "blockly";
import { createWorkspaceChangeListenerBinding } from "@/utils/workspaceChangeListenerBinding";

const createWorkspace = () => ({
  addChangeListener: vi.fn(),
  removeChangeListener: vi.fn(),
});

describe("createWorkspaceChangeListenerBinding", () => {
  it("does not duplicate a listener when the same workspace is attached again", () => {
    const listener = vi.fn();
    const workspace = createWorkspace();
    const binding = createWorkspaceChangeListenerBinding(listener);

    binding.attach(workspace as unknown as Blockly.Workspace);
    binding.attach(workspace as unknown as Blockly.Workspace);

    expect(workspace.addChangeListener).toHaveBeenCalledOnce();
    expect(workspace.removeChangeListener).not.toHaveBeenCalled();
  });

  it("detaches the old workspace before attaching a replacement", () => {
    const listener = vi.fn();
    const first = createWorkspace();
    const second = createWorkspace();
    const binding = createWorkspaceChangeListenerBinding(listener);

    binding.attach(first as unknown as Blockly.Workspace);
    binding.attach(second as unknown as Blockly.Workspace);

    expect(first.removeChangeListener).toHaveBeenCalledWith(listener);
    expect(second.addChangeListener).toHaveBeenCalledWith(listener);
  });

  it("makes repeated teardown safe", () => {
    const listener = vi.fn();
    const workspace = createWorkspace();
    const binding = createWorkspaceChangeListenerBinding(listener);

    binding.attach(workspace as unknown as Blockly.Workspace);
    binding.detach();
    binding.detach();

    expect(workspace.removeChangeListener).toHaveBeenCalledOnce();
    expect(binding.current).toBeNull();
  });
});
