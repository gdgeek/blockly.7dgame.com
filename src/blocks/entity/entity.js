import DataType from "./type";
import * as Blockly from "blockly";
import { Handler } from "../helper";
import { HandlerJS } from "../helperJS";
const data = {
  name: "entity",
};
const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      message0: Blockly.Msg.ENTITY_ENTITY[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Entity",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.entity) {
              const entity = resource.entity;
              entity.forEach((ent) => {
                opt.push([ent.name, ent.uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Entity",
      colour: DataType.colour,
      tooltip: "",
      helpUrl: "",
    };
    return json;
  },
  getBlock: function (parameters) {
    const data = {
      init: function () {
        const json = block.getBlockJson(parameters);
        this.jsonInit(json);
        
        // 保存原始参数
        this.blockParameters = parameters;
        // 保存原始下拉选项
        this.originalOptions = this.getOriginalOptions();
        // 保存当前的tooltips信息和连接信息
        this.tooltipsData = null;
        // 保存父块信息，用于检测断开连接
        this.parentBlockId = null;
        
        // 监听块的变化事件
        this.setOnChange((event) => {
          if (event.type === Blockly.Events.BLOCK_CHANGE ||
              event.type === Blockly.Events.BLOCK_MOVE) {
            // 检测是否断开了与visual_tooltip的连接
            this.checkConnectionState();
          }
        });
      },
      
      // 获取原始选项
      getOriginalOptions: function() {
        let opt = [["none", ""]];
        const resource = this.blockParameters && this.blockParameters.resource;
        if (resource && resource.entity) {
          resource.entity.forEach((ent) => {
            opt.push([ent.name, ent.uuid]);
          });
        }
        return opt;
      },
      
      // 检测连接状态
      checkConnectionState: function() {
        // 获取父块
        const parentBlock = this.getParent();
        const parentBlockId = parentBlock ? parentBlock.id : null;
        
        // 如果有tooltipsData但没有父块，或者父块ID变了，说明断开了连接
        if (this.tooltipsData && 
            (parentBlockId === null || parentBlockId !== this.tooltipsData.sourceBlockId)) {
          // 恢复原始选项
          this.restoreOriginalOptions();
          this.tooltipsData = null;
          this.parentBlockId = null;
        }
        
        // 更新父块ID
        this.parentBlockId = parentBlockId;
      },
      
      // 恢复原始选项
      restoreOriginalOptions: function() {
        const field = this.getField("Entity");
        if (!field) return;
        
        // 恢复原始选项
        field.menuGenerator_ = this.originalOptions;
        
        // 强制重新渲染
        field.forceRerender();
      },
      
      // 根据tooltipsData更新实体选项
      updateEntityOptions: function(tooltipsData) {
        if (!tooltipsData || !tooltipsData.tooltipsInfo || tooltipsData.tooltipsInfo.length === 0) return;
        
        // 保存tooltipsData，包括来源块ID
        this.tooltipsData = tooltipsData;
        this.parentBlockId = tooltipsData.sourceBlockId;
        
        // 获取字段
        const field = this.getField("Entity");
        if (!field) return;
        
        // 获取当前值
        const currentValue = field.getValue();
        
        // 检查实体列表中是否有匹配的parentUuid
        const resource = this.blockParameters && this.blockParameters.resource;
        if (!resource || !resource.entity) return;
        
        // 收集所有匹配的实体
        const matchedEntities = [];
        const parentUuids = tooltipsData.tooltipsInfo.map(info => info.parentUuid);
        
        // 查找所有匹配parentUuid的实体
        resource.entity.forEach(entity => {
          if (parentUuids.includes(entity.uuid)) {
            matchedEntities.push([entity.name, entity.uuid]);
          }
        });
        
        if (matchedEntities.length > 0) {
          // 显示匹配的实体选项
          const options = [["none", ""], ...matchedEntities];
          field.menuGenerator_ = options;
          
          // 如果当前值不在匹配列表中，重置为空
          if (!parentUuids.includes(currentValue) && currentValue !== "") {
            field.setValue("");
          }
        } else {
          // 如果没有匹配的实体，只显示none选项
          field.menuGenerator_ = [["none", ""]];
          field.setValue("");
        }
        
        // 强制重新渲染
        field.forceRerender();
      }
    };
    return data;
  },
  getJavascript(parameters) {
    const script = function (block, generator) {
      const dropdown = block.getFieldValue("Entity");
      // const code = `HandlerJS("${dropdown}")`;
      return [HandlerJS(dropdown), generator.ORDER_NONE];
    };
    return script;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown = block.getFieldValue("Entity");

      return [Handler(dropdown), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};
export default block;
