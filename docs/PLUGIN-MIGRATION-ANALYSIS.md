# Blockly 编辑器迁移至插件系统 — 可行性分析与迁移方案

> 分析 `plugins/blockly.7dgame.com/` 迁移到主系统插件框架（PluginLayout + iframe + postMessage）的可行性，并给出详细迁移步骤。

---

## 1. 现状分析

### 1.1 Blockly 当前集成方式

Blockly 目前**已经是 iframe 嵌入**，但走的是**独立的 postMessage 协议**，不经过插件系统：

```
主系统 web/
├── useScriptEditorBase.ts    ← 管理 blockly iframe 通信
├── ScriptEditorModal.vue     ← verse 场景脚本编辑器（弹窗）
├── MetaScriptEditorModal.vue ← meta 场景脚本编辑器（弹窗）
└── meta/script.vue           ← meta 脚本页面（内嵌）

iframe src = env.blockly + "?language=zh-CN&v=xxx"
             ↓
plugins/blockly.7dgame.com/   ← 独立 Vue 3 应用
```

**关键特征：**

| 特征 | 当前状态 |
|------|---------|
| 加载方式 | iframe，URL 由 `VITE_APP_BLOCKLY_URL` 环境变量配置 |
| 消息协议 | 自定义 `{ action, data, from }` 格式 |
| 消息来源标识 | `from: "script.meta.web"` / `from: "script.verse.web"` |
| 认证方式 | 无 Token 传递，通过 `user-info` action 传递 `{ id, role }` |
| 触发场景 | 编辑 meta/verse 脚本时弹出，不是侧边栏菜单项 |
| 后端 API | 无独立后端，不直接调用任何 API |
| 权限控制 | 通过 `Access` 类基于角色控制 toolbox 可见性 |
| 主题 | 跟随系统 `prefers-color-scheme`，不接收主系统主题 |
| 国际化 | 从 URL `?language=` 参数读取 |
| Docker | 有 Dockerfile，但未纳入 docker-compose |

### 1.2 Blockly 消息协议（现有）

| 消息 | 方向 | 格式 | 说明 |
|------|------|------|------|
| `ready` | blockly→主 | `{ action: "ready", from: "script.blockly" }` | 编辑器就绪 |
| `init` | 主→blockly | `{ action: "init", data: { style, parameters, data } }` | 初始化工作区 |
| `user-info` | 主→blockly | `{ action: "user-info", data: { id, role } }` | 传递用户信息 |
| `save` | 主→blockly | `{ action: "save" }` | 请求保存 |
| `post` | blockly→主 | `{ action: "post", data: { js, lua, data } }` | 返回保存数据 |
| `post:no-change` | blockly→主 | `{ action: "post:no-change" }` | 无变更 |
| `update` | blockly→主 | `{ action: "update", data: { lua, js, blocklyData } }` | 实时更新代码 |
| `error` | blockly→主 | `{ action: "error", data: { message } }` | 错误通知 |

### 1.3 插件系统消息协议（目标）

| 消息 | 方向 | 格式 |
|------|------|------|
| `INIT` | 主→插件 | `{ type: "INIT", payload: { token, config } }` |
| `PLUGIN_READY` | 插件→主 | `{ type: "PLUGIN_READY" }` |
| `TOKEN_UPDATE` | 主→插件 | `{ type: "TOKEN_UPDATE", payload: { token } }` |
| `THEME_CHANGE` | 主→插件 | `{ type: "THEME_CHANGE", payload: { theme } }` |
| `DESTROY` | 主→插件 | `{ type: "DESTROY" }` |

---

## 2. 核心结论：不适合迁移到插件系统

### 2.1 根本原因：使用场景完全不同

| 维度 | 插件系统（user-management 等） | Blockly 编辑器 |
|------|-------------------------------|---------------|
| 入口 | 侧边栏菜单 → 独立页面 | 编辑 meta/verse 脚本时弹出 |
| 生命周期 | 长期运行，用户主动导航 | 短期使用，编辑完关闭 |
| 数据流 | 插件自己调 API 读写数据 | 主系统传入数据 → 编辑 → 返回结果 |
| 通信模式 | 单向初始化（INIT → READY） | 双向频繁交互（init/save/update/post） |
| 认证需求 | 需要 JWT Token 调用后端 API | 不调用任何 API，无需 Token |
| 权限模型 | `plugin_permission_config` 表 | 基于角色的 toolbox 过滤 |
| 实例数 | 全局单例 | 可能同时打开多个（meta + verse） |

