# 脚本编辑器保存状态协议

本文档描述 Blockly 13 嵌入式编辑器与主系统之间用于初始化、脏状态和保存确认的消息约定。所有新增字段都是向后兼容的；旧主系统可以继续忽略它们。

## 初始化

主系统发送 `INIT`，其 `payload.config` 支持以下状态字段：

```ts
{
  data: WorkspaceData;          // 本次真正加载的工作区，可为未保存草稿
  code?: { js?: string; lua?: string }; // 旧主系统的持久代码基线
  hostSessionId?: string;       // 主系统生成的不透明会话标识
  persisted?: {                // 新主系统的确认持久状态
    data?: WorkspaceData;
    code?: { js?: string; lua?: string };
  };
}
```

`config.data` 与 `config.persisted.data` 不得合并：语言切换等 iframe 重建场景会用 `data` 恢复未保存草稿，但 Blockly 必须继续相对 `persisted` 计算脏状态。未提供 `persisted` 时，Blockly 为兼容旧主系统，仍以 `config.data` 和 `config.code` 为持久基线。

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
    dirty: boolean,
    workspaceRevision: number,
    hostSessionId?: string,
    warnings: Warning[]
  }
}
```

`dirty` 始终相对最近一次由 `INIT.persisted` 或匹配 `SAVE_ACK` 确认的基线计算。首次 INIT 更新也遵循该规则：加载持久数据时为 `false`，加载草稿时为 `true`。

## 保存与确认

使用 `hostSessionId` 时，Blockly 捕获 Ctrl/Cmd+S 后发送 `EVENT { event: "save-request", hostSessionId }`，由当前主系统编辑器调用其统一保存入口并发送带 `requestId`、`hostSessionId` 的真实 `REQUEST`。插件不直接伪造本地 REQUEST，避免无关联 RESPONSE 被错误的 KeepAlive 页面消费。旧主系统未传 `hostSessionId` 时暂时保留原有本地保存路径，以支持 Blockly 先行发布时的滚动升级。

无变化时 `RESPONSE` 仍使用 `action: "save", noChange: true`，并额外返回本次实际比较的完整 `data/js/lua`、`dirty: false`、`workspaceRevision` 和可选 `hostSessionId`。主系统只能用该快照重新校准相同请求，不能用它覆盖请求发出后产生的新编辑。

有变化时沿用 `saveId` 和完整快照。主系统持久化成功后发送 `SAVE_ACK { saveId, hostSessionId? }`；失败时发送 `SAVE_NACK`。启用了 `hostSessionId` 的新主系统必须在 ACK/NACK 中回传同一标识；只有匹配当前会话和待确认 `saveId` 的 ACK 才推进持久基线。保存请求进行期间继续编辑时，ACK 只确认旧快照，后续更新仍为 `dirty: true`。

当 `hostSessionId` 存在时，Blockly 会在 `EVENT` 和 `RESPONSE` 中原样回显，并拒绝来自其他会话的 `REQUEST`、`SAVE_ACK` 和 `SAVE_NACK`。旧主系统不传会话标识时保持原行为。

## 校验策略

内容结构、JavaScript/Lua 语法等校验结果继续作为 warning 展示并允许保存。仅工作区无法读取、序列化失败或生成器发生且没有安全历史代码回退等技术故障返回 `save-error`。本协议不改变该产品策略。
