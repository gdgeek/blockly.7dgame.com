declare module "@mit-app-inventor/blockly-plugin-workspace-multiselect" {
  import type * as Blockly from "blockly/core";

  interface MultiselectOptions {
    useDoubleClick?: boolean;
    bumpNeighbours?: boolean;
    multiFieldUpdate?: boolean;
    workspaceAutoFocus?: boolean;
    multiSelectKeys?: string[];
    multiselectCopyPaste?: {
      crossTab?: boolean;
      menu?: boolean;
    };
    multiselectIcon?: {
      hideIcon?: boolean;
      weight?: number;
      enabledIcon?: string;
      disabledIcon?: string;
    };
  }

  export class Multiselect {
    constructor(workspace: Blockly.WorkspaceSvg);
    init(options: MultiselectOptions): void;
    dispose(keepRegistry?: boolean): void;
    setMultiselectIcon(enabledIcon: string, disabledIcon: string): void;
    static withoutMultiFieldUpdates(callback: () => void): void;
  }

  export const dragSelectionWeakMap: WeakMap<
    Blockly.WorkspaceSvg,
    Set<string>
  >;
  export const inMultipleSelectionModeWeakMap: WeakMap<
    Blockly.WorkspaceSvg,
    boolean
  >;
}