### 2.2 技术冲突

1. **消息协议不兼容**：插件系统用 `{ type, payload }` 格式，Blockly 用 `{ action, data, from }` 格式。如果迁移，主系统的 `useScriptEditorBase.ts` 需要大幅重写。

2. **PluginLayout 不适用**：PluginLayout 是为侧边栏导航的独立页面设计的，Blockly 是嵌入在 ScriptEditorModal 弹窗中的编辑器组件。

3. **数据流方向相反**：插件系统中，插件自己获取数据；Blockly 的数据由主系统推送（`init` action 携带 workspace 数据），编辑后返回。

4. **无后端 API 需求**：Blockly 不需要 Token、不需要 nginx 反向代理、不需要权限 API。插件系统的核心基础设施对它毫无用处。

5. **iframe sandbox 限制**：插件系统的 iframe 有 `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"`。Blockly 需要大量 DOM 操作（SVG 渲染、拖拽、弹出菜单），虽然 `allow-same-origin` + `allow-scripts` 理论上够用，但增加了不必要的复杂度。

---

## 3. 推荐方案：保持现有架构，做针对性优化

Blockly 当前的集成方式（独立 iframe + 自定义 postMessage）是合理的，因为它本质上是一个**嵌入式编辑器组件**，不是一个**独立的管理工具**。

### 3.1 可以借鉴插件系统的部分

虽然不适合整体迁移，但以下模式可以借鉴：

| 可借鉴的模式 | 当前状态 | 建议 |
|-------------|---------|------|
| 主题同步 | 跟随系统 `prefers-color-scheme` | 可改为接收主系统 `THEME_CHANGE` 消息 |
| Docker 部署 | 有 Dockerfile 但未纳入 compose | 可参照插件的 Dockerfile 模式优化 |
| nginx 反向代理 | 无 | 不需要（无后端 API） |
| Token 传递 | 无 | 不需要（不调用 API） |
| 权限系统 | 自有 Access 类 | 保持现有方式即可 |

### 3.2 具体优化建议

#### A. 主题同步改进

当前 Blockly 只跟随浏览器的 `prefers-color-scheme`，不跟随主系统的主题切换。可以在 `useScriptEditorBase.ts` 中增加主题消息推送：

```typescript
// useScriptEditorBase.ts 中，监听主题变化时通知 blockly
watch(isDark, (newValue) => {
  postMessage('theme-change', { dark: newValue })
})
```

```typescript
// blockly 的 useMessageBridge.ts 中增加处理
onAction('theme-change', (data) => {
  // 切换 Blockly workspace 主题
})
```

#### B. Docker 部署优化

参照 user-management 的 Dockerfile 模式，添加 nginx.conf.template 和健康检查：

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install pnpm -g && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN echo "{\"status\":\"ok\"}" > /usr/share/nginx/html/health.json
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### C. 纳入 docker-compose

```yaml
# driver/docker-compose.yml
xrugc-blockly:
  build: ../plugins/blockly.7dgame.com
  container_name: xrugc-blockly
  ports:
    - "3000:80"
  networks:
    - xrugc-network
```

---

## 4. 嵌入式迁移方案：消息协议标准化

> 目标：不加侧边栏入口，不走 PluginLayout，仅将 Blockly 的消息协议从 `{ action, data, from }` 统一到插件系统的 `{ type, id, payload }` 格式。保持嵌入式编辑器的使用方式不变。

### 4.1 迁移范围

**不变的部分：**
- Blockly 仍然只在 ScriptEditorModal / MetaScriptEditorModal 弹窗中使用
- 不注册到 `plugins.json`，不出现在侧边栏
- 不需要 Token 传递（Blockly 不调用后端 API）
- 不需要 nginx 反向代理
- 不需要 `plugin_permission_config` 权限表
- 不需要 vue-router（单页面编辑器）

