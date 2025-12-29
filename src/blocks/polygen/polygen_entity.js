import DataType from "./type";
import { Handler } from "../helper";
import * as Blockly from "blockly";

const data = {
  name: "polygen_entity",
};

const block = {
  title: data.name,
  type: DataType.name,
  colour: DataType.colour,
  getBlockJson({ resource }) {
    const json = {
      type: data.name,
      // message0: "模型 %1",
      message0: Blockly.Msg.POLYGEN_POLYGEN_ENTITY[window.lg],
      args0: [
        {
          type: "field_dropdown",
          name: "Polygen",
          options: function () {
            let opt = [["none", ""]];
            if (resource && resource.polygen) {
              const polygen = resource.polygen;
             // console.log("resource: ", resource);
              polygen.forEach((poly) => {
                opt.push([poly.name, poly.uuid]);
              });
            }
            return opt;
          },
        },
      ],
      output: "Polygen",
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
        //console.log("PolygenJSON: ", json);
        this.jsonInit(json);

        // 保存原始参数
        this.blockParameters = parameters;
        // 保存原始下拉选项
        this.originalOptions = this.getOriginalOptions();
        // 保存当前的tooltips信息和连接信息
        this.tooltipsData = null;
        // 保存父块信息，用于检测断开连接
        this.parentBlockId = null;

        // 监听模型切换
        this.setOnChange((event) => {
          const selectedUuid = this.getFieldValue("Polygen");

          // 只有在 Polygen 的 UUID 改变时，才触发更新事件
          if (this.selectedPolygenUuid !== selectedUuid) {
            //console.log("Selected Polygen UUID: ", selectedUuid);
            this.selectedPolygenUuid = selectedUuid;

            // 触发更新事件
            Blockly.Events.fire(
              new Blockly.Events.BlockChange(
                this,
                "field",
                "Polygen",
                "",
                selectedUuid
              )
            );
          }
          
          // 检测是否断开了与visual_tooltip的连接
          if (event.type === Blockly.Events.BLOCK_CHANGE ||
              event.type === Blockly.Events.BLOCK_MOVE) {
            this.checkConnectionState();
          }
        });
      },
      
      // 获取原始选项
      getOriginalOptions: function() {
        let opt = [["none", ""]];
        const resource = this.blockParameters && this.blockParameters.resource;
        if (resource && resource.polygen) {
          resource.polygen.forEach((poly) => {
            opt.push([poly.name, poly.uuid]);
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
        const field = this.getField("Polygen");
        if (!field) return;
        
        // 恢复原始选项
        field.menuGenerator_ = this.originalOptions;
        
        // 强制重新渲染
        field.forceRerender();
      },

      // 更新下拉选项的方法，供其他模块使用
      updateDropdownOptions: function(options) {
        const field = this.getField("Polygen");
        if (!field) return;
        
        // 更新选项
        field.menuGenerator_ = options;
        
        // 检查当前值是否在新选项中存在
        const currentValue = field.getValue();
        if (!options.some(opt => opt[1] === currentValue)) {
          field.setValue("");
        }
      },
      
      // 根据tooltipsData更新实体选项
      updateEntityOptions: function(tooltipsData) {
        if (!tooltipsData || !tooltipsData.tooltipsInfo || tooltipsData.tooltipsInfo.length === 0) return;
        
        // 保存tooltipsData，包括来源块ID
        this.tooltipsData = tooltipsData;
        this.parentBlockId = tooltipsData.sourceBlockId;
        
        // 获取字段
        const field = this.getField("Polygen");
        if (!field) return;
        
        // 获取当前值
        const currentValue = field.getValue();
        
        // 检查模型列表中是否有匹配的parentUuid
        const resource = this.blockParameters && this.blockParameters.resource;
        if (!resource || !resource.polygen) return;
        
        // 收集所有匹配的模型
        const matchedPolygens = [];
        const parentUuids = tooltipsData.tooltipsInfo.map(info => info.parentUuid);
        
        // 查找所有匹配parentUuid的模型
        resource.polygen.forEach(polygen => {
          if (parentUuids.includes(polygen.uuid)) {
            matchedPolygens.push([polygen.name, polygen.uuid]);
          }
        });
        
        if (matchedPolygens.length > 0) {
          // 显示匹配的模型选项
          const options = [["none", ""], ...matchedPolygens];
          field.menuGenerator_ = options;
          
          // 如果当前值不在匹配列表中，重置为空
          if (!parentUuids.includes(currentValue) && currentValue !== "") {
            field.setValue("");
          }
        } else {
          // 如果没有匹配的模型，只显示none选项
          field.menuGenerator_ = [["none", ""]];
          field.setValue("");
        }
        
        // 强制重新渲染
        field.forceRerender();
      }
    };
    return data;
  },

  // getJavascript(parameters) {
  //   return this.getLua(parameters);
  // },
  getJavascript(parameters) {
    const javascript = function (block, generator) {
      var dropdown_polygen = block.getFieldValue("Polygen");
      return [
        `handlePolygen(${JSON.stringify(dropdown_polygen)})`,
        generator.ORDER_NONE,
      ];
    };
    return javascript;
  },
  getLua(parameters) {
    const lua = function (block, generator) {
      var dropdown_polygen = block.getFieldValue("Polygen");
      return [Handler(dropdown_polygen), generator.ORDER_NONE];
    };
    return lua;
  },
  toolbox: {
    kind: "block",
    type: data.name,
  },
};

export default block;
