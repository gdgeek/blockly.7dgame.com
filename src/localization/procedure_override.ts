/**
 * 覆盖Blockly函数模块的本地化文本
 */

import * as Blockly from "blockly";

export function overrideProcedureMessages(): void {
  // 覆盖函数块相关的本地化文本
  Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = "函数名";
  Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = "函数名";

  //   Blockly.Msg.PROCEDURES_BEFORE_PARAMS = "输入参数:";

  Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = "输入参数:";

  //   Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT = "描述这个函数...";
  //   Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT = "描述这个函数...";

  const currentLang = (window.lg || "").toLowerCase();

  // 覆盖函数块 tooltip（在 setLocale 之后执行，确保不会被默认语言包覆盖）
  if (currentLang.includes("zh-cn")) {
    Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP =
      "创建一个不带输出值的函数。作用：把一组可复用步骤封装起来，通过函数名在其他地方重复调用，避免重复拼积木。";
    Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP =
      "创建一个带输出值的函数。作用：在执行一组逻辑后返回一个结果，供条件判断、计算或赋值继续使用。";
    Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP =
      "如果条件成立，就立即返回一个值或直接结束当前函数。作用：用于提前结束函数，避免继续执行后续逻辑。";
    Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP =
      "运行这个不带返回值的函数。作用：用于触发一段封装好的流程，不需要接收结果。";
    Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP =
      "运行这个带返回值的函数，并得到其返回结果。作用：把函数结果作为表达式输入到计算或判断中。";
  }

  if (window.lg === "en") {
    Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = "Function name";
    Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = "Function name";
    Blockly.Msg.PROCEDURES_BEFORE_PARAMS = "Input parameters:";
    Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = "Input parameter:";
  }

  if (window.lg === "ja") {
    Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = "関数名";
    Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = "関数名";
    Blockly.Msg.PROCEDURES_BEFORE_PARAMS = "入力パラメータ:";
    Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = "入力パラメータ:";
  }

  if (window.lg === "zh-tw") {
    Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = "函數名";
    Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = "函數名";
    Blockly.Msg.PROCEDURES_BEFORE_PARAMS = "輸入參數:";
    Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = "輸入參數:";
  }

  if (window.lg === "th") {
    Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = "ชื่อฟังก์ชัน";
    Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = "ชื่อฟังก์ชัน";
    Blockly.Msg.PROCEDURES_BEFORE_PARAMS = "พารามิเตอร์อินพุต:";
    Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = "พารามิเตอร์อินพุต:";
  }
}
