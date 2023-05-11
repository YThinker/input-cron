import { RadioChangeEvent, Radio, Space, Input } from "antd";
import { cloneDeep } from "lodash";
import React, { useState, useEffect, memo } from "react";

import "./index.less";
import { analyzeGroupDisabled, formatPayload } from "./util";

interface Props {
  value?: string;
  disabled?: boolean | number[];
  onChange?: (value?: string) => void;
}
const YearSelector = (props: Props) => {
  const { value, disabled, onChange } = props;

  /** radio后的额外配置 */
  const [configNum, setConfigNum] = useState<
    Record<"*" | "-" | "?", string[] | undefined>
  >({
    "*": undefined,
    "?": undefined,
    "-": ["1970", "1970"],
  });

  const configNumReducer = (
    state: typeof configNum,
    action: {
      type: "-";
      trigger: "change" | "blur";
      index?: number;
      payload: string | string[];
    }
  ) => {
    let payload =
      typeof action.payload === "string" && !isNaN(+action.payload)
        ? String(+action.payload)
        : action.payload;
    if (action.trigger === "blur") {
      /** 绕过类型校验 */
      if (typeof payload === "string") {
        payload = formatPayload(payload, 1970, 3000);
      }
      if (Array.isArray(payload)) {
        payload = payload.map((item) => formatPayload(item, 1970, 3000));
      }
    }
    switch (action.type) {
      case "-": {
        const copy = cloneDeep(state[action.type]);
        if (
          copy &&
          typeof action.index === "number" &&
          typeof payload === "string"
        ) {
          copy[action.index] = payload;
          setConfigNum({ ...state, [action.type]: copy });
        }
        return;
      }
      default:
        return state;
    }
  };

  /** radio选择 */
  const [radioValue, setRadioValue] = useState<
    keyof typeof configNum | undefined
  >("?");
  const handleRadioValueChange = (e: RadioChangeEvent) =>
    setRadioValue(e.target.value);

  /** 触发onChange */
  useEffect(() => {
    if (radioValue === "-") {
      onChange?.(configNum[radioValue]?.join(radioValue));
    } else if (radioValue === "*") {
      onChange?.("*");
    } else {
      onChange?.("?");
    }
  }, [configNum, radioValue]);

  /** 反解析value */
  useEffect(() => {
    if (value && /^\d{1,}-\d{1,}$/.test(value)) {
      const valueList = value.split("-");
      setRadioValue("-");
      setConfigNum((pre) => ({ ...pre, "-": [valueList[0], valueList[1]] }));
    } else if (value === "*") {
      setRadioValue("*");
    } else {
      setRadioValue("?");
    }
  }, [value]);

  return (
    <Radio.Group
      className="cron-generator-radio-group"
      value={radioValue}
      onChange={handleRadioValueChange}
    >
      <Space direction="vertical">
        <Radio value="*" disabled={analyzeGroupDisabled(0, disabled)}>
          每一年
        </Radio>
        <Radio value="?" disabled={analyzeGroupDisabled(1, disabled)}>
          不指定
        </Radio>
        <Radio value="-" disabled={analyzeGroupDisabled(2, disabled)}>
          从
          <Input
            type="number"
            size="small"
            min={0}
            className="cron-generator-small-input"
            value={configNum["-"]?.[0]}
            onChange={(e) =>
              configNumReducer(configNum, {
                type: "-",
                trigger: "change",
                index: 0,
                payload: e.target.value,
              })
            }
            onBlur={(e) =>
              configNumReducer(configNum, {
                type: "-",
                trigger: "blur",
                index: 0,
                payload: e.target.value,
              })
            }
            disabled={analyzeGroupDisabled(2, disabled) || radioValue !== "-"}
          />
          年 到
          <Input
            type="number"
            size="small"
            min={0}
            className="cron-generator-small-input"
            value={configNum["-"]?.[1]}
            onChange={(e) =>
              configNumReducer(configNum, {
                type: "-",
                trigger: "change",
                index: 1,
                payload: e.target.value,
              })
            }
            onBlur={(e) =>
              configNumReducer(configNum, {
                type: "-",
                trigger: "blur",
                index: 1,
                payload: e.target.value,
              })
            }
            disabled={analyzeGroupDisabled(2, disabled) || radioValue !== "-"}
          />
          年
        </Radio>
      </Space>
    </Radio.Group>
  );
};

export default memo(YearSelector);