**要改的部分：**
- 消息格式：`{ action, data, from }` → `{ type, id, payload }`
- 主题同步：从 `prefers-color-scheme` → 接收主系统推送
- 用户信息传递：从独立 `user-info` action → 合并到 `INIT` payload

### 4.2 新消息协议设计

将现有的 Blockly 专用消息映射到标准 `{ type, id, payload }` 格式，同时保留 Blockly 特有的编辑器交互消息：

| 旧消息 | 新消息 | 方向 | payload |
|--------|--------|------|---------|
| `{ action: "ready", from: "script.blockly" }` | `{ type: "PLUGIN_READY" }` | blockly→主 | 无 |
| `{ action: "init", data: { style, parameters, data } }` | `{ type: "EDITOR_INIT", payload: { style, parameters, data, userInfo } }` | 主→blockly | 合并 user-info |
| `{ action: "user-info", data: { id, role } }` | _(合并到 EDITOR_INIT)_ | — | — |
| `{ action: "save" }` | `{ type: "EDITOR_SAVE" }` | 主→blockly | 无 |
| `{ action: "post", data: { js, lua, data } }` | `{ type: "EDITOR_POST", payload: { js, lua, data } }` | blockly→主 | 保持不变 |
| `{ action: "post:no-change" }` | `{ type: "EDITOR_POST_NO_CHANGE" }` | blockly→主 | 无 |
| `{ action: "update", data: { lua, js, blocklyData } }` | `{ type: "EDITOR_UPDATE", payload: { lua, js, blocklyData } }` | blockly→主 | 保持不变 |
| `{ action: "error", data: { message } }` | `{ type: "EDITOR_ERROR", payload: { message } }` | blockly→主 | 保持不变 |
| _(无)_ | `{ type: "THEME_CHANGE", payload: { theme, dark } }` | 主→blockly | 新增 |
| _(无)_ | `{ type: "DESTROY" }` | 主→blockly | 新增 |

**命名规则：**
- 插件系统通用消息：`PLUGIN_READY`、`THEME_CHANGE`、`DESTROY`（与其他插件一致）
- Blockly 编辑器专用消息：`EDITOR_*` 前缀（区分于通用插件消息）

### 4.3 逐文件改造方案

---

#### 文件 1：`plugins/blockly.7dgame.com/src/composables/useMessageBridge.ts`

**改造目标：** 消息格式从 `{ action, data, from }` 切换到 `{ type, id, payload }`

```typescript
// ===== 改造前 =====
// 发送
window.parent.postMessage({ action, data, from: 'script.blockly' }, '*')
// 接收过滤
if (!message.action || !message.from) return
if (!ALLOWED_ORIGINS.includes(message.from)) return
const handler = handlers.get(message.action)

// ===== 改造后 =====
// 发送
window.parent.postMessage({
  type,
  id: `blockly-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  payload
}, '*')

// 接收过滤
if (!message.type) return
// 只接受来自 parent 的消息
if (event.source !== window.parent) return
const handler = handlers.get(message.type)
if (handler) handler(message.payload)
```

**完整改造后代码：**

```typescript
import { onMounted, onBeforeUnmount } from 'vue'

export type MessageType =
  | 'EDITOR_INIT'      // 主→blockly：初始化工作区
  | 'EDITOR_SAVE'      // 主→blockly：请求保存
  | 'THEME_CHANGE'     // 主→blockly：主题切换
  | 'DESTROY'          // 主→blockly：即将销毁

export type ActionHandler = (payload: unknown) => void

let msgCounter = 0
const genId = () => `blockly-${Date.now()}-${++msgCounter}`

