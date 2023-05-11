import { RadioChangeEvent, Radio, Space, Input, Checkbox, Select } from "antd";
import React, { useState, useEffect, memo } from "react";

import "./index.less";
import { analyzeGroupDisabled, formatPayload, isEmptyRadioValue } from "./util";

const dayCheckboxOptions = [
  {
    label: "周一",
    value: "MON",
  },
  {
    label: "周二",
    value: "TUE",
  },
  {
    label: "周三",
    value: "WED",
  },
  {
    label: "周四",
    value: "THU",
  },
  {
    label: "周五",
    value: "FRI",
  },
  {
    label: "周六",
    value: "SAT",
  },
  {
    label: "周日",
    value: "SUN",
  },
];

interface Props {
  value?: string;
  disabled?: boolean | number[];
  onChange?: (value?: string) => void;
}
const DaySelector = (props: Props) => {
  const { value, disabled, onChange } = props;

  /** radio后的额外配置 */
  const [configNum, setConfigNum] = useState<
    Record<"-" | "#" | ",", string[]> &
      Record<"*" | "?", undefined> &
      Record<"L", string>
  >({
    "*": undefined,
    "?": undefined,
    "-": ["MON", "MON"],
    L: "MON",
    "#": ["1", "MON"],
    ",": ["MON"],
  });

  const configNumReducer = (
    state: typeof configNum,
    action: {
      type: "-" | "," | "#" | "L";
      trigger: "blur" | "change";
      index?: number;
      payload: string | string[];
    }
  ) => {
    let payload =
      typeof action.payload === "string" && !isNaN(+action.payload)
        ? String(+action.payload)
        : action.payload;
    if (action.trigger === "blur") {
      /** 绕过函数重载校验 */
      if (typeof payload === "string") {
        payload = formatPayload(payload, 1, 4);
      } else {
        payload = formatPayload(payload, 1, 4);
      }
    }
    switch (action.type) {
      case "-":
      case "#": {
        const copy = state[action.type];
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
      case "L":
        return setConfigNum({ ...state, L: payload as string });
      case ",":
        return setConfigNum({ ...state, ",": payload as string[] });
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
    if (radioValue === "-" || radioValue === ",") {
      onChange?.(configNum[radioValue]?.join(radioValue));
    } else if (radioValue === "L") {
      onChange?.(`${configNum.L}L`);
    } else if (radioValue === "#") {
      onChange?.(`${configNum["#"][1]}#${configNum["#"][0]}`);
    } else if (radioValue && ["?", "*"].includes(radioValue)) {
      onChange?.(radioValue);
    } else if(!isEmptyRadioValue(radioValue)){
      onChange?.("*");
    }
  }, [configNum, radioValue]);

  /** 反解析value */
  useEffect(() => {
    if (value && /^[a-zA-Z]{3}-[a-zA-Z]{3}$/.test(value)) {
      const valueList = value.split("-");
      setRadioValue("-");
      setConfigNum((pre) => ({ ...pre, "-": [valueList[0], valueList[1]] }));
    } else if (value && /^([a-zA-Z]{3},){0,}([a-zA-Z]{3})$/.test(value)) {
      const valueList = value.split(",");
      setRadioValue(",");
      setConfigNum((pre) => ({ ...pre, ",": valueList }));
    } else if (value && /^[a-zA-Z]{3}L$/.test(value)) {
      setRadioValue("L");
      setConfigNum((pre) => ({ ...pre, L: value.replace("L", "") }));
    } else if (value && /^[a-zA-Z]{3}#\d{1,}$/.test(value)) {
      const valueList = value.split("#");
      setRadioValue("#");
      setConfigNum((pre) => ({ ...pre, "#": [valueList[1], valueList[0]] }));
    } else if (value === "*" || value === "?") {
      setRadioValue(value);
    } else {
      setRadioValue(undefined);
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
          每一日
        </Radio>
        <Radio value="?" disabled={analyzeGroupDisabled(1, disabled)}>
          不指定
        </Radio>
        <Radio value="-" disabled={analyzeGroupDisabled(2, disabled)}>
          从{/** 修复因事件传递导致的select立即收回 */}
          <Select
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            options={dayCheckboxOptions}
            size="small"
            className="cron-generator-small-select"
            value={configNum["-"]?.[0]}
            onChange={(value) =>
              configNumReducer(configNum, {
                type: "-",
                trigger: "change",
                index: 0,
                payload: value,
              })
            }
            disabled={analyzeGroupDisabled(2, disabled) || radioValue !== "-"}
          />
          到{/** 修复因事件传递导致的select立即收回 */}
          <Select
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            options={dayCheckboxOptions}
            size="small"
            className="cron-generator-small-select"
            value={configNum["-"]?.[1]}
            onChange={(value) =>
              configNumReducer(configNum, {
                type: "-",
                trigger: "change",
                index: 1,
                payload: value,
              })
            }
            disabled={analyzeGroupDisabled(2, disabled) || radioValue !== "-"}
          />
        </Radio>
        <Radio value="#" disabled={analyzeGroupDisabled(3, disabled)}>
          本月第
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
            min={0}
            value={configNum["#"]?.[0]}
            onChange={(e) =>
              configNumReducer(configNum, {
                type: "#",
                trigger: "change",
                index: 0,
                payload: e.target.value,
              })
            }
            onBlur={(e) =>
              configNumReducer(configNum, {
                type: "#",
                trigger: "blur",
                index: 0,
                payload: e.target.value,
              })
            }
            disabled={analyzeGroupDisabled(3, disabled) || radioValue !== "#"}
          />
          周 的{/** 修复因事件传递导致的select立即收回 */}
          <Select
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            options={dayCheckboxOptions}
            size="small"
            className="cron-generator-small-select"
            value={configNum["#"]?.[1]}
            onChange={(value) =>
              configNumReducer(configNum, {
                type: "#",
                trigger: "change",
                index: 1,
                payload: value,
              })
            }
            disabled={analyzeGroupDisabled(3, disabled) || radioValue !== "#"}
          />
        </Radio>
        <Radio value="L" disabled={analyzeGroupDisabled(4, disabled)}>
          本月最后一个
          {/** 修复因事件传递导致的select立即收回 */}
          <Select
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            options={dayCheckboxOptions}
            size="small"
            className="cron-generator-small-select"
            value={configNum["L"]}
            onChange={(value) =>
              configNumReducer(configNum, {
                type: "L",
                trigger: "change",
                index: 0,
                payload: value,
              })
            }
            disabled={analyzeGroupDisabled(4, disabled) || radioValue !== "L"}
          />
        </Radio>
        <Radio
          value=","
          className="cron-generator-has-checkbox-radio"
          disabled={analyzeGroupDisabled(5, disabled)}
        >
          <span className="checkbox-radio-label">指定</span>
          <Checkbox.Group
            className="checkbox-group"
            disabled={analyzeGroupDisabled(5, disabled) || radioValue !== ","}
            value={configNum[","]}
            onChange={(list) =>
              configNumReducer(configNum, {
                type: ",",
                trigger: "change",
                payload: list.map(String),
              })
            }
          >
            {dayCheckboxOptions.map((item) => (
              <Checkbox
                value={item.value}
                key={item.value}
                className="day-checkbox"
              >
                {item.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Radio>
      </Space>
    </Radio.Group>
  );
};

export default memo(DaySelector);
