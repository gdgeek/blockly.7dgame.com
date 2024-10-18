import * as Blockly from "blockly";

const urlParams = new URLSearchParams(window.location.search);
let lg = urlParams.get("language") || "en";
if (lg === "zh-cn") {
  lg = "zh";
}
window.lg = lg; // 将 lg 挂载到全局 window 对象上
console.log("当前语言是: ", window.lg); // 在这里输出当前语言

export const LOGIC_NAME = {
  zh: "逻辑",
  en: "Logic",
  ja: "ロジック",
};

export const LOOP_NAME = {
  zh: "循环",
  en: "Loop",
  ja: "ループ",
};

export const MATH_NAME = {
  zh: "数学",
  en: "Math",
  ja: "数学",
};

export const TEXTS_NAME = {
  zh: "文本",
  en: "Texts",
  ja: "テキスト",
};

export const LIST_NAME = {
  zh: "列表",
  en: "List",
  ja: "リスト",
};

// data
export const DATA_NAME = {
  zh: "数据",
  en: "Data",
  ja: "データ",
};
Blockly.Msg.DATA_TRANSFORM_DATA = {
  zh: "位置 %1 旋转 %2 缩放 %3",
  en: "Position %1 Rotate %2 Scale %3",
  ja: "位置 %1 回転 %2 スケール %3",
};

// 任务
export const TASK_NAME = {
  zh: "任务",
  en: "Task",
  ja: "タスク",
};
Blockly.Msg.TASK_TWEEN_TO_DATA = {
  zh: "物体 %1 移动到 %2 用时 %3 %4 差值方式 %5",
  en: "Move object %1 to %2 in %3 %4 easing method %5",
  ja: "オブジェクト %1 を %2 まで %3 %4 の方法で移動 %5",
};
Blockly.Msg.TASK_TWEEN_OBJECT = {
  zh: "物体 %1 移动到目标 %2 用时 %3 %4 差值方式 %5",
  en: "Move object %1 to target %2 in %3 %4 easing method %5",
  ja: "オブジェクト %1 をターゲット %2 まで %3 %4 の方法で移動 %5",
};
Blockly.Msg.TASK_ARRAY = {
  zh: "任务数组 %1 %2",
  en: "Task array %1 %2",
  ja: "タスク配列 %1 %2",
};
Blockly.Msg.TASK_CIRCLE = {
  zh: "任务循环 %1 %2",
  en: "Task loop %1 %2",
  ja: "タスクループ %1 %2",
};
Blockly.Msg.TASK_RUN = {
  zh: "启动任务 %1",
  en: "Start task %1",
  ja: "タスク %1 を開始する",
};
Blockly.Msg.TASK_SLEEP = {
  zh: "休眠： %1 秒",
  en: "Sleep: %1 seconds",
  ja: "スリープ: %1 秒",
};
Blockly.Msg.TASK_PLAY_SOUND_TASK = {
  zh: "播放音频 %1 任务",
  en: "Play audio %1 task",
  ja: "オーディオ %1 タスクを再生する",
};
Blockly.Msg.TASK_PLAY_ANIMATION_TASK = {
  zh: "播放动画 %1 任务",
  en: "Play animation %1 task",
  ja: "アニメーション %1 タスクを再生する",
};
Blockly.Msg.TASK_SYSTEM_TASK = {
  zh: "系统方法： %1 参数 %2",
  en: "System method: %1 parameter %2",
  ja: "システムメソッド: %1 パラメーター %2",
};

