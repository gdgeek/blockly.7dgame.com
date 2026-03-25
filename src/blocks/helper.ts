import * as Blockly from "blockly";
import * as Lua from "blockly/lua";
import * as Javascript from "blockly/javascript";

interface BlocklyBlock {
  getFieldValue: (name: string) => string;
  [key: string]: unknown;
}

interface BlocklyGenerator {
  statementToCode: (block: object, name: string) => string;
  valueToCode: (block: object, name: string, order: unknown) => string;
  [key: string]: unknown;
}

interface BlockDefinition {
  title: string;
  type?: string;
  colour?: number;
  getBlockJson?: (parameters: unknown) => object;
  getBlock: (parameters: unknown) => object;
  getJavascript: (parameters: unknown) => (block: BlocklyBlock, generator: BlocklyGenerator) => unknown;
  getLua: (parameters: unknown) => (block: BlocklyBlock, generator: BlocklyGenerator) => unknown;
  toolbox?: {
    kind: string;
    type: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ToolboxCategory {
  kind: string;
  name: string;
  contents?: unknown[];
  [key: string]: unknown;
}

interface Toolbox {
  kind?: string;
  contents: ToolboxCategory[];
  [key: string]: unknown;
}

type SupportedLanguage = "zh-CN" | "en-US" | "ja-JP" | "zh-TW" | "th-TH";

type TooltipLocalization = Record<SupportedLanguage, string>;
type BlocklyTooltipRender = (container: HTMLDivElement, hoveredElement: Element) => void;

const EMPTY_TOOLTIP_CLASS = "blockly-tooltip-empty-hidden";
const EMPTY_TOOLTIP_STYLE_ID = "blockly-empty-tooltip-style";
const TOOLTIP_THUMBNAIL_BASE = "/block-tips";
const TOOLTIP_THUMBNAIL_MAX_WIDTH = 220;
const TOOLTIP_THUMBNAIL_CLASS = "blockly-tooltip-thumbnail";
const TOOLTIP_THUMBNAIL_TEXT_CLASS = "blockly-tooltip-text";
let tooltipPatchInstalled = false;

const FRIENDLY_TOOLTIP_BY_BLOCK: Record<string, TooltipLocalization> = {
  "task-tween-to-data": {
    "zh-CN": "把一个节点平滑移动到指定坐标，可设置时长和缓动方式。",
    "en-US": "Smoothly moves a node to a coordinate with configurable duration and easing.",
    "ja-JP": "ノードを指定座標へ滑らかに移動します。時間とイージングを設定できます。",
    "zh-TW": "將節點平滑移動到指定座標，可設定時長與插值方式。",
    "th-TH": "ย้ายโหนดไปยังพิกัดแบบลื่นไหล โดยกำหนดเวลาและการเคลื่อนไหวได้",
  },
  "task-tween": {
    "zh-CN": "把一个节点平滑移动到另一个节点位置，可设置时长和缓动方式。",
    "en-US": "Smoothly moves one node to another node with configurable duration and easing.",
    "ja-JP": "ノードを別のノード位置へ滑らかに移動します。時間とイージングを設定できます。",
    "zh-TW": "將一個節點平滑移動到另一個節點位置，可設定時長與插值方式。",
    "th-TH": "ย้ายโหนดหนึ่งไปยังอีกโหนดแบบลื่นไหล โดยกำหนดเวลาและการเคลื่อนไหวได้",
  },
  "task-run": {
    "zh-CN": "执行你输入的任务列表，通常用于启动一段行为流程。",
    "en-US": "Runs the task list you provide, usually to start a behavior flow.",
    "ja-JP": "指定したタスクリストを実行します。処理フローの開始に使います。",
    "zh-TW": "執行你輸入的任務列表，通常用於啟動一段行為流程。",
    "th-TH": "รันรายการงานที่กำหนด มักใช้เพื่อเริ่มลำดับการทำงาน",
  },
  "task-sleep": {
    "zh-CN": "让流程暂停一段时间，再继续执行后续任务。",
    "en-US": "Pauses the flow for a period of time, then continues.",
    "ja-JP": "一定時間フローを停止し、その後に続行します。",
    "zh-TW": "讓流程暫停一段時間，再繼續執行後續任務。",
    "th-TH": "พักลำดับการทำงานตามเวลาที่กำหนด แล้วทำงานต่อ",
  },
  "task_array": {
    "zh-CN":
      "把多个任务按顺序组合成一个任务组，便于统一执行。list：顺序执行所有任务。set：同步执行所有任务。",
    "en-US":
      "Combines multiple tasks into one task group. list: runs all tasks in sequence. set: runs all tasks in parallel.",
    "ja-JP":
      "複数タスクを1つのタスクグループにまとめます。list: すべてのタスクを順番に実行。set: すべてのタスクを同時に実行。",
    "zh-TW":
      "把多個任務組成一個任務組，便於統一執行。list：依序執行所有任務。set：同步執行所有任務。",
    "th-TH":
      "รวมหลายงานเป็นกลุ่มงานเดียว list: ทำงานทั้งหมดตามลำดับ set: ทำงานทั้งหมดพร้อมกัน",
  },
  "task-circle": {
    "zh-CN": "循环执行任务组，循环次数由输入值决定。",
    "en-US": "Repeats a task group; the repeat count comes from the input value.",
    "ja-JP": "タスクグループを繰り返し実行します。回数は入力値で決まります。",
    "zh-TW": "循環執行任務組，循環次數由輸入值決定。",
    "th-TH": "ทำซ้ำกลุ่มงาน โดยจำนวนรอบมาจากค่าที่ป้อน",
  },
  sleep_task: {
    "zh-CN": "等待时间后执行。",
    "en-US": "Executes after the wait time.",
    "ja-JP": "待機時間の後に実行します。",
    "zh-TW": "等待時間後執行。",
    "th-TH": "ทำงานต่อหลังเวลารอครบ",
  },
  play_sound_task: {
    "zh-CN": "前台串行播放音频。",
    "en-US": "Foreground serial audio playback.",
    "ja-JP": "前景で音声を直列再生します。",
    "zh-TW": "前台串行播放音訊。",
    "th-TH": "เล่นเสียงแบบลำดับในส่วนหน้า",
  },
  play_video_task: {
    "zh-CN": "前台串行播放视频。",
    "en-US": "Foreground serial video playback.",
    "ja-JP": "前景で動画を直列再生します。",
    "zh-TW": "前台串行播放影片。",
    "th-TH": "เล่นวิดีโอแบบลำดับในส่วนหน้า",
  },
  play_animation_task: {
    "zh-CN": "前台串行播放模型动画。",
    "en-US": "Foreground serial model animation playback.",
    "ja-JP": "前景でモデルアニメーションを直列再生します。",
    "zh-TW": "前台串行播放模型動畫。",
    "th-TH": "เล่นแอนิเมชันโมเดลแบบลำดับในส่วนหน้า",
  },
  action_trigger: {
    "zh-CN": "交互触发、碰撞触发等。",
    "en-US": "Used for interaction triggers, collision triggers, and similar events.",
    "ja-JP": "インタラクション発火、衝突発火などに使います。",
    "zh-TW": "互動觸發、碰撞觸發等。",
    "th-TH": "ใช้กับทริกเกอร์แบบโต้ตอบ ชนกัน และเหตุการณ์ลักษณะเดียวกัน",
  },
  init_trigger: {
    "zh-CN": "实体启动后执行一次。",
    "en-US": "Runs after the scene starts.",
    "ja-JP": "シーン開始後に実行します。",
    "zh-TW": "場景啟動後執行。",
    "th-TH": "ทำงานหลังจากฉากเริ่มต้น",
  },
  voice_trigger: {
    "zh-CN": "运行语言指令。",
    "en-US": "Runs the voice command.",
    "ja-JP": "音声コマンドを実行します。",
    "zh-TW": "執行語音指令。",
    "th-TH": "รันคำสั่งเสียง",
  },
  gesture_trigger: {
    "zh-CN": "运行手势指令。",
    "en-US": "Runs the gesture command.",
    "ja-JP": "ジェスチャーコマンドを実行します。",
    "zh-TW": "執行手勢指令。",
    "th-TH": "รันคำสั่งท่าทาง",
  },
  input_signal: {
    "zh-CN": "接收实体发出的信号。",
    "en-US": "Runs the input signal.",
    "ja-JP": "入力シグナルを実行します。",
    "zh-TW": "執行輸入信號。",
    "th-TH": "รันสัญญาณขาเข้า",
  },
  output_signal: {
    "zh-CN": "向实体发送信号。",
    "en-US": "Sends the output signal.",
    "ja-JP": "出力シグナルを送信します。",
    "zh-TW": "發送輸出信號。",
    "th-TH": "ส่งสัญญาณขาออก",
  },
  init_signal: {
    "zh-CN": "场景启动后自动运行一次。",
    "en-US": "Runs once automatically after the scene starts.",
    "ja-JP": "シーン開始後に自動で1回実行されます。",
    "zh-TW": "場景啟動後自動執行一次。",
    "th-TH": "ทำงานอัตโนมัติหนึ่งครั้งหลังจากฉากเริ่ม",
  },
  output_mult_signal: {
    "zh-CN": "同时并行触发多个信号。",
    "en-US": "Triggers multiple signals in parallel.",
    "ja-JP": "複数のシグナルを同時に並行発火します。",
    "zh-TW": "同時並行觸發多個信號。",
    "th-TH": "ทริกเกอร์หลายสัญญาณพร้อมกันแบบขนาน",
  },
  output_signal_item: {
    "zh-CN": "用于“触发多个信号”模块中。",
    "en-US": "Used inside the \"trigger multiple signals\" block.",
    "ja-JP": "「複数シグナルを発火」ブロック内で使用します。",
    "zh-TW": "用於「觸發多個信號」模組中。",
    "th-TH": "ใช้ภายในบล็อก \"ทริกเกอร์หลายสัญญาณ\"",
  },
  output_signal_with_parameter: {
    "zh-CN": "向实体发送带参数的信号，接收方可读取参数值。",
    "en-US": "Sends a signal with parameters to entities for passing data to receivers.",
    "ja-JP": "パラメーター付きシグナルをエンティティへ送信し、受信側へデータを渡します。",
    "zh-TW": "向實體發送帶參數的信號，用於將資料傳給接收方。",
    "th-TH": "ส่งสัญญาณพร้อมพารามิเตอร์ไปยังเอนทิตี เพื่อส่งข้อมูลให้ฝั่งรับ",
  },
  play_animation: {
    "zh-CN": "后台并行播放模型动画。",
    "en-US": "Plays model animation in parallel in the background.",
    "ja-JP": "モデルアニメーションをバックグラウンドで並行再生します。",
    "zh-TW": "在背景中並行播放模型動畫。",
    "th-TH": "เล่นแอนิเมชันโมเดลแบบขนานในพื้นหลัง",
  },
  polygen_highlight: {
    "zh-CN": "模型高亮展示。",
    "en-US": "Highlights the model for display.",
    "ja-JP": "モデルをハイライト表示します。",
    "zh-TW": "模型高亮展示。",
    "th-TH": "เน้นไฮไลต์การแสดงผลของโมเดล",
  },
  polygen_movable: {
    "zh-CN": "控制模型可移动组件的开关。",
    "en-US": "Controls the switch of the model movable component.",
    "ja-JP": "モデルの移動コンポーネントのオン/オフを制御します。",
    "zh-TW": "控制模型可移動組件的開關。",
    "th-TH": "ควบคุมการเปิด/ปิดคอมโพเนนต์การเคลื่อนที่ของโมเดล",
  },
  polygen_allmovable: {
    "zh-CN": "控制所有模型可移动组件的开关。",
    "en-US": "Controls the switch of movable components for all models.",
    "ja-JP": "すべてのモデルの移動コンポーネントのオン/オフを制御します。",
    "zh-TW": "控制所有模型可移動組件的開關。",
    "th-TH": "ควบคุมการเปิด/ปิดคอมโพเนนต์การเคลื่อนที่ของโมเดลทั้งหมด",
  },
  play_video: {
    "zh-CN": "后台并行播放视频。",
    "en-US": "Plays video in parallel in the background.",
    "ja-JP": "動画をバックグラウンドで並行再生します。",
    "zh-TW": "在背景中並行播放影片。",
    "th-TH": "เล่นวิดีโอแบบขนานในพื้นหลัง",
  },
  pause_video: {
    "zh-CN": "暂停播放视频。",
    "en-US": "Pauses video playback.",
    "ja-JP": "動画の再生を一時停止します。",
    "zh-TW": "暫停播放影片。",
    "th-TH": "หยุดวิดีโอชั่วคราว",
  },
  stop_video: {
    "zh-CN": "停止播放视频。",
    "en-US": "Stops video playback.",
    "ja-JP": "動画の再生を停止します。",
    "zh-TW": "停止播放影片。",
    "th-TH": "หยุดเล่นวิดีโอ",
  },
  autoplay_video: {
    "zh-CN": "视频播放中：暂停播放；视频暂停中：开始播放。",
    "en-US": "If video is playing: pause it; if paused: resume it.",
    "ja-JP": "再生中なら一時停止、停止中なら再生を開始します。",
    "zh-TW": "影片播放中：暫停播放；影片暫停中：開始播放。",
    "th-TH": "วิดีโอกำลังเล่น: หยุดชั่วคราว; วิดีโอหยุดชั่วคราว: เริ่มเล่น",
  },
  play_sound: {
    "zh-CN": "后台并行播放音频。",
    "en-US": "Plays audio in parallel in the background.",
    "ja-JP": "音声をバックグラウンドで並行再生します。",
    "zh-TW": "在背景中並行播放音訊。",
    "th-TH": "เล่นเสียงแบบขนานในพื้นหลัง",
  },
  pause_sound: {
    "zh-CN": "暂停播放音频。",
    "en-US": "Pauses audio playback.",
    "ja-JP": "音声の再生を一時停止します。",
    "zh-TW": "暫停播放音訊。",
    "th-TH": "หยุดเสียงชั่วคราว",
  },
  stop_sound: {
    "zh-CN": "停止播放音频。",
    "en-US": "Stops audio playback.",
    "ja-JP": "音声の再生を停止します。",
    "zh-TW": "停止播放音訊。",
    "th-TH": "หยุดเล่นเสียง",
  },
  autoplay_sound: {
    "zh-CN": "音频播放中：暂停播放；音频暂停中：开始播放。",
    "en-US": "If audio is playing: pause it; if paused: resume it.",
    "ja-JP": "再生中なら一時停止、停止中なら再生を開始します。",
    "zh-TW": "音訊播放中：暫停播放；音訊暫停中：開始播放。",
    "th-TH": "เสียงกำลังเล่น: หยุดชั่วคราว; เสียงหยุดชั่วคราว: เริ่มเล่น",
  },
};

const WEAK_TOOLTIP_SET = new Set([
  "buy id",
  "fetch stock price",
  "Show or hide label on a specific point",
  "Show or hide label on all points",
]);

const PREFIX_DESCRIPTION: Record<string, TooltipLocalization> = {
  task: {
    "zh-CN": "这是一个任务块，用来编排流程中的一步动作。",
    "en-US": "This is a task block used to define one step in a workflow.",
    "ja-JP": "これはタスクブロックで、処理フローの1ステップを定義します。",
    "zh-TW": "這是一個任務塊，用來編排流程中的一步動作。",
    "th-TH": "นี่คือบล็อกงาน ใช้กำหนดหนึ่งขั้นตอนในลำดับการทำงาน",
  },
  parameter: {
    "zh-CN": "这是一个参数块，用来提供数字、文本、布尔值等输入。",
    "en-US": "This is a parameter block that provides values like number, text, or boolean.",
    "ja-JP": "これはパラメーターブロックで、数値・文字列・真偽値などの入力を渡します。",
    "zh-TW": "這是一個參數塊，用來提供數字、文本、布林值等輸入。",
    "th-TH": "นี่คือบล็อกพารามิเตอร์ ใช้ส่งค่าเช่น ตัวเลข ข้อความ หรือบูลีน",
  },
  trigger: {
    "zh-CN": "这是一个触发块，用来定义什么时候开始执行后续逻辑。",
    "en-US": "This is a trigger block that defines when the following logic starts.",
    "ja-JP": "これはトリガーブロックで、後続ロジックの開始条件を定義します。",
    "zh-TW": "這是一個觸發塊，用來定義何時開始執行後續邏輯。",
    "th-TH": "นี่คือบล็อกทริกเกอร์ ใช้กำหนดว่าจะเริ่มตรรกะถัดไปเมื่อใด",
  },
  event: {
    "zh-CN": "这是一个事件块，用来监听或发送业务事件。",
    "en-US": "This is an event block used to listen to or emit business events.",
    "ja-JP": "これはイベントブロックで、イベントの受信や送信に使います。",
    "zh-TW": "這是一個事件塊，用來監聽或發送業務事件。",
    "th-TH": "นี่คือบล็อกอีเวนต์ ใช้ฟังหรือส่งอีเวนต์ของระบบ",
  },
  entity: {
    "zh-CN": "这是一个实体块，用来选择或控制场景中的实体对象。",
    "en-US": "This is an entity block used to select or control scene entities.",
    "ja-JP": "これはエンティティブロックで、シーン内オブジェクトの指定や制御に使います。",
    "zh-TW": "這是一個實體塊，用來選擇或控制場景中的實體物件。",
    "th-TH": "นี่คือบล็อกเอนทิตี ใช้เลือกหรือควบคุมวัตถุในฉาก",
  },
  polygen: {
    "zh-CN": "这是一个模型块，用来控制 3D 模型相关动作或状态。",
    "en-US": "This is a model block used to control 3D model actions or states.",
    "ja-JP": "これはモデルブロックで、3Dモデルの動作や状態を制御します。",
    "zh-TW": "這是一個模型塊，用來控制 3D 模型相關動作或狀態。",
    "th-TH": "นี่คือบล็อกโมเดล ใช้ควบคุมการกระทำหรือสถานะของโมเดล 3D",
  },
  sound: {
    "zh-CN": "这是一个音频块，用来播放、暂停或停止声音。",
    "en-US": "This is an audio block used to play, pause, or stop sounds.",
    "ja-JP": "これは音声ブロックで、再生・一時停止・停止を制御します。",
    "zh-TW": "這是一個音訊塊，用來播放、暫停或停止聲音。",
    "th-TH": "นี่คือบล็อกเสียง ใช้เล่น หยุดชั่วคราว หรือหยุดเสียง",
  },
  video: {
    "zh-CN": "这是一个视频块，用来播放、暂停或停止视频。",
    "en-US": "This is a video block used to play, pause, or stop videos.",
    "ja-JP": "これは動画ブロックで、再生・一時停止・停止を制御します。",
    "zh-TW": "這是一個影片塊，用來播放、暫停或停止影片。",
    "th-TH": "นี่คือบล็อกวิดีโอ ใช้เล่น หยุดชั่วคราว หรือหยุดวิดีโอ",
  },
  signal: {
    "zh-CN": "这是一个信号块，用来发送或接收节点间信号。",
    "en-US": "This is a signal block used to send or receive node signals.",
    "ja-JP": "これはシグナルブロックで、ノード間シグナルの送受信に使います。",
    "zh-TW": "這是一個信號塊，用來發送或接收節點間信號。",
    "th-TH": "นี่คือบล็อกสัญญาณ ใช้ส่งหรือรับสัญญาณระหว่างโหนด",
  },
  log: {
    "zh-CN": "这是一个日志块，用来记录调试信息，便于排查问题。",
    "en-US": "This is a log block used to record debug information.",
    "ja-JP": "これはログブロックで、デバッグ情報の記録に使います。",
    "zh-TW": "這是一個日誌塊，用來記錄除錯資訊，便於排查問題。",
    "th-TH": "นี่คือบล็อกบันทึก ใช้เก็บข้อมูลดีบักเพื่อช่วยตรวจสอบปัญหา",
  },
  game: {
    "zh-CN": "这是一个游戏管理块，用来控制分数、重置或倒计时等状态。",
    "en-US": "This is a game-management block for score, reset, countdown, and similar states.",
    "ja-JP": "これはゲーム管理ブロックで、スコアやリセット、カウントダウンを制御します。",
    "zh-TW": "這是一個遊戲管理塊，用來控制分數、重置或倒數等狀態。",
    "th-TH": "นี่คือบล็อกจัดการเกม ใช้ควบคุมคะแนน รีเซ็ต และตัวจับเวลาถอยหลัง",
  },
};

function normalizeLanguage(lg: string | undefined): SupportedLanguage {
  const supported: SupportedLanguage[] = ["zh-CN", "en-US", "ja-JP", "zh-TW", "th-TH"];
  if (!lg) {
    return "en-US";
  }
  const found = supported.find((item) => lg.includes(item));
  return found || "en-US";
}

function isMeaningfulTooltip(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  const text = value.trim();
  return Boolean(text) && text.length >= 8 && !WEAK_TOOLTIP_SET.has(text);
}

function sanitizeBlockText(text: string): string {
  return text
    .replace(/%\d+/g, "")
    .replace(/\s+/g, " ")
    .replace(/!+/g, "")
    .trim();
}

function normalizeTooltipForCompare(text: string): string {
  return text
    .replace(/^作用[:：]\s*/i, "")
    .replace(/^what it does:\s*/i, "")
    .replace(/^機能:\s*/i, "")
    .replace(/^หน้าที่[:：]?\s*/i, "")
    .replace(/[。．.!！?？,:：;；\s]/g, "")
    .toLowerCase();
}

function isRedundantFallbackTooltip(tooltipText: string, sourceText: string): boolean {
  const normalizedTooltip = normalizeTooltipForCompare(tooltipText);
  const normalizedSource = normalizeTooltipForCompare(sanitizeBlockText(sourceText));
  if (!normalizedTooltip || !normalizedSource) {
    return false;
  }
  return normalizedTooltip === normalizedSource;
}

function getFriendlyTooltipText(title: string, language: SupportedLanguage): string | null {
  const localized = FRIENDLY_TOOLTIP_BY_BLOCK[title];
  if (!localized) {
    return null;
  }
  return localized[language];
}

function buildFallbackTooltip(text: string, language: SupportedLanguage): string {
  const cleanText = sanitizeBlockText(text);
  if (!cleanText) {
    return "";
  }
  switch (language) {
    case "zh-CN":
      return `作用：${cleanText}。`;
    case "zh-TW":
      return `作用：${cleanText}。`;
    case "ja-JP":
      return `機能: ${cleanText}。`;
    case "th-TH":
      return `หน้าที่: ${cleanText}`;
    default:
      return `What it does: ${cleanText}.`;
  }
}

function inferPrefixDescription(title: string, language: SupportedLanguage): string {
  const [prefix] = title.split("-");
  if (!prefix) {
    return "";
  }
  return PREFIX_DESCRIPTION[prefix]?.[language] || "";
}

function getJsonTooltipData(
  data: BlockDefinition,
  parameters: unknown
): { message0: string; tooltip: string } {
  if (!data.getBlockJson) {
    return { message0: "", tooltip: "" };
  }
  const json = data.getBlockJson(parameters) as { message0?: string; tooltip?: string };
  return {
    message0: typeof json.message0 === "string" ? json.message0 : "",
    tooltip: typeof json.tooltip === "string" ? json.tooltip : "",
  };
}

function ensureNoEmptyTooltipBubble(): void {
  if (tooltipPatchInstalled || typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  tooltipPatchInstalled = true;

  if (!document.getElementById(EMPTY_TOOLTIP_STYLE_ID)) {
    const style = document.createElement("style");
    style.id = EMPTY_TOOLTIP_STYLE_ID;
    style.textContent = `.${EMPTY_TOOLTIP_CLASS}{display:none !important;}
.${TOOLTIP_THUMBNAIL_CLASS}{display:block;max-width:${TOOLTIP_THUMBNAIL_MAX_WIDTH}px;width:100%;height:auto;border-radius:8px;margin-bottom:6px;background:#fff;}
.${TOOLTIP_THUMBNAIL_TEXT_CLASS}>div{line-height:1.45;}`;
    document.head.appendChild(style);
  }

  const previousRenderer = Blockly.Tooltip.getCustomTooltip() as BlocklyTooltipRender | null;
  Blockly.Tooltip.setCustomTooltip((container: HTMLDivElement, hoveredElement: Element) => {
    const raw = Blockly.Tooltip.getTooltipOfObject(hoveredElement);
    const blockType = resolveBlockTypeFromTooltipTarget(hoveredElement);
    const thumbnailUrl = getTooltipThumbnailUrl(blockType);
    if ((!raw || !raw.trim()) && !thumbnailUrl) {
      container.textContent = "";
      container.classList.add(EMPTY_TOOLTIP_CLASS);
      return;
    }

    container.classList.remove(EMPTY_TOOLTIP_CLASS);
    if (!thumbnailUrl && typeof previousRenderer === "function") {
      previousRenderer(container, hoveredElement);
      return;
    }

    const wrap = (Blockly as unknown as { utils?: { string?: { wrap?: (text: string, limit: number) => string } } })
      .utils?.string?.wrap;
    const limit = (Blockly.Tooltip as unknown as { LIMIT?: number }).LIMIT || 50;
    container.textContent = "";

    if (thumbnailUrl) {
      const img = document.createElement("img");
      img.className = TOOLTIP_THUMBNAIL_CLASS;
      img.alt = blockType ? `${blockType} usage` : "block usage";
      img.src = thumbnailUrl;
      img.onerror = () => {
        img.remove();
        if (!raw || !raw.trim()) {
          container.classList.add(EMPTY_TOOLTIP_CLASS);
        }
      };
      container.appendChild(img);
    }

    if (raw && raw.trim()) {
      const wrapped = wrap ? wrap(raw, limit) : raw;
      const textWrapper = document.createElement("div");
      textWrapper.className = TOOLTIP_THUMBNAIL_TEXT_CLASS;
      wrapped.split("\n").forEach((line) => {
        const row = document.createElement("div");
        row.appendChild(document.createTextNode(line));
        textWrapper.appendChild(row);
      });
      container.appendChild(textWrapper);
    }
  });
}

function resolveBlockTypeFromTooltipTarget(target: unknown): string {
  let cursor: unknown = target;
  let depth = 0;
  while (cursor && depth < 8) {
    const maybeType = (cursor as { type?: unknown }).type;
    if (typeof maybeType === "string" && maybeType.trim()) {
      return maybeType;
    }
    cursor = (cursor as { tooltip?: unknown }).tooltip;
    depth += 1;
  }
  return "";
}

function getTooltipThumbnailUrl(blockType: string): string {
  if (!blockType) {
    return "";
  }
  return `${TOOLTIP_THUMBNAIL_BASE}/${blockType}.png`;
}

function disableTooltip(block: Blockly.Block): void {
  block.setTooltip(null as unknown as string);
}

function RegisterData(data: BlockDefinition, parameters: unknown): void {
  ensureNoEmptyTooltipBubble();

  const rawBlock = data.getBlock(parameters) as { init?: (this: Blockly.Block) => void };
  const rawInit = rawBlock.init;
  rawBlock.init = function (this: Blockly.Block) {
    rawInit?.call(this);

    const language = normalizeLanguage(window.lg);
    const customTooltip = getFriendlyTooltipText(data.title, language);
    if (customTooltip) {
      this.setTooltip(customTooltip);
      return;
    }

    const { message0, tooltip: jsonTooltip } = getJsonTooltipData(data, parameters);
    const currentTooltip = typeof this.tooltip === "string" ? this.tooltip : "";
    if (isMeaningfulTooltip(currentTooltip)) {
      return;
    }
    if (isMeaningfulTooltip(jsonTooltip)) {
      this.setTooltip(jsonTooltip);
      return;
    }

    const inferredText = message0 || this.toString();
    const fallbackTooltip = buildFallbackTooltip(inferredText, language);
    const effectiveFallbackTooltip = isRedundantFallbackTooltip(fallbackTooltip, inferredText)
      ? ""
      : fallbackTooltip;
    const prefixDescription = inferPrefixDescription(data.title, language);
    const mergedTooltip = [prefixDescription, effectiveFallbackTooltip].filter(Boolean).join(" ");
    if (mergedTooltip) {
      this.setTooltip(mergedTooltip);
      return;
    }

    disableTooltip(this);
  };

  Blockly.Blocks[data.title] = rawBlock;
  Lua.luaGenerator.forBlock[data.title] = data.getLua(parameters) as unknown as (
    block: Blockly.Block,
    generator: Lua.LuaGenerator
  ) => string | [string, number];
  Javascript.javascriptGenerator.forBlock[data.title] =
    data.getJavascript(parameters) as unknown as (
      block: Blockly.Block,
      generator: Javascript.JavascriptGenerator
    ) => string | [string, number];
}

function Handler(uuid: string): string {
  return "_G.helper.handler(index, '" + uuid + "')";
}

function InputEvent(uuid: string): string {
  return "_G.helper.input_event(index, '" + uuid + "')";
}

function OutputEvent(uuid: string): string {
  return "_G.helper.output_event(index, '" + uuid + "')";
}

const SetupIt = (
  category: ToolboxCategory,
  register: (parameters: unknown) => void
): ((toolbox: Toolbox, parameters: unknown) => void) => {
  const func = (toolbox: Toolbox, parameters: unknown): void => {
    toolbox.contents.push(category);
    register(parameters);
  };
  return func;
};

function Number(value: number | string): string {
  return "_G.argument.number(" + value + ")";
}

function Boolean(value: boolean | string): string {
  return "_G.argument.boolean(" + value + ")";
}

function String(value: string): string {
  return "_G.argument.string(" + value + ")";
}

function Point(value: string): string {
  return "_G.argument.point(" + value + ")";
}

function Player(type: string, value?: string): string {
  switch (type) {
    case "index":
      return "_G.argument.index_player(" + value + ")";
    case "id":
      return "_G.argument.id_player(" + value + ")";
    case "server":
      return "_G.argument.server_player()";
    case "random_client":
      return "_G.argument.random_player()";
  }
  return "_G.argument.server_player()";
}

function Anchor(key: string): string {
  return "_G.argument.anchor('" + key + "')";
}

function Range(anchor: string, radius: string | number): string {
  return "_G.argument.range(" + anchor + ", " + radius + ")";
}

// --- JS code generation helpers (migrated from helperJS.js) ---

function HandlerJS(uuid: string): string {
  return `helper.handler(index, '${uuid}')`;
}

function InputEventJS(uuid: string): string {
  return `helper.inputEvent(index, '${uuid}')`;
}

function OutputEventJS(uuid: string): string {
  return `helper.outputEvent(index, '${uuid}')`;
}

function NumberJS(value: number | string): string {
  return `argument.number(${value})`;
}

function BooleanJS(value: boolean | string): string {
  return `argument.boolean(${value})`;
}

function StringJS(value: string): string {
  return `argument.string(${value})`;
}

function PointJS(value: string): string {
  return `argument.point(${value})`;
}

function PlayerJS(type: string, value?: string): string {
  switch (type) {
    case "index":
      return `argument.indexPlayer(${value})`;
    case "id":
      return `argument.idPlayer(${value})`;
    case "server":
      return `argument.serverPlayer()`;
    case "random_client":
      return `argument.randomPlayer()`;
    default:
      return `argument.serverPlayer()`;
  }
}

function AnchorJS(key: string): string {
  return `argument.anchor('${key}')`;
}

function RangeJS(anchor: string, radius: string | number): string {
  return `argument.range(${anchor}, ${radius})`;
}

export {
  RegisterData,
  Handler,
  InputEvent,
  OutputEvent,
  SetupIt,
  Number,
  String,
  Boolean,
  Range,
  Anchor,
  Player,
  Point,
  HandlerJS,
  InputEventJS,
  OutputEventJS,
  NumberJS,
  BooleanJS,
  StringJS,
  PointJS,
  PlayerJS,
  AnchorJS,
  RangeJS,
};

export type { BlockDefinition, BlocklyBlock, BlocklyGenerator, ToolboxCategory, Toolbox };
