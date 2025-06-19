/**
 * 覆盖Blockly函数模块的本地化文本
 */

import * as Blockly from "blockly";

export function overrideProcedureMessages() {
  // 覆盖函数块相关的本地化文本
  Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = "函数名";
  Blockly.Msg.PROCEDURES_DEFRETURN_PROCEDURE = "函数名";
  
//   Blockly.Msg.PROCEDURES_BEFORE_PARAMS = "输入参数:";
  
  Blockly.Msg.PROCEDURES_MUTATORARG_TITLE = "输入参数:";
  
//   Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT = "描述这个函数...";
//   Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT = "描述这个函数...";
  
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
} 