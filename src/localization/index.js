import * as Blockly from "blockly";

const urlParams = new URLSearchParams(window.location.search);
let lg = urlParams.get("language") || "en-US";

window.lg = lg; // 将 lg 挂载到全局 window 对象上
console.log("当前语言是: ", window.lg);

export const LOGIC_NAME = {
  "zh-CN": "逻辑",
  "en-US": "Logic",
  "ja-JP": "ロジック",
  "zh-TW": "邏輯",
  "th-TH": "ตรรกะ",
};

export const LOOP_NAME = {
  "zh-CN": "循环",
  "en-US": "Loop",
  "ja-JP": "ループ",
  "zh-TW": "迴圈",
  "th-TH": "วง",
};

export const MATH_NAME = {
  "zh-CN": "数学",
  "en-US": "Math",
  "ja-JP": "数学",
  "zh-TW": "數學",
  "th-TH": "คณิตศาสตร์",
};

export const TEXTS_NAME = {
  "zh-CN": "文本",
  "en-US": "Texts",
  "ja-JP": "テキスト",
  "zh-TW": "文本",
  "th-TH": "ข้อความ",
};

export const LIST_NAME = {
  "zh-CN": "列表",
  "en-US": "List",
  "ja-JP": "リスト",
  "zh-TW": "列表",
  "th-TH": "รายการ",
};

// data
export const DATA_NAME = {
  "zh-CN": "数据",
  "en-US": "Data",
  "ja-JP": "データ",
  "zh-TW": "數據",
  "th-TH": "ข้อมูล",
};
Blockly.Msg.DATA_TRANSFORM_DATA = {
  "zh-CN": "位置 %1 旋转 %2 缩放 %3",
  "en-US": "Position %1 Rotate %2 Scale %3",
  "ja-JP": "位置 %1 回転 %2 スケール %3",
  "zh-TW": "位置 %1 旋轉 %2 縮放 %3",
  "th-TH": "ตำแหน่ง %1 หมุน %2 ขนาด %3",
};

// 任务
export const TASK_NAME = {
  "zh-CN": "任务",
  "en-US": "Task",
  "ja-JP": "タスク",
  "zh-TW": "任務",
  "th-TH": "งาน",
};
Blockly.Msg.TASK_TWEEN_TO_DATA = {
  "zh-CN": "物体 %1 移动到 %2 用时 %3 %4 差值方式 %5",
  "en-US": "Move object %1 to %2 in %3 %4 easing method %5",
  "ja-JP": "オブジェクト %1 を %2 まで %3 %4 の方法で移動 %5",
  "zh-TW": "物體 %1 移動到 %2 用時 %3 %4 插值方式 %5",
  "th-TH": "วัตถุ %1 ย้ายไป %2 ใช้เวลา %3 %4 วิธีการแก้ไข %5",
};
Blockly.Msg.TASK_TWEEN_OBJECT = {
  "zh-CN": "物体 %1 移动到目标 %2 用时 %3 %4 差值方式 %5",
  "en-US": "Move object %1 to target %2 in %3 %4 easing method %5",
  "ja-JP": "オブジェクト %1 をターゲット %2 まで %3 %4 の方法で移動 %5",
  "zh-TW": "物體 %1 移動到目標 %2 用時 %3 %4 插值方式 %5",
  "th-TH": "วัตถุ %1 ย้ายไปเป้าหมาย %2 ใช้เวลา %3 %4 วิธีการแก้ไข %5",
};
Blockly.Msg.TASK_ARRAY = {
  "zh-CN": "任务数组 %1 %2",
  "en-US": "Task array %1 %2",
  "ja-JP": "タスク配列 %1 %2",
  "zh-TW": "任務数组 %1 %2",
  "th-TH": "งาน数组 %1 %2",
};
Blockly.Msg.TASK_CIRCLE = {
  "zh-CN": "任务循环 %1 %2",
  "en-US": "Task loop %1 %2",
  "ja-JP": "タスクループ %1 %2",
  "zh-TW": "任務迴圈 %1 %2",
  "th-TH": "งานวง %1 %2",
};
Blockly.Msg.TASK_RUN = {
  "zh-CN": "启动任务 %1",
  "en-US": "Start task %1",
  "ja-JP": "タスク %1 を開始する",
  "zh-TW": "启动任務 %1",
  "th-TH": "启动งาน %1",
};
Blockly.Msg.TASK_SLEEP = {
  "zh-CN": "休眠： %1 秒",
  "en-US": "Sleep: %1 seconds",
  "ja-JP": "スリープ: %1 秒",
  "zh-TW": "休眠： %1 秒",
  "th-TH": "休眠： %1 วินาที",
};
Blockly.Msg.TASK_PLAY_SOUND_TASK = {
  "zh-CN": "播放音频 %1 任务",
  "en-US": "Play audio %1 task",
  "ja-JP": "オーディオ %1 タスクを再生する",
  "zh-TW": "播放音頻 %1 任務",
  "th-TH": "เล่นเสียง %1 งาน",
};
Blockly.Msg.TASK_PLAY_VIDEO_TASK = {
  "zh-CN": "播放视频 %1 任务",
  "en-US": "Play video %1 task",
  "ja-JP": "ビデオ %1 タスクを再生する",
  "zh-TW": "播放視頻 %1 任務",
  "th-TH": "เล่นวิดีโอ %1 งาน",
};
Blockly.Msg.TASK_PLAY_ANIMATION_TASK = {
  "zh-CN": "播放动画 模型 %1 动画 %2 任务",
  "en-US": "Play animation polygen %1 animation %2 task",
  "ja-JP": "モデル %1 アニメーション %2 タスクを再生する",
  "zh-TW": "播放動畫 模型 %1 動畫 %2 任務",
  "th-TH": "เล่นภาพเคลื่อนไหว โมเดล %1 ภาพเคลื่อนไหว %2 งาน",
};
Blockly.Msg.TASK_SYSTEM_TASK = {
  "zh-CN": "系统方法： %1 参数 %2",
  "en-US": "System method: %1 parameter %2",
  "ja-JP": "システムメソッド: %1 パラメーター %2",
  "zh-TW": "系統方法： %1 參數 %2",
  "th-TH": "วิธีระบบ： %1 พารามิเตอร์ %2",
};

