import * as Blockly from "blockly";

const urlParams = new URLSearchParams(window.location.search);
let lg = urlParams.get("language") || "en";
if (lg === "zh-cn") {
  lg = "zh";
}
window.lg = lg; // 将 lg 挂载到全局 window 对象上
console.log("当前语言是: ", window.lg);

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
Blockly.Msg.TASK_PLAY_VIDEO_TASK = {
  zh: "播放视频 %1 任务",
  en: "Play video %1 task",
  ja: "ビデオ %1 タスクを再生する",
};
Blockly.Msg.TASK_PLAY_ANIMATION_TASK = {
  zh: "播放动画 模型 %1 动画 %2 任务",
  en: "Play animation polygen %1 animation %2 task",
  ja: "モデル %1 アニメーション %2 タスクを再生する",
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
  zh: "布尔参数 %1",
  en: "Boolean parameter! %1",
  ja: "ブールパラメーター! %1",
};
Blockly.Msg.PARAMETER_NUMBER = {
  zh: "数字参数 %1",
  en: "Number parameter! %1",
  ja: "数値パラメーター! %1",
};
Blockly.Msg.PARAMETER_STRING = {
  zh: "字符参数 %1",
  en: "String parameter! %1",
  ja: "文字列パラメーター! %1",
};
Blockly.Msg.PARAMETER_PARAMETERS = {
  zh: "参数列表 %1",
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
Blockly.Msg.PARAMETER_ENTITY = {
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

// 节点entity
export const ENTITY_NAME = {
  zh: "节点",
  en: "Point",
  ja: "エンティティ",
};
Blockly.Msg.ENTITY_ENTITY = {
  zh: "节点 %1",
  en: "Point %1",
  ja: "エンティティ %1",
};
Blockly.Msg.ENTITY_VISUAL_EXECUTE = {
  zh: "节点 %1 显示/隐藏 %2 %3",
  en: "Point %1 Show/Hide %2 %3",
  ja: "エンティティ %1 表示/非表示 %2 %3",
};
Blockly.Msg.ENTITY_ENTITY_HIGHLIGHT = {
  zh: "节点 %1 高亮 %2 颜色 %3",
  en: "Point %1 highlight %2 color %3",
  ja: "エンティティ %1 をハイライト %2 色 %3",
}
Blockly.Msg.ENTITY_MOVABLE = {
  zh: "节点 %1 是否可移动 %2",
  en: "Point %1 is movable %2",
  ja: "エンティティ %1 が移動可能かどうかをフィルタリングする %2",
};
Blockly.Msg.ENTITY_MOVABLE_ALL = {
  zh: "所有节点是否可移动 %1",
  en: "All points are movable %1",
  ja: "すべてのエンティティが移動可能かどうかをフィルタリングする %1",
};
Blockly.Msg.ENTITY_ROTATABLE = {
  zh: "节点 %1 是否自旋转 %2",
  en: "Point %1 is rotatable %2",
  ja: "エンティティ %1 が自動回転可能かどうかをフィルタリングする %2",
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
  zh: "模型 %1 播放动画 %2",
  en: "Polygen %1 play animation %2",
  ja: "モデル %1 アニメーションを再生 %2",
};
Blockly.Msg.POLYGEN_POLYGEN_HIGHLIGHT = {
  zh: "模型 %1 高亮 %2 颜色 %3",
  en: "Polygen %1 highlight %2 color %3",
  ja: "モデル %1 ハイライト %2 色 %3",
};

Blockly.Msg.POLYGEN_MOVABLE = {
  zh: "模型 %1 是否移动 %2",
  en: "Polygen %1 is movable %2",
  ja: "モデル %1 が移動可能かどうかをフィルタリングする %2",
};
Blockly.Msg.POLYGEN_MOVABLE_ALL = {
  zh: "所有模型 是否移动 %1",
  en: "All polygens is movable %1",
  ja: "すべてのモデルが移動可能かどうかをフィルタリングする %1",
};
Blockly.Msg.POLYGEN_ROTATABLE = {
  zh: "模型 %1 是否自旋转 %2",
  en: "Polygen %1 is rotatable %2",
  ja: "モデル %1 が自動回転可能かどうかをフィルタリングする %2",
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
Blockly.Msg.SOUND_PAUSE = {
  zh: "暂停音频 %1",
  en: "Pause Audio %1",
  ja: "サウンドを一時停止 %1",
};
Blockly.Msg.SOUND_STOP = {
  zh: "终止音频 %1",
  en: "Stop Audio %1",
  ja: "サウンドを停止 %1",
};
Blockly.Msg.SOUND_AUTOPLAY = {
  zh: "自动播放/暂停 音频 %1",
  en: "Auto Play/Pause Audio %1",
  ja: "自動再生/一時停止 サウンド %1",
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


// 管理signal
export const MANAGER_NAME = {
  zh: "管理",
  en: "Manager",
  ja: "マネージャー",
};

Blockly.Msg.GAME_ADD_SCORE = {
  zh: "增加分数 %1",
  en: "Add Score %1",
  ja: "スコアを追加 %1",
};

Blockly.Msg.GAME_RESET = {
  zh: "重置游戏",
  en: "Reset Game",
  ja: "ゲームをリセット",
};


Blockly.Msg.GAME_COUNTDOWN = {
  zh: "倒计时 秒数 %1",
  en: "Countdown Seconds %1",
  ja: "カウントダウン 秒数 %1",
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

// 语音Voice
export const VOICE_NAME = {
  zh: "语音",
  en: "Voice",
  ja: "音声",
};
Blockly.Msg.VOICE_TRIGGER = {
  zh: "语音指令 %1 %2 %3",
  en: "Voice Trigger %1 %2 %3",
  ja: "音声トリガー %1 %2 %3",
};

Blockly.Msg.VOICE_TRIGGER_SCALE_UP = {
  zh: "放大",
  en: "Scale Up",
  ja: "拡大",
};

Blockly.Msg.VOICE_TRIGGER_SCALE_DOWN = {
  zh: "缩小",
  en: "Scale Down",
  ja: "縮小",
};

Blockly.Msg.VOICE_TRIGGER_DECOMPOSE = {
  zh: "分解",
  en: "Decompose",
  ja: "分解",
};

Blockly.Msg.VOICE_TRIGGER_RESET = {
  zh: "还原",
  en: "Reset",
  ja: "復元",
};

Blockly.Msg.VOICE_TRIGGER_NEXT_STEP = {
  zh: "下一步",
  en: "Next Step",
  ja: "次のステップ",
};

Blockly.Msg.VOICE_TRIGGER_RETURN_MAIN = {
  zh: "返回主界面",
  en: "Return to Main",
  ja: "メインに戻る",
};

Blockly.Msg.VOICE_TRIGGER_CLOSE_TOOLTIP = {
  zh: "关闭说明卡",
  en: "Close Tooltip",
  ja: "ツールチップを閉じる",
};

Blockly.Msg.VOICE_TRIGGER_OPEN_TOOLTIP = {
  zh: "显示说明卡",
  en: "Open Tooltip",
  ja: "ツールチップを開く",
};

Blockly.Msg.VOICE_TRIGGER_VERTICAL = {
  zh: "垂直展示",
  en: "Vertical",
  ja: "垂直展示",
};

Blockly.Msg.VOICE_TRIGGER_HORIZONTAL = {
  zh: "水平展示",
  en: "Horizontal",
  ja: "水平展示",
};

Blockly.Msg.VOICE_TRIGGER_HIDDEN = {
  zh: "隐藏模式",
  en: "Hidden",
  ja: "隠しモード",
};

Blockly.Msg.VOICE_TRIGGER_VISIBLE = {
  zh: "显示模式",
  en: "Visible",
  ja: "表示モード",
};
Blockly.Msg.VOICE_TRIGGER_SHOW_YUELU = {
  zh: '展示岳麓山校区',
  en: 'Show Yuelu Campus',
  ja: '岳麓山キャンパスを表示'
};

Blockly.Msg.VOICE_TRIGGER_SHOW_LUNAN = {
  zh: '展示麓南校区',
  en: 'Show Lunan Campus',
  ja: '麓南キャンパスを表示'
};

Blockly.Msg.VOICE_TRIGGER_SHOW_XIAOXIANG = {
  zh: '展示潇湘校区',
  en: 'Show Xiaoxiang Campus',
  ja: '潇湘キャンパスを表示'
};

Blockly.Msg.VOICE_TRIGGER_SHOW_TIANXIN = {
  zh: '展示天心校区',
  en: 'Show Tianxin Campus',
  ja: '天心キャンパスを表示'
};

Blockly.Msg.VOICE_TRIGGER_SHOW_XINGLIN = {
  zh: '展示杏林校区',
  en: 'Show Xinglin Campus',
  ja: '杏林キャンパスを表示'
};

Blockly.Msg.VOICE_TRIGGER_SHOW_KAIFU = {
  zh: '展示开福校区',
  en: 'Show Kaifu Campus',
  ja: '開福キャンパスを表示'
};

Blockly.Msg.VOICE_TRIGGER_GO_BACK = {
  zh: '返回',
  en: 'Go Back',
  ja: '戻る'
};

Blockly.Msg.VOICE_TRIGGER_BGM_ON = {
  zh: '打开背景音乐',
  en: 'Play Background Music',
  ja: '背景音楽を再生'
};

Blockly.Msg.VOICE_TRIGGER_BGM_OFF = {
  zh: '关闭背景音乐',
  en: 'Stop Background Music',
  ja: '背景音楽を停止'
};

Blockly.Msg.VOICE_TRIGGER_SANDBOX_FX_ON = {
  zh: '打开沙盘特效',
  en: 'Enable Sandbox Effects',
  ja: 'サンドボックスエフェクトを有効化'
};

Blockly.Msg.VOICE_TRIGGER_SANDBOX_FX_OFF = {
  zh: '关闭沙盘特效',
  en: 'Disable Sandbox Effects',
  ja: 'サンドボックスエフェクトを無効化'
};
Blockly.Msg.VOICE_TRIGGER_SANDBOX_ROTATE_ON = {
  zh: '打开沙盘旋转',
  en: 'Enable Sandbox Rotation',
  ja: 'サンドボックスの回転を開始'
};
Blockly.Msg.VOICE_TRIGGER_SANDBOX_ROTATE_OFF = {
  zh: '关闭沙盘旋转',
  en: 'Disable Sandbox Rotation',
  ja: 'サンドボックスの回転を停止'
};
Blockly.Msg.VOICE_TRIGGER_CAMPUS_INTRO_OFF = {
  zh: '关闭校区介绍',
  en: 'Disable Campus Introduction',
  ja: 'キャンパス紹介を停止'
};
Blockly.Msg.VOICE_TRIGGER_CAMPUS_INTRO_ON = {
  zh: '打开校区介绍',
  en: 'Enable Campus Introduction',
  ja: 'キャンパス紹介を開始'
};


// 视频video
export const VIDEO_NAME = {
  zh: "视频",
  en: "Video",
  ja: "ビデオ",
};
Blockly.Msg.VIDEO_VIDEO = {
  zh: "视频 %1",
  en: "Video %1",
  ja: "ビデオ %1",
};
Blockly.Msg.VIDEO_PLAY = {
  zh: "播放视频 %1",
  en: "Play Video %1",
  ja: "ビデオを再生 %1",
};
Blockly.Msg.VIDEO_PAUSE = {
  zh: "暂停视频 %1",
  en: "Pause Video %1",
  ja: "ビデオを一時停止 %1",
};
Blockly.Msg.VIDEO_STOP = {
  zh: "终止视频 %1",
  en: "Stop Video %1",
  ja: "ビデオを停止 %1",
};
Blockly.Msg.VIDEO_AUTOPLAY = {
  zh: "自动播放/暂停 视频 %1",
  en: "Auto Play/Pause Video %1",
  ja: "自動再生/一時停止 ビデオ %1",
};

// 颜色 Colors
export const COLOR_NAME = {
  zh: "颜色",
  en: "Color",
  ja: "色",
};

Blockly.Msg.COLOR_NONE = {
  zh: "none",
  en: "none",
  ja: "none",
};

Blockly.Msg.COLOR_WHITE = {
  zh: "白色",
  en: "white",
  ja: "白",
};

Blockly.Msg.COLOR_RED = {
  zh: "红色",
  en: "red",
  ja: "赤",
};

Blockly.Msg.COLOR_ORANGE = {
  zh: "橙色",
  en: "orange",
  ja: "オレンジ",
};

Blockly.Msg.COLOR_YELLOW = {
  zh: "黄色",
  en: "yellow",
  ja: "黄",
};

Blockly.Msg.COLOR_GREEN = {
  zh: "绿色",
  en: "green",
  ja: "緑",
};

Blockly.Msg.COLOR_CYAN = {
  zh: "青色",
  en: "cyan",
  ja: "シアン",
};

Blockly.Msg.COLOR_BLUE = {
  zh: "蓝色",
  en: "blue",
  ja: "青",
};

Blockly.Msg.COLOR_PURPLE = {
  zh: "紫色",
  en: "purple",
  ja: "紫",
};

//TooltipVisual
Blockly.Msg.TOOLTIP_VISUAL= {
  zh: "节点 %1 的 标签 显示/隐藏 %2",
  en: "Point %1 label show/hide %2",
  ja: "エンティティ %1 のラベルを表示/非表示 %2",
};

Blockly.Msg.TOOLTIPS_VISUAL = {
  zh: "所有节点上的 标签 显示/隐藏 %1",
  en: "All Points' label show/hide %1",
  ja: "すべてのエンティティのラベルを表示/非表示 %1",
};