export function useMessageBridge() {
  const handlers = new Map<string, ActionHandler>()

  // ── 发送 ──
  const postMessage = (type: string, payload: Record<string, unknown> = {}) => {
    window.parent.postMessage({ type, id: genId(), payload }, '*')
  }

  // ── 注册处理器 ──
  const onMessage = (type: string, handler: ActionHandler) => {
    handlers.set(type, handler)
  }

  // ── 接收 ──
  const handleMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return
    const msg = event.data
    if (!msg || !msg.type) return

    const handler = handlers.get(msg.type)
    if (handler) handler(msg.payload)
  }

  // ── Ctrl+S ──
  const handleSaveShortcut = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key?.toLowerCase() === 's') {
      event.preventDefault()
      handlers.get('EDITOR_SAVE')?.(undefined)
    }
  }

  // ── 生命周期 ──
  onMounted(() => {
    window.addEventListener('message', handleMessage)
    window.addEventListener('keydown', handleSaveShortcut)
    postMessage('PLUGIN_READY')
  })

  onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage)
    window.removeEventListener('keydown', handleSaveShortcut)
  })

  return { postMessage, onMessage }
}
```

**注意事项：**
- `onAction` 重命名为 `onMessage`，参数从 `action` 改为 `type`
- 去掉 `ALLOWED_ORIGINS` / `MESSAGE_SOURCE` 常量，改用 `event.source !== window.parent` 过滤
- `postMessage('ready')` → `postMessage('PLUGIN_READY')`

---

#### 文件 2：`plugins/blockly.7dgame.com/src/App.vue`

**改造目标：** 适配新消息类型名，合并 `init` + `user-info` 为 `EDITOR_INIT`

```typescript
// ===== 改造前 =====
onAction('init', (data) => {
  initPayload.value = data as InitPayload
  tryInit()
})
onAction('user-info', (data) => {
  userInfo.value = data as UserInfo
  isUserInfoReady.value = true
  tryInit()
})
onAction('save', (data) => { save(data) })

// ===== 改造后 =====
// EDITOR_INIT 同时携带 workspace 数据和 userInfo，不再需要 tryInit 两步等待
onMessage('EDITOR_INIT', (payload) => {
  const p = payload as EditorInitPayload
  userInfo.value = p.userInfo ?? { id: '', role: '' }
  doInit({ style: p.style, parameters: p.parameters, data: p.data })
})
onMessage('EDITOR_SAVE', () => { save(undefined) })
onMessage('THEME_CHANGE', (payload) => {
  // 切换 Blockly workspace 主题（见文件 3）
})
onMessage('DESTROY', () => {
  // 清理资源（可选）
})
```

**关键变化：**
- 删除 `initPayload` / `isUserInfoReady` / `tryInit` 三段式等待逻辑
- `EDITOR_INIT` 一次性传入所有数据，`doInit` 直接执行
- 新增 `THEME_CHANGE` 和 `DESTROY` 处理

**发送消息也要改：**

```typescript
// ===== 改造前 =====
postMessage('post', { js, lua, data })
postMessage('post:no-change')
postMessage('update', { lua, js, blocklyData })
postMessage('error', { message: '...' })

// ===== 改造后 =====
postMessage('EDITOR_POST', { js, lua, data })
postMessage('EDITOR_POST_NO_CHANGE')
postMessage('EDITOR_UPDATE', { lua, js, blocklyData })
postMessage('EDITOR_ERROR', { message: '...' })
```

**新的 payload 类型定义：**

```typescript
interface EditorInitPayload {
  style: string
  parameters: unknown
  data: unknown
  userInfo: { id: string; role: string }
}
```

---

#### 文件 3：`plugins/blockly.7dgame.com/src/composables/useTheme.ts`

**改造目标：** 除了跟随系统 `prefers-color-scheme`，还接收主系统推送的主题

当前 useTheme 只监听浏览器的 `prefers-color-scheme`。改造后增加一个 `setDark(dark: boolean)` 方法，供 App.vue 在收到 `THEME_CHANGE` 时调用：

```typescript
// 新增导出
const forcedDark = ref<boolean | null>(null)  // null = 跟随系统

const isDark = computed(() =>
  forcedDark.value !== null ? forcedDark.value : mql.matches
)

const setDark = (dark: boolean) => {
  forcedDark.value = dark
}

// watchTheme 改为响应 isDark
const watchTheme = (workspace: Blockly.WorkspaceSvg) => {
  // 监听系统变化
  const sysHandler = () => {
    if (forcedDark.value === null) {
      workspace.setTheme(isDark.value ? DarkTheme : LightTheme)
    }
  }
  mql.addEventListener('change', sysHandler)

  // 监听 forcedDark 变化
  watch(isDark, (dark) => {
    workspace.setTheme(dark ? DarkTheme : LightTheme)
  })

  return () => mql.removeEventListener('change', sysHandler)
}

