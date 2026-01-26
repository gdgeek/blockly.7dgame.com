import * as Blockly from "blockly";
import LogType from "./type";

const data = {
    name: "log_key_value",
};

const block = {
    title: data.name,
    type: LogType.name,
    colour: LogType.colour,
    getBlockJson({ resource }) {
        return {
            type: LogType.name,
            message0: Blockly.Msg.LOG_KEY_VALUE[window.lg],
            args0: [
                {
                    type: "field_dropdown",
                    name: "DATATYPE",
                    options: [
                        [Blockly.Msg.LOG_RECORD[window.lg], "record"],
                        [Blockly.Msg.LOG_WARNING[window.lg], "warning"],
                        [Blockly.Msg.LOG_ERROR[window.lg], "error"],
                    ],
                },
                {
                    type: "field_input",
                    name: "KEY",
                    text: "log_key",
                },
                {
                    type: "input_value",
                    name: "VALUE",
                    check: ["String", "Number", "Boolean", "Variable"],
                },
            ],
            inputsInline: true,
            previousStatement: null,
            nextStatement: null,
            colour: LogType.colour,
            tooltip: Blockly.Msg.LOG_KEY_VALUE_TOOLTIP[window.lg],
            helpUrl: "",
        };
    },
    getBlock: function (parameters) {
        return {
            init: function () {
                const json = block.getBlockJson(parameters);
                this.jsonInit(json);

                const keyField = this.getField("KEY");
                if (keyField) {
                    keyField.setValidator(function (newValue) {
                        return newValue.replace(/[^a-zA-Z0-9_\-\.~]/g, "");
                    });
                }
            },
        };
    },
    getJavascript(parameters) {
        return function (block, generator) {
            const dataType = block.getFieldValue("DATATYPE");
            const key = block.getFieldValue("KEY");
            const value = generator.valueToCode(
                block,
                "VALUE",
                generator.ORDER_ATOMIC
            ) || "''";

            let code = "";

            code = `log.post("${dataType}", "${key}", String(${value}));\n`;
            return code;
        };
    },
    getLua(parameters) {
        return function (block, generator) {
            const dataType = block.getFieldValue("DATATYPE");
            const key = block.getFieldValue("KEY");
            const value = generator.valueToCode(
                block,
                "VALUE",
                generator.ORDER_ATOMIC
            ) || "''";

            const code = `log.post("${dataType}", "${key}", tostring(${value}))\n`;
            return code;
        };
    },
    toolbox: {
        kind: "block",
        type: data.name,
    },
};

export default block;