// 参数
export const PARAMETER_NAME = {
  zh: "参数",
  en: "Parameter",
  ja: "パラメーター",
};
Blockly.Msg.PARAMETER_BOOLEAN = {
  zh: "布尔参数! %1",
  en: "Boolean parameter! %1",
  ja: "ブールパラメーター! %1",
};
Blockly.Msg.PARAMETER_NUMBER = {
  zh: "数字参数! %1",
  en: "Number parameter! %1",
  ja: "数値パラメーター! %1",
};
Blockly.Msg.PARAMETER_STRING = {
  zh: "字符参数! %1",
  en: "String parameter! %1",
  ja: "文字列パラメーター! %1",
};
Blockly.Msg.PARAMETER_PARAMETERS = {
  zh: "参数列表! %1",
  en: "Parameter list! %1",
  ja: "パラメーターリスト! %1",
};
Blockly.Msg.PARAMETER_SYSTEM = {
  zh: "系统参数： %1",
  en: "System parameter: %1",
  ja: "システムパラメーター: %1",
};
Blockly.Msg.PARAMETER_PLAYER = {
  zh: "玩家 %1 ,参数 %2",
  en: "Player %1, parameter %2",
  ja: "プレイヤー %1, パラメーター %2",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_INDEX = {
  zh: "索引",
  en: "Index",
  ja: "インデックス",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_SERVER = {
  zh: "服务器",
  en: "Server",
  ja: "サーバー",
};
Blockly.Msg.PARAMETER_PLAYER_OPTIONS_RANDOM_CLIENT = {
  zh: "随机客户",
  en: "Random client",
  ja: "ランダムクライアント",
};
Blockly.Msg.PARAMETER_RECTANGLE = {
  zh: "范围随机点 %1 中点 %2 半径 %3",
  en: "Random point in range %1, center %2, radius %3",
  ja: "範囲内のランダムポイント %1, 中心 %2, 半径 %3",
};
Blockly.Msg.PARAMETER_POINT = {
  zh: "位置参数 %1",
  en: "Position parameter %1",
  ja: "位置パラメーター %1",
};

// Meta
export const META_NAME = {
  zh: "组件",
  en: "Meta",
  ja: "メタ",
};
Blockly.Msg.META_ACTION = {
  zh: "动作 %1 %2 %3",
  en: "Action %1 %2 %3",
  ja: "アクション %1 %2 %3",
};
Blockly.Msg.META_RUN = {
  zh: "启动任务 %1",
  en: "Start task %1",
  ja: "タスク %1 を開始する",
};

// Trigger
export const TRIGGER_NAME = {
  zh: "动作",
  en: "Action",
  ja: "アクション",
};
Blockly.Msg.TRIGGER_ACTION_EXECUTE = {
  zh: "动作 %1 %2",
  en: "Action %1 %2",
  ja: "アクション %1 %2",
};
Blockly.Msg.TRIGGER_ACTION_TRIGGER = {
  zh: "动作 %1 %2 %3",
  en: "Action %1 %2 %3",
  ja: "アクション %1 %2 %3",
};
Blockly.Msg.TRIGGER_INIT = {
  zh: "初始化 %1 %2",
  en: "Initialize %1 %2",
  ja: "初期化 %1 %2",
};
Blockly.Msg.TRIGGER_DESTROY = {
  zh: "销毁 %1 %2",
  en: "Destroy %1 %2",
  ja: "破棄 %1 %2",
};
Blockly.Msg.TRIGGER_UPDATE = {
  zh: "更新 %1 %2",
  en: "Update %1 %2",
  ja: "更新 %1 %2",
};

// Event
export const EVENT_NAME = {
  zh: "事件",
  en: "Event",
  ja: "イベント",
};
Blockly.Msg.EVENT_INPUT = {
  zh: "输入事件 %1 %2 %3",
  en: "Input Event %1 %2 %3",
  ja: "入力イベント %1 %2 %3",
};
Blockly.Msg.EVENT_OUTPUT = {
  zh: "输出事件 %1",
  en: "Output Event %1",
  ja: "出力イベント %1",
};

// 实体entity
export const ENTITY_NAME = {
  zh: "实体",
  en: "Entity",
  ja: "エンティティ",
};
Blockly.Msg.ENTITY_ENTITY = {
  zh: "实体 %1",
  en: "Entity %1",
  ja: "エンティティ %1",
};
Blockly.Msg.ENTITY_VISUAL_EXECUTE = {
  zh: "实体 %1 显示/隐藏 %2 %3",
  en: "Entity %1 Show/Hide %2 %3",
  ja: "エンティティ %1 表示/非表示 %2 %3",
};

// 模型ploygen
export const POLYGEN_NAME = {
  zh: "模型",
  en: "Polygen",
  ja: "ポリゴン",
};
Blockly.Msg.POLYGEN_POLYGEN_ENTITY = {
  zh: "模型 %1",
  en: "Polygen %1",
  ja: "モデル %1",
};
Blockly.Msg.POLYGEN_PLAY_ANIMATION = {
  zh: "播放模型动画 %1 %2",
  en: "Play polygen Animation %1 %2",
  ja: "モデルアニメーションを再生 %1 %2",
};

// 图片picture
export const PICTURE_NAME = {
  zh: "图片",
  en: "Picture",
  ja: "画像",
};
Blockly.Msg.PICTURE_PICTURE = {
  zh: "图片 %1",
  en: "Picture %1",
  ja: "画像 %1",
};

// 文字text
export const TEXT_NAME = {
  zh: "文字",
  en: "Text",
  ja: "テキスト",
};
Blockly.Msg.TEXT_TEXT = {
  zh: "文字 %1",
  en: "Text %1",
  ja: "テキスト %1",
};
Blockly.Msg.TEXT_SET = {
  zh: "文本 %1 设置为 %2",
  en: "Text %1 set to %2",
  ja: "テキスト %1 を %2 に設定する",
};

// 音频sound
export const SOUND_NAME = {
  zh: "音频",
  en: "Audio",
  ja: "サウンド",
};
Blockly.Msg.SOUND_SOUND = {
  zh: "音频 %1",
  en: "Audio %1",
  ja: "サウンド %1",
};
Blockly.Msg.SOUND_PLAY = {
  zh: "播放音频 %1",
  en: "Play Audio %1",
  ja: "サウンドを再生 %1",
};

// 体素voxel
export const VOXEL_NAME = {
  zh: "体素",
  en: "Voxel",
  ja: "ボクセル",
};
Blockly.Msg.VOXEL_VOXEL = {
  zh: "体素 %1",
  en: "Voxel %1",
  ja: "ボクセル %1",
};

// 其他other
export const OTHER_NAME = {
  zh: "其他",
  en: "Other",
  ja: "その他",
};
Blockly.Msg.OTHER_SLEEP = {
  zh: "休眠 %1 秒",
  en: "Sleep %1 seconds",
  ja: "スリープ %1 秒",
};

// 信号signal
export const SIGNAL_NAME = {
  zh: "信号",
  en: "Signal",
  ja: "シグナル",
};
Blockly.Msg.SIGNAL_OUTPUT_SIGNAL = {
  zh: "触发信号 %1",
  en: "Trigger signal %1",
  ja: "信号 %1 をトリガーする",
};
Blockly.Msg.SIGNAL_INPUT_SIGNAL = {
  zh: "接收信号 %1 %2 %3",
  en: "Receive signal %1 %2 %3",
  ja: "信号 %1 %2 %3 を受信する",
};
Blockly.Msg.SIGNAL_OUTPUT_SIGNAL_WITH_PARAMETER = {
  zh: "触发信号 %1 参数 %2",
  en: "Trigger signal %1 parameter %2",
  ja: "信号 %1 パラメーター %2 をトリガーする",
};
Blockly.Msg.SIGNAL_INIT_SIGNAL = {
  zh: "初始化 %1 %2",
  en: "Initialize %1 %2",
  ja: "初期化 %1 %2",
};

export const VARIABLE_NAME = {
  zh: "变量",
  en: "Variable",
  ja: "変数",
};

export const PROCEDURE_NAME = {
  zh: "函数",
  en: "Procedure",
  ja: "プロシージャ",
};