// 参数
export const PARAMETER_NAME = {
  "zh-CN": "参数",
  "en-US": "Parameter",
  "ja-JP": "パラメーター",
  "zh-TW": "參數",
  "th-TH": "พารามิเตอร์",
};
Blockly.Msg.PARAMETER_BOOLEAN = {
  "zh-CN": "布尔参数 %1",
  "en-US": "Boolean parameter! %1",
  "ja-JP": "ブールパラメーター! %1",
  "zh-TW": "布尔參數 %1",
  "th-TH": "布尔พารามิเตอร์ %1",
};
Blockly.Msg.PARAMETER_NUMBER = {
  "zh-CN": "数字参数 %1",
  "en-US": "Number parameter! %1",
  "ja-JP": "数値パラメーター! %1",
  "zh-TW": "数字參數 %1",
  "th-TH": "数字พารามิเตอร์ %1",
};
Blockly.Msg.PARAMETER_STRING = {
  "zh-CN": "字符参数 %1",
  "en-US": "String parameter! %1",
  "ja-JP": "文字列パラメーター! %1",
  "zh-TW": "字符參數 %1",
  "th-TH": "字符พารามิเตอร์ %1",
};
Blockly.Msg.PARAMETER_PARAMETERS = {
  "zh-CN": "参数列表 %1",
  "en-US": "Parameter list! %1",
  "ja-JP": "パラメーターリスト! %1",
  "zh-TW": "參數列表 %1",
  "th-TH": "พารามิเตอร์รายการ %1",
};
Blockly.Msg.PARAMETER_SYSTEM = {
  "zh-CN": "系统参数： %1",
  "en-US": "System parameter: %1",
  "ja-JP": "システムパラメーター: %1",
  "zh-TW": "系统參數： %1",
  "th-TH": "系统พารามิเตอร์： %1",
};
Blockly.Msg.PARAMETER_PLAYER = {
  "zh-CN": "玩家 %1 ,参数 %2",
  "en-US": "Player %1, parameter %2",
  "ja-JP": "プレイヤー %1, パラメーター %2",
  "zh-TW": "玩家 %1 ,參數 %2",
  "th-TH": "ผู้เล่น %1 ,พารามิเตอร์ %2",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_INDEX = {
  "zh-CN": "索引",
  "en-US": "Index",
  "ja-JP": "インデックス",
  "zh-TW": "索引",
  "th-TH": "索引",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_SERVER = {
  "zh-CN": "服务器",
  "en-US": "Server",
  "ja-JP": "サーバー",
  "zh-TW": "服務器",
  "th-TH": "เซิร์ฟเวอร์",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_RANDOM_CLIENT = {
  "zh-CN": "随机客户",
  "en-US": "Random client",
  "ja-JP": "ランダムクライアント",
  "zh-TW": "隨機客戶",
  "th-TH": "ไคลเอนต์สุ่ม",
};
Blockly.Msg.PARAMETER_RECTANGLE = {
  "zh-CN": "范围随机点 %1 中点 %2 半径 %3",
  "en-US": "Random point in range %1, center %2, radius %3",
  "ja-JP": "範囲内のランダムポイント %1, 中心 %2, 半径 %3",
  "zh-TW": "範圍隨機點 %1 中點 %2 半徑 %3",
  "th-TH": "จุดสุ่มในช่วง %1 จุดศูนย์กลาง %2 รัศมี %3",
};
Blockly.Msg.PARAMETER_ENTITY = {
  "zh-CN": "位置参数 %1",
  "en-US": "Position parameter %1",
  "ja-JP": "位置パラメーター %1",
  "zh-TW": "位置參數 %1",
  "th-TH": "ตำแหน่งพารามิเตอร์ %1",
};

// Meta
export const META_NAME = {
  "zh-CN": "组件",
  "en-US": "Meta",
  "ja-JP": "メタ",
  "zh-TW": "組件",
  "th-TH": "องค์ประกอบ",
};
Blockly.Msg.META_ACTION = {
  "zh-CN": "动作 %1 %2 %3",
  "en-US": "Action %1 %2 %3",
  "ja-JP": "アクション %1 %2 %3",
  "zh-TW": "動作 %1 %2 %3",
  "th-TH": "การกระทำ %1 %2 %3",
};
Blockly.Msg.META_RUN = {
  "zh-CN": "启动任务 %1",
  "en-US": "Start task %1",
  "ja-JP": "タスク %1 を開始する",
  "zh-TW": "启动任務 %1",
  "th-TH": "启动งาน %1",
};

// Trigger
export const TRIGGER_NAME = {
  "zh-CN": "动作",
  "en-US": "Action",
  "ja-JP": "アクション",
  "zh-TW": "動作",
  "th-TH": "การกระทำ",
};
Blockly.Msg.TRIGGER_ACTION_EXECUTE = {
  "zh-CN": "动作 %1 %2",
  "en-US": "Action %1 %2",
  "ja-JP": "アクション %1 %2",
  "zh-TW": "動作 %1 %2",
  "th-TH": "การกระทำ %1 %2",
};
Blockly.Msg.TRIGGER_ACTION_TRIGGER = {
  "zh-CN": "动作 %1 %2 %3",
  "en-US": "Action %1 %2 %3",
  "ja-JP": "アクション %1 %2 %3",
  "zh-TW": "動作 %1 %2 %3",
  "th-TH": "การกระทำ %1 %2 %3",
};
Blockly.Msg.TRIGGER_INIT = {
  "zh-CN": "初始化 %1 %2",
  "en-US": "Initialize %1 %2",
  "ja-JP": "初期化 %1 %2",
  "zh-TW": "初始化 %1 %2",
  "th-TH": "初始化 %1 %2",
};
Blockly.Msg.TRIGGER_DESTROY = {
  "zh-CN": "销毁 %1 %2",
  "en-US": "Destroy %1 %2",
  "ja-JP": "破棄 %1 %2",
  "zh-TW": "销毁 %1 %2",
  "th-TH": "销毁 %1 %2",
};
Blockly.Msg.TRIGGER_UPDATE = {
  "zh-CN": "更新 %1 %2",
  "en-US": "Update %1 %2",
  "ja-JP": "更新 %1 %2",
  "zh-TW": "更新 %1 %2",
  "th-TH": "更新 %1 %2",
};

// Event
export const EVENT_NAME = {
  "zh-CN": "事件",
  "en-US": "Event",
  "ja-JP": "イベント",
  "zh-TW": "事件",
  "th-TH": "เหตุการณ์",
};
Blockly.Msg.EVENT_INPUT = {
  "zh-CN": "输入事件 %1 %2 %3",
  "en-US": "Input Event %1 %2 %3",
  "ja-JP": "入力イベント %1 %2 %3",
  "zh-TW": "輸入事件 %1 %2 %3",
  "th-TH": "输入เหตุการณ์ %1 %2 %3",
};
Blockly.Msg.EVENT_OUTPUT = {
  "zh-CN": "输出事件 %1",
  "en-US": "Output Event %1",
  "ja-JP": "出力イベント %1",
  "zh-TW": "輸出事件 %1",
  "th-TH": "输出เหตุการณ์ %1",
};

// 节点entity
export const ENTITY_NAME = {
  "zh-CN": "节点",
  "en-US": "Point",
  "ja-JP": "エンティティ",
  "zh-TW": "節點",
  "th-TH": "โหนด",
};
Blockly.Msg.ENTITY_ENTITY = {
  "zh-CN": "节点 %1",
  "en-US": "Point %1",
  "ja-JP": "エンティティ %1",
  "zh-TW": "節點 %1",
  "th-TH": "โหนด %1",
};
Blockly.Msg.ENTITY_VISUAL_EXECUTE = {
  "zh-CN": "节点 %1 显示/隐藏 %2 %3",
  "en-US": "Point %1 Show/Hide %2 %3",
  "ja-JP": "エンティティ %1 表示/非表示 %2 %3",
  "zh-TW": "節點 %1 顯示/隱藏 %2 %3",
  "th-TH": "โหนด %1 แสดง/ซ่อน %2 %3",
};
Blockly.Msg.ENTITY_ENTITY_HIGHLIGHT = {
  "zh-CN": "节点 %1 高亮 %2 颜色 %3",
  "en-US": "Point %1 highlight %2 color %3",
  "ja-JP": "エンティティ %1 をハイライト %2 色 %3",
  "zh-TW": "節點 %1 高亮 %2 顏色 %3",
  "th-TH": "โหนด %1 高亮 %2 สี %3",
};
Blockly.Msg.ENTITY_MOVABLE = {
  "zh-CN": "节点 %1 是否可移动 %2",
  "en-US": "Point %1 is movable %2",
  "ja-JP": "エンティティ %1 が移動可能かどうかをフィルタリングする %2",
  "zh-TW": "節點 %1 是否可移動 %2",
  "th-TH": "โหนด %1 สามารถเคลื่อนไหวได้ %2",
};
Blockly.Msg.ENTITY_MOVABLE_ALL = {
  "zh-CN": "所有节点是否可移动 %1",
  "en-US": "All points are movable %1",
  "ja-JP": "すべてのエンティティが移動可能かどうかをフィルタリングする %1",
  "zh-TW": "所有節點是否可移動 %1",
  "th-TH": "所有โหนดสามารถเคลื่อนไหวได้ %1",
};
Blockly.Msg.ENTITY_ROTATABLE = {
  "zh-CN": "节点 %1 是否自旋转 %2",
  "en-US": "Point %1 is rotatable %2",
  "ja-JP": "エンティティ %1 が自動回転可能かどうかをフィルタリングする %2",
  "zh-TW": "節點 %1 是否自旋轉 %2",
  "th-TH": "โหนด %1 是否自หมุน %2",
};

// 模型ploygen
export const POLYGEN_NAME = {
  "zh-CN": "模型",
  "en-US": "Polygen",
  "ja-JP": "ポリゴン",
  "zh-TW": "模型",
  "th-TH": "โมเดล",
};
Blockly.Msg.POLYGEN_POLYGEN_ENTITY = {
  "zh-CN": "模型 %1",
  "en-US": "Polygen %1",
  "ja-JP": "モデル %1",
  "zh-TW": "模型 %1",
  "th-TH": "โมเดล %1",
};
Blockly.Msg.POLYGEN_PLAY_ANIMATION = {
  "zh-CN": "模型 %1 播放动画 %2",
  "en-US": "Polygen %1 play animation %2",
  "ja-JP": "モデル %1 アニメーションを再生 %2",
  "zh-TW": "模型 %1 播放動畫 %2",
  "th-TH": "โมเดล %1 เล่นภาพเคลื่อนไหว %2",
};
Blockly.Msg.POLYGEN_POLYGEN_HIGHLIGHT = {
  "zh-CN": "模型 %1 高亮 %2 颜色 %3",
  "en-US": "Polygen %1 highlight %2 color %3",
  "ja-JP": "モデル %1 ハイライト %2 色 %3",
  "zh-TW": "模型 %1 高亮 %2 顏色 %3",
  "th-TH": "โมเดล %1 高亮 %2 สี %3",
};

Blockly.Msg.POLYGEN_MOVABLE = {
  "zh-CN": "模型 %1 是否移动 %2",
  "en-US": "Polygen %1 is movable %2",
  "ja-JP": "モデル %1 が移動可能かどうかをフィルタリングする %2",
  "zh-TW": "模型 %1 是否移动 %2",
  "th-TH": "โมเดล %1 是否移动 %2",
};
Blockly.Msg.POLYGEN_MOVABLE_ALL = {
  "zh-CN": "所有模型 是否移动 %1",
  "en-US": "All polygens is movable %1",
  "ja-JP": "すべてのモデルが移動可能かどうかをフィルタリングする %1",
  "zh-TW": "所有模型 是否移动 %1",
  "th-TH": "所有โมเดล 是否移动 %1",
};
Blockly.Msg.POLYGEN_ROTATABLE = {
  "zh-CN": "模型 %1 是否自旋转 %2",
  "en-US": "Polygen %1 is rotatable %2",
  "ja-JP": "モデル %1 が自動回転可能かどうかをフィルタリングする %2",
  "zh-TW": "模型 %1 是否自旋轉 %2",
  "th-TH": "โมเดล %1 是否自หมุน %2",
};
Blockly.Msg.POLYGEN_SET_VISEME_CLIP = {
  "zh-CN": "模型 %1 口型音频 %2",
  "en-US": "Polygen %1 viseme audio %2",
  "ja-JP": "モデル %1 口パク音声 %2",
  "zh-TW": "模型 %1 口型音頻 %2",
  "th-TH": "โมเดล %1 เสียงวิสิมเม %2",
};
Blockly.Msg.POLYGEN_SET_EMOTE = {
  "zh-CN": "模型 %1 设置表情 %2",
  "en-US": "Polygen %1 set emote %2",
  "ja-JP": "モデル %1 表情を設定 %2",
  "zh-TW": "模型 %1 設置表情 %2",
  "th-TH": "โมเดล %1 ตั้งค่าอีโมต %2",
};
Blockly.Msg.POLYGEN_EMOTE_IDLE = {
  "zh-CN": "默认",
  "en-US": "Idle",
  "ja-JP": "デフォルト",
  "zh-TW": "默認",
  "th-TH": "เริ่มต้น",
};
Blockly.Msg.POLYGEN_EMOTE_ANGER = {
  "zh-CN": "愤怒",
  "en-US": "Anger",
  "ja-JP": "怒り",
  "zh-TW": "憤怒",
  "th-TH": "โกรธ",
};
Blockly.Msg.POLYGEN_EMOTE_SMIRK = {
  "zh-CN": "嘲笑",
  "en-US": "Smirk",
  "ja-JP": "にやり",
  "zh-TW": "嘲笑",
  "th-TH": "หัวเราะเยาะ",
};
Blockly.Msg.POLYGEN_EMOTE_SMILE = {
  "zh-CN": "微笑",
  "en-US": "Smile",
  "ja-JP": "笑顔",
  "zh-TW": "微笑",
  "th-TH": "ยิ้ม",
};
Blockly.Msg.POLYGEN_EMOTE_SAD = {
  "zh-CN": "悲伤",
  "en-US": "Sad",
  "ja-JP": "悲しい",
  "zh-TW": "悲傷",
  "th-TH": "เศร้า",
};
Blockly.Msg.POLYGEN_EMOTE_DISGUST = {
  "zh-CN": "厌恶",
  "en-US": "Disgust",
  "ja-JP": "嫌悪",
  "zh-TW": "厭惡",
  "th-TH": "น่ารังเกียจ",
};

// 图片picture
export const PICTURE_NAME = {
  "zh-CN": "图片",
  "en-US": "Picture",
  "ja-JP": "画像",
  "zh-TW": "圖片",
  "th-TH": "รูปภาพ",
};
Blockly.Msg.PICTURE_PICTURE = {
  "zh-CN": "图片 %1",
  "en-US": "Picture %1",
  "ja-JP": "画像 %1",
  "zh-TW": "圖片 %1",
  "th-TH": "รูปภาพ %1",
};

// 文字text
export const TEXT_NAME = {
  "zh-CN": "文字",
  "en-US": "Text",
  "ja-JP": "テキスト",
  "zh-TW": "文字",
  "th-TH": "ข้อความ",
};
Blockly.Msg.TEXT_TEXT = {
  "zh-CN": "文字 %1",
  "en-US": "Text %1",
  "ja-JP": "テキスト %1",
  "zh-TW": "文字 %1",
  "th-TH": "ข้อความ %1",
};
Blockly.Msg.TEXT_SET = {
  "zh-CN": "文本 %1 设置为 %2",
  "en-US": "Text %1 set to %2",
  "ja-JP": "テキスト %1 を %2 に設定する",
  "zh-TW": "文本 %1 設置為 %2",
  "th-TH": "ข้อความ %1 ตั้งค่าเป็น %2",
};

// 音频sound
export const SOUND_NAME = {
  "zh-CN": "音频",
  "en-US": "Audio",
  "ja-JP": "サウンド",
  "zh-TW": "音頻",
  "th-TH": "เสียง",
};
Blockly.Msg.SOUND_SOUND = {
  "zh-CN": "音频 %1",
  "en-US": "Audio %1",
  "ja-JP": "サウンド %1",
  "zh-TW": "音頻 %1",
  "th-TH": "เสียง %1",
};
Blockly.Msg.SOUND_PLAY = {
  "zh-CN": "播放音频 %1",
  "en-US": "Play Audio %1",
  "ja-JP": "サウンドを再生 %1",
  "zh-TW": "播放音頻 %1",
  "th-TH": "เล่นเสียง %1",
};
Blockly.Msg.SOUND_PAUSE = {
  "zh-CN": "暂停音频 %1",
  "en-US": "Pause Audio %1",
  "ja-JP": "サウンドを一時停止 %1",
  "zh-TW": "暫停音頻 %1",
  "th-TH": "หยุดชั่วคราวเสียง %1",
};
Blockly.Msg.SOUND_STOP = {
  "zh-CN": "终止音频 %1",
  "en-US": "Stop Audio %1",
  "ja-JP": "サウンドを停止 %1",
  "zh-TW": "終止音頻 %1",
  "th-TH": "หยุดเสียง %1",
};
Blockly.Msg.SOUND_AUTOPLAY = {
  "zh-CN": "自动播放/暂停 音频 %1",
  "en-US": "Auto Play/Pause Audio %1",
  "ja-JP": "自動再生/一時停止 サウンド %1",
  "zh-TW": "自動播放/暫停 音頻 %1",
  "th-TH": "เล่นอัตโนมัติ/หยุดชั่วคราว เสียง %1",
};

// 体素voxel
export const VOXEL_NAME = {
  "zh-CN": "体素",
  "en-US": "Voxel",
  "ja-JP": "ボクセル",
  "zh-TW": "體素",
  "th-TH": "วอกเซล",
};
Blockly.Msg.VOXEL_VOXEL = {
  "zh-CN": "体素 %1",
  "en-US": "Voxel %1",
  "ja-JP": "ボクセル %1",
  "zh-TW": "體素 %1",
  "th-TH": "วอกเซล %1",
};

// 其他other
export const OTHER_NAME = {
  "zh-CN": "其他",
  "en-US": "Other",
  "ja-JP": "その他",
  "zh-TW": "其他",
  "th-TH": "其他",
};
Blockly.Msg.OTHER_SLEEP = {
  "zh-CN": "休眠 %1 秒",
  "en-US": "Sleep %1 seconds",
  "ja-JP": "スリープ %1 秒",
  "zh-TW": "休眠 %1 秒",
  "th-TH": "休眠 %1 วินาที",
};

// 信号signal
export const SIGNAL_NAME = {
  "zh-CN": "信号",
  "en-US": "Signal",
  "ja-JP": "シグナル",
  "zh-TW": "信號",
  "th-TH": "สัญญาณ",
};

// 管理signal
export const MANAGER_NAME = {
  "zh-CN": "管理",
  "en-US": "Manager",
  "ja-JP": "マネージャー",
  "zh-TW": "管理",
  "th-TH": "管理",
};

Blockly.Msg.GAME_ADD_SCORE = {
  "zh-CN": "增加分数 %1",
  "en-US": "Add Score %1",
  "ja-JP": "スコアを追加 %1",
  "zh-TW": "增加分數 %1",
  "th-TH": "เพิ่มคะแนน %1",
};

Blockly.Msg.GAME_RESET = {
  "zh-CN": "重置游戏",
  "en-US": "Reset Game",
  "ja-JP": "ゲームをリセット",
  "zh-TW": "重置遊戲",
  "th-TH": "รีเซ็ตเกม",
};

Blockly.Msg.GAME_COUNTDOWN = {
  "zh-CN": "倒计时 秒数 %1",
  "en-US": "Countdown Seconds %1",
  "ja-JP": "カウントダウン 秒数 %1",
  "zh-TW": "倒計時 秒數 %1",
  "th-TH": "นับถอยหลัง วินาที数 %1",
};

Blockly.Msg.SIGNAL_OUTPUT_SIGNAL = {
  "zh-CN": "触发信号 %1",
  "en-US": "Trigger signal %1",
  "ja-JP": "信号 %1 をトリガーする",
  "zh-TW": "触发信號 %1",
  "th-TH": "触发สัญญาณ %1",
};
Blockly.Msg.SIGNAL_INPUT_SIGNAL = {
  "zh-CN": "接收信号 %1 %2 %3",
  "en-US": "Receive signal %1 %2 %3",
  "ja-JP": "信号 %1 %2 %3 を受信する",
  "zh-TW": "接收信號 %1 %2 %3",
  "th-TH": "接收สัญญาณ %1 %2 %3",
};
Blockly.Msg.SIGNAL_OUTPUT_SIGNAL_WITH_PARAMETER = {
  "zh-CN": "触发信号 %1 参数 %2",
  "en-US": "Trigger signal %1 parameter %2",
  "ja-JP": "信号 %1 パラメーター %2 をトリガーする",
  "zh-TW": "触发信號 %1 參數 %2",
  "th-TH": "触发สัญญาณ %1 พารามิเตอร์ %2",
};
Blockly.Msg.SIGNAL_INIT_SIGNAL = {
  "zh-CN": "初始化 %1 %2",
  "en-US": "Initialize %1 %2",
  "ja-JP": "初期化 %1 %2",
  "zh-TW": "初始化 %1 %2",
  "th-TH": "初始化 %1 %2",
};
Blockly.Msg.SIGNAL_OUTPUT_MULT_SIGNAL = {
  "zh-CN": "触发多个信号 %1",
  "en-US": "Trigger multiple signals %1",
  "ja-JP": "複数の信号 %1 をトリガーする",
  "zh-TW": "触发多个信號 %1",
  "th-TH": "触发多个สัญญาณ %1",
};

Blockly.Msg.SIGNAL_OUTPUT_SIGNAL_ITEM = {
  "zh-CN": "实体的输入信号 %1",
  "en-US": "Entity input signal %1",
  "ja-JP": "実体の入力信号 %1",
  "zh-TW": "实体的输入信號 %1",
  "th-TH": "实体的输入สัญญาณ %1",
};

export const VARIABLE_NAME = {
  "zh-CN": "变量",
  "en-US": "Variable",
  "ja-JP": "変数",
  "zh-TW": "變量",
  "th-TH": "ตัวแปร",
};

export const PROCEDURE_NAME = {
  "zh-CN": "函数",
  "en-US": "Procedure",
  "ja-JP": "プロシージャ",
  "zh-TW": "函數",
  "th-TH": "ฟังก์ชัน",
};

// 指令command
export const COMMAND_NAME = {
  "zh-CN": "指令",
  "en-US": "Command",
  "ja-JP": "コマンド",
  "zh-TW": "指令",
  "th-TH": "คำสั่ง",
};
Blockly.Msg.VOICE_TRIGGER = {
  "zh-CN": "语音指令 %1 %2 %3",
  "en-US": "Voice Trigger %1 %2 %3",
  "ja-JP": "音声トリガー %1 %2 %3",
  "zh-TW": "語音指令 %1 %2 %3",
  "th-TH": "语音คำสั่ง %1 %2 %3",
};
Blockly.Msg.GESTURE_TRIGGER = {
  "zh-CN": "手势指令 %1 %2 %3",
  "en-US": "Gesture Trigger %1 %2 %3",
  "ja-JP": "ジェスチャートリガー %1 %2 %3",
  "zh-TW": "手勢指令 %1 %2 %3",
  "th-TH": "手势คำสั่ง %1 %2 %3",
};
// 语音指令 Voice Command
Blockly.Msg.VOICE_TRIGGER_SCALE_UP = {
  "zh-CN": "放大",
  "en-US": "Scale Up",
  "ja-JP": "拡大",
  "zh-TW": "放大",
  "th-TH": "ขยาย",
};
Blockly.Msg.VOICE_TRIGGER_SCALE_DOWN = {
  "zh-CN": "缩小",
  "en-US": "Scale Down",
  "ja-JP": "縮小",
  "zh-TW": "縮小",
  "th-TH": "ย่อ",
};
Blockly.Msg.VOICE_TRIGGER_DECOMPOSE = {
  "zh-CN": "分解",
  "en-US": "Decompose",
  "ja-JP": "分解",
  "zh-TW": "分解",
  "th-TH": "สลายตัว",
};
Blockly.Msg.VOICE_TRIGGER_RESET = {
  "zh-CN": "还原",
  "en-US": "Reset",
  "ja-JP": "復元",
  "zh-TW": "還原",
  "th-TH": "เรียกคืน",
};
Blockly.Msg.VOICE_TRIGGER_GO_BACK = {
  "zh-CN": "返回",
  "en-US": "Go Back",
  "ja-JP": "戻る",
  "zh-TW": "返回",
  "th-TH": "ย้อนกลับ",
};

// 手势指令 Gesture Command
Blockly.Msg.GESTURE_TRIGGER_OK = {
  "zh-CN": "OK",
  "en-US": "OK",
  "ja-JP": "OK",
  "zh-TW": "OK",
  "th-TH": "ตกลง",
};
Blockly.Msg.GESTURE_TRIGGER_FIST = {
  "zh-CN": "握拳",
  "en-US": "Fist",
  "ja-JP": "握り拳",
  "zh-TW": "握拳",
  "th-TH": "กำปั้น",
};

// 视频video
export const VIDEO_NAME = {
  "zh-CN": "视频",
  "en-US": "Video",
  "ja-JP": "ビデオ",
  "zh-TW": "視頻",
  "th-TH": "วิดีโอ",
};
Blockly.Msg.VIDEO_VIDEO = {
  "zh-CN": "视频 %1",
  "en-US": "Video %1",
  "ja-JP": "ビデオ %1",
  "zh-TW": "視頻 %1",
  "th-TH": "วิดีโอ %1",
};
Blockly.Msg.VIDEO_PLAY = {
  "zh-CN": "播放视频 %1",
  "en-US": "Play Video %1",
  "ja-JP": "ビデオを再生 %1",
  "zh-TW": "播放視頻 %1",
  "th-TH": "เล่นวิดีโอ %1",
};
Blockly.Msg.VIDEO_PAUSE = {
  "zh-CN": "暂停视频 %1",
  "en-US": "Pause Video %1",
  "ja-JP": "ビデオを一時停止 %1",
  "zh-TW": "暫停視頻 %1",
  "th-TH": "หยุดชั่วคราววิดีโอ %1",
};
Blockly.Msg.VIDEO_STOP = {
  "zh-CN": "终止视频 %1",
  "en-US": "Stop Video %1",
  "ja-JP": "ビデオを停止 %1",
  "zh-TW": "終止視頻 %1",
  "th-TH": "หยุดวิดีโอ %1",
};
Blockly.Msg.VIDEO_AUTOPLAY = {
  "zh-CN": "自动播放/暂停 视频 %1",
  "en-US": "Auto Play/Pause Video %1",
  "ja-JP": "自動再生/一時停止 ビデオ %1",
  "zh-TW": "自動播放/暫停 視頻 %1",
  "th-TH": "เล่นอัตโนมัติ/หยุดชั่วคราว วิดีโอ %1",
};

// 颜色 Colors
export const COLOR_NAME = {
  "zh-CN": "颜色",
  "en-US": "Color",
  "ja-JP": "色",
  "zh-TW": "顏色",
  "th-TH": "สี",
};

Blockly.Msg.COLOR_NONE = {
  "zh-CN": "none",
  "en-US": "none",
  "ja-JP": "none",
  "zh-TW": "none",
  "th-TH": "none",
};

Blockly.Msg.COLOR_WHITE = {
  "zh-CN": "白色",
  "en-US": "white",
  "ja-JP": "白",
  "zh-TW": "白色",
  "th-TH": "白色",
};

Blockly.Msg.COLOR_RED = {
  "zh-CN": "红色",
  "en-US": "red",
  "ja-JP": "赤",
  "zh-TW": "紅色",
  "th-TH": "แดง",
};

Blockly.Msg.COLOR_ORANGE = {
  "zh-CN": "橙色",
  "en-US": "orange",
  "ja-JP": "オレンジ",
  "zh-TW": "橙色",
  "th-TH": "橙色",
};

Blockly.Msg.COLOR_YELLOW = {
  "zh-CN": "黄色",
  "en-US": "yellow",
  "ja-JP": "黄",
  "zh-TW": "黃色",
  "th-TH": "เหลือง",
};

Blockly.Msg.COLOR_GREEN = {
  "zh-CN": "绿色",
  "en-US": "green",
  "ja-JP": "緑",
  "zh-TW": "綠色",
  "th-TH": "เขียว",
};

Blockly.Msg.COLOR_CYAN = {
  "zh-CN": "青色",
  "en-US": "cyan",
  "ja-JP": "シアン",
  "zh-TW": "青色",
  "th-TH": "青色",
};

Blockly.Msg.COLOR_BLUE = {
  "zh-CN": "蓝色",
  "en-US": "blue",
  "ja-JP": "青",
  "zh-TW": "藍色",
  "th-TH": "น้ำเงิน",
};

Blockly.Msg.COLOR_PURPLE = {
  "zh-CN": "紫色",
  "en-US": "purple",
  "ja-JP": "紫",
  "zh-TW": "紫色",
  "th-TH": "ม่วง",
};

//TooltipVisual
Blockly.Msg.TOOLTIP_VISUAL = {
  "zh-CN": "节点 %1 的 标签 显示/隐藏 %2",
  "en-US": "Point %1 label show/hide %2",
  "ja-JP": "エンティティ %1 のラベルを表示/非表示 %2",
  "zh-TW": "節點 %1 的 标签 顯示/隱藏 %2",
  "th-TH": "โหนด %1 的 标签 แสดง/ซ่อน %2",
};

Blockly.Msg.TOOLTIPS_VISUAL = {
  "zh-CN": "所有节点上的 标签 显示/隐藏 %1",
  "en-US": "All Points' label show/hide %1",
  "ja-JP": "すべてのエンティティのラベルを表示/非表示 %1",
  "zh-TW": "所有節點上的 标签 顯示/隱藏 %1",
  "th-TH": "所有โหนด上的 标签 แสดง/ซ่อน %1",
};