return { getTheme, watchTheme, setDark, isDark }
```

**App.vue 中使用：**

```typescript
import { useTheme } from './composables/useTheme'
const { setDark } = useTheme()

onMessage('THEME_CHANGE', (payload) => {
  const p = payload as { theme: string; dark: boolean }
  setDark(p.dark)
})
```

---

#### 文件 4：`web/src/composables/useScriptEditorBase.ts`

**改造目标：** 发送和接收消息格式从 `{ action, data, from }` 切换到 `{ type, id, payload }`

**4a. 发送消息改造：**

```typescript
// ===== 改造前 =====
const postMessage = (action: string, data: unknown = {}) => {
  editor.value.contentWindow.postMessage(
    { from: options.from, action, data: safeClone(data) },
    '*'
  )
}

// ===== 改造后 =====
let msgCounter = 0
const genId = () => `editor-${Date.now()}-${++msgCounter}`

const postMessage = (type: string, payload: unknown = {}) => {
  editor.value.contentWindow.postMessage(
    { type, id: genId(), payload: safeClone(payload) },
    '*'
  )
}
```

**4b. 发送调用点改造：**

```typescript
// ready 回调中发送 EDITOR_INIT（合并原来的 init + user-info）
// ===== 改造前 =====
// handleMessage 中：
if (params.action === 'ready') {
  ready = true
  options.onReady()
  postMessage('user-info', { id: userStore.userInfo?.id, role: userStore.getRole() })
}
// 然后在 onReady 回调（各页面的 initEditor）中：
postMessage('init', { style, parameters, data, language: ['lua', 'js'] })

// ===== 改造后 =====
// handleMessage 中：
if (msg.type === 'PLUGIN_READY') {
  ready = true
  // 不在这里发 user-info，等 onReady 回调中一次性发 EDITOR_INIT
  options.onReady()
}
// 然后在 onReady 回调中：
postMessage('EDITOR_INIT', {
  style, parameters, data,
  userInfo: { id: userStore.userInfo?.id, role: userStore.getRole() }
})
```

**4c. 接收消息改造：**

```typescript
// ===== 改造前 =====
const handleMessage = async (e: MessageEvent) => {
  const params = e.data as EditorEventPayload
  if (!params || !params.action) return

  if (params.action === 'ready') { ... }
  else if (params.action === 'post') { ... }
  else if (params.action === 'post:no-change') { ... }
  else if (params.action === 'update') { ... }
}

// ===== 改造后 =====
const handleMessage = async (e: MessageEvent) => {
  const msg = e.data
  if (!msg || !msg.type) return

  if (msg.type === 'PLUGIN_READY') { ... }
  else if (msg.type === 'EDITOR_POST') {
    const payload = msg.payload as EditorPostPayload
    // ... 原 post 逻辑，把 params.data 替换为 msg.payload
  }
  else if (msg.type === 'EDITOR_POST_NO_CHANGE') { ... }
  else if (msg.type === 'EDITOR_UPDATE') {
    const payload = msg.payload as EditorUpdatePayload
    // ... 原 update 逻辑
  }
  else if (msg.type === 'EDITOR_ERROR') {
    // 新增：处理 blockly 报错
  }
}
```

**4d. 新增主题推送：**

```typescript
// 监听主题变化，推送给 blockly
watch(isDark, (dark) => {
  postMessage('THEME_CHANGE', {
    theme: settingsStore.theme,
    dark
  })
})
```

**4e. 新增 DESTROY 推送：**

```typescript
// onBeforeUnmount 中通知 blockly 清理
onBeforeUnmount(() => {
  postMessage('DESTROY')
  // ... 原有清理逻辑
})
```

**4f. save 调用改造：**

```typescript
// ===== 改造前 =====
postMessage('save', { language: ['lua', 'js'], data: {} })

// ===== 改造后 =====
postMessage('EDITOR_SAVE')
```

**4g. userInfo watcher 改造：**

```typescript
// ===== 改造前 =====
watch(() => userStore.userInfo, () => {
  postMessage('user-info', { id: userStore.userInfo?.id, role: userStore.getRole() })
}, { deep: true })

