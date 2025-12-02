import * as Blockly from "blockly";

const urlParams = new URLSearchParams(window.location.search);
let lg = urlParams.get("language") || "en";

window.lg = lg; // 将 lg 挂载到全局 window 对象上
console.log("当前语言是: ", window.lg);

export const LOGIC_NAME = {
  "zh-cn": "逻辑",
  en: "Logic",
  ja: "ロジック",
  "zh-tw": "邏輯",
  th: "ตรรกะ",
};

export const LOOP_NAME = {
  "zh-cn": "循环",
  en: "Loop",
  ja: "ループ",
  "zh-tw": "迴圈",
  th: "วง",
};

export const MATH_NAME = {
  "zh-cn": "数学",
  en: "Math",
  ja: "数学",
  "zh-tw": "數學",
  th: "คณิตศาสตร์",
};

export const TEXTS_NAME = {
  "zh-cn": "文本",
  en: "Texts",
  ja: "テキスト",
  "zh-tw": "文本",
  th: "ข้อความ",
};

export const LIST_NAME = {
  "zh-cn": "列表",
  en: "List",
  ja: "リスト",
  "zh-tw": "列表",
  th: "รายการ",
};

// data
export const DATA_NAME = {
  "zh-cn": "数据",
  en: "Data",
  ja: "データ",
  "zh-tw": "數據",
  th: "ข้อมูล",
};
Blockly.Msg.DATA_TRANSFORM_DATA = {
  "zh-cn": "位置 %1 旋转 %2 缩放 %3",
  en: "Position %1 Rotate %2 Scale %3",
  ja: "位置 %1 回転 %2 スケール %3",
  "zh-tw": "位置 %1 旋轉 %2 縮放 %3",
  th: "ตำแหน่ง %1 หมุน %2 ขนาด %3",
};

// 任务
export const TASK_NAME = {
  "zh-cn": "任务",
  en: "Task",
  ja: "タスク",
  "zh-tw": "任務",
  th: "งาน",
};
Blockly.Msg.TASK_TWEEN_TO_DATA = {
  "zh-cn": "物体 %1 移动到 %2 用时 %3 %4 差值方式 %5",
  en: "Move object %1 to %2 in %3 %4 easing method %5",
  ja: "オブジェクト %1 を %2 まで %3 %4 の方法で移動 %5",
  "zh-tw": "物體 %1 移動到 %2 用時 %3 %4 插值方式 %5",
  th: "วัตถุ %1 ย้ายไป %2 ใช้เวลา %3 %4 วิธีการแก้ไข %5",
};
Blockly.Msg.TASK_TWEEN_OBJECT = {
  "zh-cn": "物体 %1 移动到目标 %2 用时 %3 %4 差值方式 %5",
  en: "Move object %1 to target %2 in %3 %4 easing method %5",
  ja: "オブジェクト %1 をターゲット %2 まで %3 %4 の方法で移動 %5",
  "zh-tw": "物體 %1 移動到目標 %2 用時 %3 %4 插值方式 %5",
  th: "วัตถุ %1 ย้ายไปเป้าหมาย %2 ใช้เวลา %3 %4 วิธีการแก้ไข %5",
};
Blockly.Msg.TASK_ARRAY = {
  "zh-cn": "任务数组 %1 %2",
  en: "Task array %1 %2",
  ja: "タスク配列 %1 %2",
  "zh-tw": "任務数组 %1 %2",
  th: "งาน数组 %1 %2",
};
Blockly.Msg.TASK_CIRCLE = {
  "zh-cn": "任务循环 %1 %2",
  en: "Task loop %1 %2",
  ja: "タスクループ %1 %2",
  "zh-tw": "任務迴圈 %1 %2",
  th: "งานวง %1 %2",
};
Blockly.Msg.TASK_RUN = {
  "zh-cn": "启动任务 %1",
  en: "Start task %1",
  ja: "タスク %1 を開始する",
  "zh-tw": "启动任務 %1",
  th: "启动งาน %1",
};
Blockly.Msg.TASK_SLEEP = {
  "zh-cn": "休眠： %1 秒",
  en: "Sleep: %1 seconds",
  ja: "スリープ: %1 秒",
  "zh-tw": "休眠： %1 秒",
  th: "休眠： %1 วินาที",
};
Blockly.Msg.TASK_PLAY_SOUND_TASK = {
  "zh-cn": "播放音频 %1 任务",
  en: "Play audio %1 task",
  ja: "オーディオ %1 タスクを再生する",
  "zh-tw": "播放音頻 %1 任務",
  th: "เล่นเสียง %1 งาน",
};
Blockly.Msg.TASK_PLAY_VIDEO_TASK = {
  "zh-cn": "播放视频 %1 任务",
  en: "Play video %1 task",
  ja: "ビデオ %1 タスクを再生する",
  "zh-tw": "播放視頻 %1 任務",
  th: "เล่นวิดีโอ %1 งาน",
};
Blockly.Msg.TASK_PLAY_ANIMATION_TASK = {
  "zh-cn": "播放动画 模型 %1 动画 %2 任务",
  en: "Play animation polygen %1 animation %2 task",
  ja: "モデル %1 アニメーション %2 タスクを再生する",
  "zh-tw": "播放動畫 模型 %1 動畫 %2 任務",
  th: "เล่นภาพเคลื่อนไหว โมเดล %1 ภาพเคลื่อนไหว %2 งาน",
};
Blockly.Msg.TASK_SYSTEM_TASK = {
  "zh-cn": "系统方法： %1 参数 %2",
  en: "System method: %1 parameter %2",
  ja: "システムメソッド: %1 パラメーター %2",
  "zh-tw": "系統方法： %1 參數 %2",
  th: "วิธีระบบ： %1 พารามิเตอร์ %2",
};

