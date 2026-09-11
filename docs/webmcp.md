# WebMCP script adapter

The host registers browser WebMCP tools and calls this iframe through the existing `REQUEST` / `RESPONSE` bridge. This adapter lives in application `src/` and uses the public Blockly 13 serialization, workspace and event APIs. No Blockly dependency source is patched.

`webmcp-get-capabilities` reports protocol version 1, the active INIT generation and these actions:

- `webmcp-get-meta-script`, `webmcp-get-scene-script`
- `webmcp-validate-meta-script`, `webmcp-validate-scene-script`
- `webmcp-stage-meta-script-replace`, `webmcp-stage-scene-script-replace`
- `webmcp-complete-meta-script-replace`, `webmcp-complete-scene-script-replace`
- `webmcp-get-script-block-catalog`, `webmcp-get-script-block-structure`
- `webmcp-stage-script-block-batch`, `webmcp-complete-script-block-batch`

Every response echoes its originating request ID and host session. INIT, DESTROY and unmount invalidate outstanding responses. The bridge pins the parent origin after INIT. Existing save ACK/NACK and Ctrl/Cmd+S behavior remains active, including responses to every queued save request.

Stage operations load a separate headless workspace. A batch supports create, set_fields, set_state, move, connect, disconnect and delete. Changes include before/after details for confirmation. The workspace limit is 512 KiB, and the operation limit is 100 operations / 256 KiB, measured as UTF-8. The toolbox catalog explicitly covers static entries; dynamic variable/procedure categories are identified but not expanded.

Complete compares the complete serialized workspace version, validates the candidate again, and admits one mutation at a time. A project-owned snapshot event records a successful operation as one undo step, including variables, comments and backpack contents. A live SVG load failure restores the previous snapshot with events disabled, preserving the existing undo/redo stacks. Blockly events settle before completion is reported. A change of INIT generation suppresses the old response.

`warnings` preserve the editor's nonblocking warnings, including block references and JavaScript/Lua diagnostics. `valid` means no warnings were found. `canSave` means serialization/code generation succeeded under this adapter's validation policy; it does not assert that runtime execution or publishing will succeed. Technical generator failures block machine replacement, while existing human-save fallback behavior remains unchanged. A successful complete updates the editor draft; persistence still requires the host's normal save flow.

Regression coverage includes real WorkspaceSvg loading and rollback, one-step undo/redo, simultaneous requests, session replacement, queued-save correlation, independent generator failures, UTF-8 limits and failed batch isolation.

Adapted from gdgeek/blockly.7dgame.com PR #8 (`608c7ff`); legacy branch dependencies and unrelated block-library changes are deliberately excluded.
