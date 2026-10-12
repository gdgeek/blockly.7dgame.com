# 脚本编辑器保存状态协议

本文档描述 Blockly 13 嵌入式编辑器与主系统之间用于初始化、脏状态和保存确认的消息约定。所有新增字段都是向后兼容的；旧主系统可以继续忽略它们。

## 初始化

主系统发送 `INIT`，其 `payload.config` 支持以下状态字段：

```ts
{
  data: WorkspaceData;          // 本次真正加载的工作区，可为未保存草稿
  code?: { js?: string; lua?: string }; // 旧主系统的持久代码基线
  hostSessionId?: string;       // 主系统生成的不透明会话标识
  editingBaseline?: WorkspaceData; // 当前编辑会话缓存的规范化基线 C
  persisted?: {                // 新主系统的确认持久状态
    data?: WorkspaceData;
    code?: { js?: string; lua?: string };
  };
}
```

`config.data` 与 `config.persisted.data` 不得合并：语言切换等 iframe 重建场景会用 `data` 恢复未保存草稿，但 Blockly 必须保留服务器实际持久快照 P。未提供 `persisted` 时，为兼容旧主系统，以 `config.data` 和 `config.code` 为 P。

编辑基线 C 只包含完整工作区数据，不包含生成代码。普通首次进入时，只加载一次持久数据，在迁移、Blockly 规范化完成后序列化得到 C。无缓存 C 的草稿恢复先加载 P 建立 C，再加载草稿；与 P 完全等价的草稿按普通进入处理。有缓存 C 时直接加载 `config.data`，复用 C，不再加载原始 P 生成 C，避免旧 tween 迁移新建 shadow 时随机 ID 导致误报。

首个成功的 `update` 回传 C，主系统仅在当前编辑会话缓存，并在语言切换等 iframe 重建时通过 `editingBaseline` 原样传回；切换脚本、丢弃编辑后清空。C 是工作区数据本体，不包装为 `{ data: ... }`。初始化失败不会发布 `update`，也不允许保存部分加载的工作区。

## 更新与脏状态

Blockly 在每个稳定工作区更新后发送：

```ts
{
  type: "EVENT",
  payload: {
    event: "update",
    blocklyData: WorkspaceData,
    js: string,
    lua: string,
    dirty: boolean,             // 完整 data + 精确 JS/Lua 相对 P
    editorDirty: boolean,       // 完整 data 相对 C，用于黄点和退出保护
    editingBaseline?: WorkspaceData, // 仅首次成功 update 回传 C
    workspaceRevision: number,
    hostSessionId?: string,
    warnings: Warning[]
  }
}
```

`dirty` 表示仍需持久化的差异：完整工作区数据、精确 JS、精确 Lua 相对 P，主系统将其作为 `needsPersistence`。`editorDirty` 表示用户编辑：完整工作区数据相对 C。数据比较仅忽略 JSON 对象键顺序；保留积木和 shadow ID、坐标、数组顺序、背包以及未知扩展字段。生成代码变化不触发 `editorDirty`。

普通进入后 `editorDirty: false`，但迁移、规范化或生成代码变化可能使 `dirty: true`。初始化不自动写入；用户显式保存时持久化当前完整快照。运行、发布前若仍有持久差异，主系统提示先保存。实际草稿编辑保持 `editorDirty: true`，完全等价的草稿保持干净。后续 update 不重复发送 `editingBaseline`。

## 保存与确认

使用 `hostSessionId` 时，Blockly 捕获 Ctrl/Cmd+S 后发送 `EVENT { event: "save-request", hostSessionId }`，由当前主系统编辑器调用其统一保存入口并发送带 `requestId`、`hostSessionId` 的真实 `REQUEST`。插件不直接伪造本地 REQUEST，避免无关联 RESPONSE 被错误的 KeepAlive 页面消费。旧主系统未传 `hostSessionId` 时暂时保留原有本地保存路径，以支持 Blockly 先行发布时的滚动升级。

无变化时 `RESPONSE` 仍使用 `action: "save", noChange: true`，并额外返回本次实际比较的完整 `data/js/lua`、`dirty: false`、`editorDirty: false`、`workspaceRevision` 和可选 `hostSessionId`。这份快照已与 P 完全相等，插件和主系统都以该快照重设 C。主系统只能用该快照重新校准相同请求，不能用它覆盖请求发出后产生的新编辑。

有变化时沿用 `saveId` 和完整快照。主系统持久化成功后发送 `SAVE_ACK { saveId, hostSessionId? }`；失败时发送 `SAVE_NACK`。启用了 `hostSessionId` 的新主系统必须在 ACK/NACK 中回传同一标识；只有匹配当前会话和待确认 `saveId` 的 ACK 才以实际提交快照推进 P 和 C。保存请求进行期间继续编辑时，ACK 只确认旧快照，后续更新仍按新内容计算 `dirty` 和 `editorDirty`。NACK、超时和旧 ACK 不推进任何基线。

当 `hostSessionId` 存在时，Blockly 会在 `EVENT` 和 `RESPONSE` 中原样回显，并拒绝来自其他会话的 `REQUEST`、`SAVE_ACK` 和 `SAVE_NACK`。旧主系统不传会话标识时保持原行为。

## 校验策略

内容结构、JavaScript/Lua 语法等校验结果继续作为 warning 展示并允许保存。仅工作区无法读取、序列化失败或生成器发生且没有安全历史代码回退等技术故障返回 `save-error`。本协议不改变该产品策略。