// 参数
export const PARAMETER_NAME = {
  "zh-cn": "参数",
  en: "Parameter",
  ja: "パラメーター",
  "zh-tw": "參數",
  th: "พารามิเตอร์",
};
Blockly.Msg.PARAMETER_BOOLEAN = {
  "zh-cn": "布尔参数 %1",
  en: "Boolean parameter! %1",
  ja: "ブールパラメーター! %1",
  "zh-tw": "布尔參數 %1",
  th: "布尔พารามิเตอร์ %1",
};
Blockly.Msg.PARAMETER_NUMBER = {
  "zh-cn": "数字参数 %1",
  en: "Number parameter! %1",
  ja: "数値パラメーター! %1",
  "zh-tw": "数字參數 %1",
  th: "数字พารามิเตอร์ %1",
};
Blockly.Msg.PARAMETER_STRING = {
  "zh-cn": "字符参数 %1",
  en: "String parameter! %1",
  ja: "文字列パラメーター! %1",
  "zh-tw": "字符參數 %1",
  th: "字符พารามิเตอร์ %1",
};
Blockly.Msg.PARAMETER_PARAMETERS = {
  "zh-cn": "参数列表 %1",
  en: "Parameter list! %1",
  ja: "パラメーターリスト! %1",
  "zh-tw": "參數列表 %1",
  th: "พารามิเตอร์รายการ %1",
};
Blockly.Msg.PARAMETER_SYSTEM = {
  "zh-cn": "系统参数： %1",
  en: "System parameter: %1",
  ja: "システムパラメーター: %1",
  "zh-tw": "系统參數： %1",
  th: "系统พารามิเตอร์： %1",
};
Blockly.Msg.PARAMETER_PLAYER = {
  "zh-cn": "玩家 %1 ,参数 %2",
  en: "Player %1, parameter %2",
  ja: "プレイヤー %1, パラメーター %2",
  "zh-tw": "玩家 %1 ,參數 %2",
  th: "ผู้เล่น %1 ,พารามิเตอร์ %2",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_INDEX = {
  "zh-cn": "索引",
  en: "Index",
  ja: "インデックス",
  "zh-tw": "索引",
  th: "索引",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_SERVER = {
  "zh-cn": "服务器",
  en: "Server",
  ja: "サーバー",
  "zh-tw": "服務器",
  th: "เซิร์ฟเวอร์",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_RANDOM_CLIENT = {
  "zh-cn": "随机客户",
  en: "Random client",
  ja: "ランダムクライアント",
  "zh-tw": "隨機客戶",
  th: "ไคลเอนต์สุ่ม",
};
Blockly.Msg.PARAMETER_RECTANGLE = {
  "zh-cn": "范围随机点 %1 中点 %2 半径 %3",
  en: "Random point in range %1, center %2, radius %3",
  ja: "範囲内のランダムポイント %1, 中心 %2, 半径 %3",
  "zh-tw": "範圍隨機點 %1 中點 %2 半徑 %3",
  th: "จุดสุ่มในช่วง %1 จุดศูนย์กลาง %2 รัศมี %3",
};
Blockly.Msg.PARAMETER_ENTITY = {
  "zh-cn": "位置参数 %1",
  en: "Position parameter %1",
  ja: "位置パラメーター %1",
  "zh-tw": "位置參數 %1",
  th: "ตำแหน่งพารามิเตอร์ %1",
};

// Meta
export const META_NAME = {
  "zh-cn": "组件",
  en: "Meta",
  ja: "メタ",
  "zh-tw": "組件",
  th: "องค์ประกอบ",
};
Blockly.Msg.META_ACTION = {
  "zh-cn": "动作 %1 %2 %3",
  en: "Action %1 %2 %3",
  ja: "アクション %1 %2 %3",
  "zh-tw": "動作 %1 %2 %3",
  th: "การกระทำ %1 %2 %3",
};
Blockly.Msg.META_RUN = {
  "zh-cn": "启动任务 %1",
  en: "Start task %1",
  ja: "タスク %1 を開始する",
  "zh-tw": "启动任務 %1",
  th: "启动งาน %1",
};

// Trigger
export const TRIGGER_NAME = {
  "zh-cn": "动作",
  en: "Action",
  ja: "アクション",
  "zh-tw": "動作",
  th: "การกระทำ",
};
Blockly.Msg.TRIGGER_ACTION_EXECUTE = {
  "zh-cn": "动作 %1 %2",
  en: "Action %1 %2",
  ja: "アクション %1 %2",
  "zh-tw": "動作 %1 %2",
  th: "การกระทำ %1 %2",
};
Blockly.Msg.TRIGGER_ACTION_TRIGGER = {
  "zh-cn": "动作 %1 %2 %3",
  en: "Action %1 %2 %3",
  ja: "アクション %1 %2 %3",
  "zh-tw": "動作 %1 %2 %3",
  th: "การกระทำ %1 %2 %3",
};
Blockly.Msg.TRIGGER_INIT = {
  "zh-cn": "初始化 %1 %2",
  en: "Initialize %1 %2",
  ja: "初期化 %1 %2",
  "zh-tw": "初始化 %1 %2",
  th: "初始化 %1 %2",
};
Blockly.Msg.TRIGGER_DESTROY = {
  "zh-cn": "销毁 %1 %2",
  en: "Destroy %1 %2",
  ja: "破棄 %1 %2",
  "zh-tw": "销毁 %1 %2",
  th: "销毁 %1 %2",
};
Blockly.Msg.TRIGGER_UPDATE = {
  "zh-cn": "更新 %1 %2",
  en: "Update %1 %2",
  ja: "更新 %1 %2",
  "zh-tw": "更新 %1 %2",
  th: "更新 %1 %2",
};

// Event
export const EVENT_NAME = {
  "zh-cn": "事件",
  en: "Event",
  ja: "イベント",
  "zh-tw": "事件",
  th: "เหตุการณ์",
};
Blockly.Msg.EVENT_INPUT = {
  "zh-cn": "输入事件 %1 %2 %3",
  en: "Input Event %1 %2 %3",
  ja: "入力イベント %1 %2 %3",
  "zh-tw": "輸入事件 %1 %2 %3",
  th: "输入เหตุการณ์ %1 %2 %3",
};
Blockly.Msg.EVENT_OUTPUT = {
  "zh-cn": "输出事件 %1",
  en: "Output Event %1",
  ja: "出力イベント %1",
  "zh-tw": "輸出事件 %1",
  th: "输出เหตุการณ์ %1",
};

// 节点entity
export const ENTITY_NAME = {
  "zh-cn": "节点",
  en: "Point",
  ja: "エンティティ",
  "zh-tw": "節點",
  th: "โหนด",
};
Blockly.Msg.ENTITY_ENTITY = {
  "zh-cn": "节点 %1",
  en: "Point %1",
  ja: "エンティティ %1",
  "zh-tw": "節點 %1",
  th: "โหนด %1",
};
Blockly.Msg.ENTITY_VISUAL_EXECUTE = {
  "zh-cn": "节点 %1 显示/隐藏 %2 %3",
  en: "Point %1 Show/Hide %2 %3",
  ja: "エンティティ %1 表示/非表示 %2 %3",
  "zh-tw": "節點 %1 顯示/隱藏 %2 %3",
  th: "โหนด %1 แสดง/ซ่อน %2 %3",
};
Blockly.Msg.ENTITY_ENTITY_HIGHLIGHT = {
  "zh-cn": "节点 %1 高亮 %2 颜色 %3",
  en: "Point %1 highlight %2 color %3",
  ja: "エンティティ %1 をハイライト %2 色 %3",
  "zh-tw": "節點 %1 高亮 %2 顏色 %3",
  th: "โหนด %1 高亮 %2 สี %3",
};
Blockly.Msg.ENTITY_MOVABLE = {
  "zh-cn": "节点 %1 是否可移动 %2",
  en: "Point %1 is movable %2",
  ja: "エンティティ %1 が移動可能かどうかをフィルタリングする %2",
  "zh-tw": "節點 %1 是否可移動 %2",
  th: "โหนด %1 สามารถเคลื่อนไหวได้ %2",
};
Blockly.Msg.ENTITY_MOVABLE_ALL = {
  "zh-cn": "所有节点是否可移动 %1",
  en: "All points are movable %1",
  ja: "すべてのエンティティが移動可能かどうかをフィルタリングする %1",
  "zh-tw": "所有節點是否可移動 %1",
  th: "所有โหนดสามารถเคลื่อนไหวได้ %1",
};
Blockly.Msg.ENTITY_ROTATABLE = {
  "zh-cn": "节点 %1 是否自旋转 %2",
  en: "Point %1 is rotatable %2",
  ja: "エンティティ %1 が自動回転可能かどうかをフィルタリングする %2",
  "zh-tw": "節點 %1 是否自旋轉 %2",
  th: "โหนด %1 是否自หมุน %2",
};

// 模型ploygen
export const POLYGEN_NAME = {
  "zh-cn": "模型",
  en: "Polygen",
  ja: "ポリゴン",
  "zh-tw": "模型",
  th: "โมเดล",
};
Blockly.Msg.POLYGEN_POLYGEN_ENTITY = {
  "zh-cn": "模型 %1",
  en: "Polygen %1",
  ja: "モデル %1",
  "zh-tw": "模型 %1",
  th: "โมเดล %1",
};
Blockly.Msg.POLYGEN_PLAY_ANIMATION = {
  "zh-cn": "模型 %1 播放动画 %2",
  en: "Polygen %1 play animation %2",
  ja: "モデル %1 アニメーションを再生 %2",
  "zh-tw": "模型 %1 播放動畫 %2",
  th: "โมเดล %1 เล่นภาพเคลื่อนไหว %2",
};
Blockly.Msg.POLYGEN_POLYGEN_HIGHLIGHT = {
  "zh-cn": "模型 %1 高亮 %2 颜色 %3",
  en: "Polygen %1 highlight %2 color %3",
  ja: "モデル %1 ハイライト %2 色 %3",
  "zh-tw": "模型 %1 高亮 %2 顏色 %3",
  th: "โมเดล %1 高亮 %2 สี %3",
};

Blockly.Msg.POLYGEN_MOVABLE = {
  "zh-cn": "模型 %1 是否移动 %2",
  en: "Polygen %1 is movable %2",
  ja: "モデル %1 が移動可能かどうかをフィルタリングする %2",
  "zh-tw": "模型 %1 是否移动 %2",
  th: "โมเดล %1 是否移动 %2",
};
Blockly.Msg.POLYGEN_MOVABLE_ALL = {
  "zh-cn": "所有模型 是否移动 %1",
  en: "All polygens is movable %1",
  ja: "すべてのモデルが移動可能かどうかをフィルタリングする %1",
  "zh-tw": "所有模型 是否移动 %1",
  th: "所有โมเดล 是否移动 %1",
};
Blockly.Msg.POLYGEN_ROTATABLE = {
  "zh-cn": "模型 %1 是否自旋转 %2",
  en: "Polygen %1 is rotatable %2",
  ja: "モデル %1 が自動回転可能かどうかをフィルタリングする %2",
  "zh-tw": "模型 %1 是否自旋轉 %2",
  th: "โมเดล %1 是否自หมุน %2",
};
Blockly.Msg.POLYGEN_SET_VISEME_CLIP = {
  "zh-cn": "模型 %1 口型音频 %2",
  en: "Polygen %1 viseme audio %2",
  ja: "モデル %1 口パク音声 %2",
  "zh-tw": "模型 %1 口型音頻 %2",
  th: "โมเดล %1 เสียงวิสิมเม %2",
};
Blockly.Msg.POLYGEN_SET_EMOTE = {
  "zh-cn": "模型 %1 设置表情 %2",
  en: "Polygen %1 set emote %2",
  ja: "モデル %1 表情を設定 %2",
  "zh-tw": "模型 %1 設置表情 %2",
  th: "โมเดล %1 ตั้งค่าอีโมต %2",
};
Blockly.Msg.POLYGEN_EMOTE_IDLE = {
  "zh-cn": "默认",
  en: "Idle",
  ja: "デフォルト",
  "zh-tw": "默認",
  th: "เริ่มต้น",
};
Blockly.Msg.POLYGEN_EMOTE_ANGER = {
  "zh-cn": "愤怒",
  en: "Anger",
  ja: "怒り",
  "zh-tw": "憤怒",
  th: "โกรธ",
};
Blockly.Msg.POLYGEN_EMOTE_SMIRK = {
  "zh-cn": "嘲笑",
  en: "Smirk",
  ja: "にやり",
  "zh-tw": "嘲笑",
  th: "หัวเราะเยาะ",
};
Blockly.Msg.POLYGEN_EMOTE_SMILE = {
  "zh-cn": "微笑",
  en: "Smile",
  ja: "笑顔",
  "zh-tw": "微笑",
  th: "ยิ้ม",
};
Blockly.Msg.POLYGEN_EMOTE_SAD = {
  "zh-cn": "悲伤",
  en: "Sad",
  ja: "悲しい",
  "zh-tw": "悲傷",
  th: "เศร้า",
};
Blockly.Msg.POLYGEN_EMOTE_DISGUST = {
  "zh-cn": "厌恶",
  en: "Disgust",
  ja: "嫌悪",
  "zh-tw": "厭惡",
  th: "น่ารังเกียจ",
};

// 图片picture
export const PICTURE_NAME = {
  "zh-cn": "图片",
  en: "Picture",
  ja: "画像",
  "zh-tw": "圖片",
  th: "รูปภาพ",
};
Blockly.Msg.PICTURE_PICTURE = {
  "zh-cn": "图片 %1",
  en: "Picture %1",
  ja: "画像 %1",
  "zh-tw": "圖片 %1",
  th: "รูปภาพ %1",
};

// 文字text
export const TEXT_NAME = {
  "zh-cn": "文字",
  en: "Text",
  ja: "テキスト",
  "zh-tw": "文字",
  th: "ข้อความ",
};
Blockly.Msg.TEXT_TEXT = {
  "zh-cn": "文字 %1",
  en: "Text %1",
  ja: "テキスト %1",
  "zh-tw": "文字 %1",
  th: "ข้อความ %1",
};
Blockly.Msg.TEXT_SET = {
  "zh-cn": "文本 %1 设置为 %2",
  en: "Text %1 set to %2",
  ja: "テキスト %1 を %2 に設定する",
  "zh-tw": "文本 %1 設置為 %2",
  th: "ข้อความ %1 ตั้งค่าเป็น %2",
};

// 音频sound
export const SOUND_NAME = {
  "zh-cn": "音频",
  en: "Audio",
  ja: "サウンド",
  "zh-tw": "音頻",
  th: "เสียง",
};
Blockly.Msg.SOUND_SOUND = {
  "zh-cn": "音频 %1",
  en: "Audio %1",
  ja: "サウンド %1",
  "zh-tw": "音頻 %1",
  th: "เสียง %1",
};
Blockly.Msg.SOUND_PLAY = {
  "zh-cn": "播放音频 %1",
  en: "Play Audio %1",
  ja: "サウンドを再生 %1",
  "zh-tw": "播放音頻 %1",
  th: "เล่นเสียง %1",
};
Blockly.Msg.SOUND_PAUSE = {
  "zh-cn": "暂停音频 %1",
  en: "Pause Audio %1",
  ja: "サウンドを一時停止 %1",
  "zh-tw": "暫停音頻 %1",
  th: "หยุดชั่วคราวเสียง %1",
};
Blockly.Msg.SOUND_STOP = {
  "zh-cn": "终止音频 %1",
  en: "Stop Audio %1",
  ja: "サウンドを停止 %1",
  "zh-tw": "終止音頻 %1",
  th: "หยุดเสียง %1",
};
Blockly.Msg.SOUND_AUTOPLAY = {
  "zh-cn": "自动播放/暂停 音频 %1",
  en: "Auto Play/Pause Audio %1",
  ja: "自動再生/一時停止 サウンド %1",
  "zh-tw": "自動播放/暫停 音頻 %1",
  th: "เล่นอัตโนมัติ/หยุดชั่วคราว เสียง %1",
};

// 体素voxel
export const VOXEL_NAME = {
  "zh-cn": "体素",
  en: "Voxel",
  ja: "ボクセル",
  "zh-tw": "體素",
  th: "วอกเซล",
};
Blockly.Msg.VOXEL_VOXEL = {
  "zh-cn": "体素 %1",
  en: "Voxel %1",
  ja: "ボクセル %1",
  "zh-tw": "體素 %1",
  th: "วอกเซล %1",
};

// 其他other
export const OTHER_NAME = {
  "zh-cn": "其他",
  en: "Other",
  ja: "その他",
  "zh-tw": "其他",
  th: "其他",
};
Blockly.Msg.OTHER_SLEEP = {
  "zh-cn": "休眠 %1 秒",
  en: "Sleep %1 seconds",
  ja: "スリープ %1 秒",
  "zh-tw": "休眠 %1 秒",
  th: "休眠 %1 วินาที",
};

// 信号signal
export const SIGNAL_NAME = {
  "zh-cn": "信号",
  en: "Signal",
  ja: "シグナル",
  "zh-tw": "信號",
  th: "สัญญาณ",
};

// 管理signal
export const MANAGER_NAME = {
  "zh-cn": "管理",
  en: "Manager",
  ja: "マネージャー",
  "zh-tw": "管理",
  th: "管理",
};

Blockly.Msg.GAME_ADD_SCORE = {
  "zh-cn": "增加分数 %1",
  en: "Add Score %1",
  ja: "スコアを追加 %1",
  "zh-tw": "增加分數 %1",
  th: "เพิ่มคะแนน %1",
};

Blockly.Msg.GAME_RESET = {
  "zh-cn": "重置游戏",
  en: "Reset Game",
  ja: "ゲームをリセット",
  "zh-tw": "重置遊戲",
  th: "รีเซ็ตเกม",
};

Blockly.Msg.GAME_COUNTDOWN = {
  "zh-cn": "倒计时 秒数 %1",
  en: "Countdown Seconds %1",
  ja: "カウントダウン 秒数 %1",
  "zh-tw": "倒計時 秒數 %1",
  th: "นับถอยหลัง วินาที数 %1",
};

Blockly.Msg.SIGNAL_OUTPUT_SIGNAL = {
  "zh-cn": "触发信号 %1",
  en: "Trigger signal %1",
  ja: "信号 %1 をトリガーする",
  "zh-tw": "触发信號 %1",
  th: "触发สัญญาณ %1",
};
Blockly.Msg.SIGNAL_INPUT_SIGNAL = {
  "zh-cn": "接收信号 %1 %2 %3",
  en: "Receive signal %1 %2 %3",
  ja: "信号 %1 %2 %3 を受信する",
  "zh-tw": "接收信號 %1 %2 %3",
  th: "接收สัญญาณ %1 %2 %3",
};
Blockly.Msg.SIGNAL_OUTPUT_SIGNAL_WITH_PARAMETER = {
  "zh-cn": "触发信号 %1 参数 %2",
  en: "Trigger signal %1 parameter %2",
  ja: "信号 %1 パラメーター %2 をトリガーする",
  "zh-tw": "触发信號 %1 參數 %2",
  th: "触发สัญญาณ %1 พารามิเตอร์ %2",
};
Blockly.Msg.SIGNAL_INIT_SIGNAL = {
  "zh-cn": "初始化 %1 %2",
  en: "Initialize %1 %2",
  ja: "初期化 %1 %2",
  "zh-tw": "初始化 %1 %2",
  th: "初始化 %1 %2",
};
Blockly.Msg.SIGNAL_OUTPUT_MULT_SIGNAL = {
  "zh-cn": "触发多个信号 %1",
  en: "Trigger multiple signals %1",
  ja: "複数の信号 %1 をトリガーする",
  "zh-tw": "触发多个信號 %1",
  th: "触发多个สัญญาณ %1",
};

Blockly.Msg.SIGNAL_OUTPUT_SIGNAL_ITEM = {
  "zh-cn": "实体的输入信号 %1",
  en: "Entity input signal %1",
  ja: "実体の入力信号 %1",
  "zh-tw": "实体的输入信號 %1",
  th: "实体的输入สัญญาณ %1",
};

export const VARIABLE_NAME = {
  "zh-cn": "变量",
  en: "Variable",
  ja: "変数",
  "zh-tw": "變量",
  th: "ตัวแปร",
};

export const PROCEDURE_NAME = {
  "zh-cn": "函数",
  en: "Procedure",
  ja: "プロシージャ",
  "zh-tw": "函數",
  th: "ฟังก์ชัน",
};

// 指令command
export const COMMAND_NAME = {
  "zh-cn": "指令",
  en: "Command",
  ja: "コマンド",
  "zh-tw": "指令",
  th: "คำสั่ง",
};
Blockly.Msg.VOICE_TRIGGER = {
  "zh-cn": "语音指令 %1 %2 %3",
  en: "Voice Trigger %1 %2 %3",
  ja: "音声トリガー %1 %2 %3",
  "zh-tw": "語音指令 %1 %2 %3",
  th: "语音คำสั่ง %1 %2 %3",
};
Blockly.Msg.GESTURE_TRIGGER = {
  "zh-cn": "手势指令 %1 %2 %3",
  en: "Gesture Trigger %1 %2 %3",
  ja: "ジェスチャートリガー %1 %2 %3",
  "zh-tw": "手勢指令 %1 %2 %3",
  th: "手势คำสั่ง %1 %2 %3",
};
// 语音指令 Voice Command
Blockly.Msg.VOICE_TRIGGER_SCALE_UP = {
  "zh-cn": "放大",
  en: "Scale Up",
  ja: "拡大",
  "zh-tw": "放大",
  th: "ขยาย",
};
Blockly.Msg.VOICE_TRIGGER_SCALE_DOWN = {
  "zh-cn": "缩小",
  en: "Scale Down",
  ja: "縮小",
  "zh-tw": "縮小",
  th: "ย่อ",
};
Blockly.Msg.VOICE_TRIGGER_DECOMPOSE = {
  "zh-cn": "分解",
  en: "Decompose",
  ja: "分解",
  "zh-tw": "分解",
  th: "สลายตัว",
};
Blockly.Msg.VOICE_TRIGGER_RESET = {
  "zh-cn": "还原",
  en: "Reset",
  ja: "復元",
  "zh-tw": "還原",
  th: "เรียกคืน",
};
Blockly.Msg.VOICE_TRIGGER_GO_BACK = {
  "zh-cn": "返回",
  en: "Go Back",
  ja: "戻る",
  "zh-tw": "返回",
  th: "ย้อนกลับ",
};

// 手势指令 Gesture Command
Blockly.Msg.GESTURE_TRIGGER_OK = {
  "zh-cn": "OK",
  en: "OK",
  ja: "OK",
  "zh-tw": "OK",
  th: "ตกลง",
};
Blockly.Msg.GESTURE_TRIGGER_FIST = {
  "zh-cn": "握拳",
  en: "Fist",
  ja: "握り拳",
  "zh-tw": "握拳",
  th: "กำปั้น",
};

// 视频video
export const VIDEO_NAME = {
  "zh-cn": "视频",
  en: "Video",
  ja: "ビデオ",
  "zh-tw": "視頻",
  th: "วิดีโอ",
};
Blockly.Msg.VIDEO_VIDEO = {
  "zh-cn": "视频 %1",
  en: "Video %1",
  ja: "ビデオ %1",
  "zh-tw": "視頻 %1",
  th: "วิดีโอ %1",
};
Blockly.Msg.VIDEO_PLAY = {
  "zh-cn": "播放视频 %1",
  en: "Play Video %1",
  ja: "ビデオを再生 %1",
  "zh-tw": "播放視頻 %1",
  th: "เล่นวิดีโอ %1",
};
Blockly.Msg.VIDEO_PAUSE = {
  "zh-cn": "暂停视频 %1",
  en: "Pause Video %1",
  ja: "ビデオを一時停止 %1",
  "zh-tw": "暫停視頻 %1",
  th: "หยุดชั่วคราววิดีโอ %1",
};
Blockly.Msg.VIDEO_STOP = {
  "zh-cn": "终止视频 %1",
  en: "Stop Video %1",
  ja: "ビデオを停止 %1",
  "zh-tw": "終止視頻 %1",
  th: "หยุดวิดีโอ %1",
};
Blockly.Msg.VIDEO_AUTOPLAY = {
  "zh-cn": "自动播放/暂停 视频 %1",
  en: "Auto Play/Pause Video %1",
  ja: "自動再生/一時停止 ビデオ %1",
  "zh-tw": "自動播放/暫停 視頻 %1",
  th: "เล่นอัตโนมัติ/หยุดชั่วคราว วิดีโอ %1",
};

// 颜色 Colors
export const COLOR_NAME = {
  "zh-cn": "颜色",
  en: "Color",
  ja: "色",
  "zh-tw": "顏色",
  th: "สี",
};

Blockly.Msg.COLOR_NONE = {
  "zh-cn": "none",
  en: "none",
  ja: "none",
  "zh-tw": "none",
  th: "none",
};

Blockly.Msg.COLOR_WHITE = {
  "zh-cn": "白色",
  en: "white",
  ja: "白",
  "zh-tw": "白色",
  th: "白色",
};

Blockly.Msg.COLOR_RED = {
  "zh-cn": "红色",
  en: "red",
  ja: "赤",
  "zh-tw": "紅色",
  th: "แดง",
};

Blockly.Msg.COLOR_ORANGE = {
  "zh-cn": "橙色",
  en: "orange",
  ja: "オレンジ",
  "zh-tw": "橙色",
  th: "橙色",
};

Blockly.Msg.COLOR_YELLOW = {
  "zh-cn": "黄色",
  en: "yellow",
  ja: "黄",
  "zh-tw": "黃色",
  th: "เหลือง",
};

Blockly.Msg.COLOR_GREEN = {
  "zh-cn": "绿色",
  en: "green",
  ja: "緑",
  "zh-tw": "綠色",
  th: "เขียว",
};

Blockly.Msg.COLOR_CYAN = {
  "zh-cn": "青色",
  en: "cyan",
  ja: "シアン",
  "zh-tw": "青色",
  th: "青色",
};

Blockly.Msg.COLOR_BLUE = {
  "zh-cn": "蓝色",
  en: "blue",
  ja: "青",
  "zh-tw": "藍色",
  th: "น้ำเงิน",
};

Blockly.Msg.COLOR_PURPLE = {
  "zh-cn": "紫色",
  en: "purple",
  ja: "紫",
  "zh-tw": "紫色",
  th: "ม่วง",
};

//TooltipVisual
Blockly.Msg.TOOLTIP_VISUAL = {
  "zh-cn": "节点 %1 的 标签 显示/隐藏 %2",
  en: "Point %1 label show/hide %2",
  ja: "エンティティ %1 のラベルを表示/非表示 %2",
  "zh-tw": "節點 %1 的 标签 顯示/隱藏 %2",
  th: "โหนด %1 的 标签 แสดง/ซ่อน %2",
};

Blockly.Msg.TOOLTIPS_VISUAL = {
  "zh-cn": "所有节点上的 标签 显示/隐藏 %1",
  en: "All Points' label show/hide %1",
  ja: "すべてのエンティティのラベルを表示/非表示 %1",
  "zh-tw": "所有節點上的 标签 顯示/隱藏 %1",
  th: "所有โหนด上的 标签 แสดง/ซ่อน %1",
};