// ===== 改造后 =====
// 删除这个 watcher。userInfo 已合并到 EDITOR_INIT 中。
// 如果需要运行时更新角色，可新增 EDITOR_USER_UPDATE 消息，但通常不需要。
```

---

#### 文件 5/6/7：ScriptEditorModal.vue / MetaScriptEditorModal.vue / meta/script.vue

这三个文件**不需要直接修改消息格式**，因为它们都通过 `useScriptEditorBase` 的 `postMessage` 和 `handleMessage` 间接通信。

唯一需要改的是各自的 `initEditor` / `onReady` 回调中，`postMessage` 的调用参数：

```typescript
// ===== 改造前（以 ScriptEditorModal.vue 为例）=====
postMessage('init', {
  language: ['lua', 'js'],
  style: verse.value.style,
  parameters: verse.value.parameters,
  data: JSON.parse(blocklyData)
})

// ===== 改造后 =====
postMessage('EDITOR_INIT', {
  style: verse.value.style,
  parameters: verse.value.parameters,
  data: JSON.parse(blocklyData),
  userInfo: {
    id: userStore.userInfo?.id || null,
    role: userStore.getRole()
  }
})
```

三个文件的改动模式完全一致，只是数据来源不同（verse vs meta）。

---

### 4.4 迁移顺序（建议）

```
Phase 1: Blockly 侧先改（可独立测试）
  ├── Step 1: useMessageBridge.ts — 新协议格式
  ├── Step 2: App.vue — 适配新消息类型
  └── Step 3: useTheme.ts — 增加 setDark

Phase 2: 主系统侧改（需要联调）
  ├── Step 4: useScriptEditorBase.ts — 核心协议切换
  ├── Step 5: ScriptEditorModal.vue — initEditor 参数
  ├── Step 6: MetaScriptEditorModal.vue — 同上
  └── Step 7: meta/script.vue — 同上

Phase 3: 验证
  ├── Step 8: meta 脚本编辑 — 打开/编辑/保存/Ctrl+S
  ├── Step 9: verse 脚本编辑 — 同上
  ├── Step 10: 主题切换 — 深色/浅色切换时 blockly 跟随
  └── Step 11: 多语言 — 切换语言后 blockly 正确加载
```

### 4.5 风险评估

| 风险 | 等级 | 说明 |
|------|------|------|
| 消息格式切换 | 🟡 中 | 改动明确，但涉及核心编辑功能 |
| 回归测试 | 🟡 中 | meta/verse 脚本编辑必须全量测试 |
| init + user-info 合并 | 🟢 低 | 简化了原来的两步等待逻辑 |
| 主题同步 | 🟢 低 | 纯增量功能，不影响现有逻辑 |

### 4.6 工作量估计

| 阶段 | 工作量 |
|------|--------|
| Blockly 侧（3 个文件） | ~0.5 天 |
| 主系统侧（4 个文件） | ~1 天 |
| 联调测试 | ~0.5 天 |
| **总计** | **~2 天** |

比完整插件迁移（7 天）少很多，因为不涉及 PluginLayout、plugins.json、Token、权限、nginx 等。

### 4.7 收益

1. **协议统一**：所有 iframe 通信都用 `{ type, id, payload }` 格式，降低认知负担
2. **主题同步**：Blockly 终于能跟随主系统主题切换，而不是只跟浏览器
3. **简化初始化**：合并 `init` + `user-info` 为 `EDITOR_INIT`，去掉 `tryInit` 两步等待
4. **DESTROY 通知**：Blockly 可以在弹窗关闭时做清理（释放 workspace 资源）
5. **为 editor.7dgame.com 铺路**：同样的改造模式可以复用

---

## 5. 总结

| 问题 | 回答 |
|------|------|
| 技术上能迁移吗？ | 能，嵌入式协议标准化约 2 天工作量 |
| 需要加侧边栏入口吗？ | 不需要，保持 ScriptEditorModal 弹窗嵌入方式 |
| 核心改动是什么？ | 消息格式 `{ action, data, from }` → `{ type, id, payload }` |
| 最大收益？ | 协议统一 + 主题同步 + 初始化简化 |
| editor.7dgame.com 呢？ | 同样的改造模式可以复用，但需要单独分析其消息协议 |
