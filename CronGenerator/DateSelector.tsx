import { RadioChangeEvent, Radio, Space, Input, Checkbox } from "antd";
import { cloneDeep } from "lodash";
import React, { useState, useEffect, memo } from "react";

import "./index.less";
import { analyzeGroupDisabled, formatPayload, isEmptyRadioValue } from "./util";

const dateCheckboxOptions = new Array(31).fill(undefined);

interface Props {
  value?: string;
  disabled?: boolean | number[];
  onChange?: (value?: string) => void;
}
const DateSelector = (props: Props) => {
  const { value, disabled, onChange } = props;

  /** radio后的额外配置 */
  const [configNum, setConfigNum] = useState<
    Record<"-" | "/" | ",", string[]> &
      Record<"*" | "?" | "L0", undefined> &
      Record<"L" | "W", string>
  >({
    "*": undefined,
    "?": undefined,
    "-": ["1", "1"],
    "/": ["1", "1"],
    L0: undefined,
    L: "0",
    W: "1",
    ",": ["1"],
  });

  const configNumReducer = (
    state: typeof configNum,
    action:
      | {
          type: "-" | "/" | "L" | "W";
          trigger: "change" | "blur";
          index?: number;
          payload: string;
        }
      | { type: ","; trigger: "change" | "blur"; payload: string[] }
  ) => {
    let payload =
      typeof action.payload === "string" && !isNaN(+action.payload)
        ? String(+action.payload)
        : action.payload;
    if (action.trigger === "blur") {
      if (typeof payload === "string") {
        payload = formatPayload(payload, 1, 31);
      }
      if (Array.isArray(payload)) {
        payload = payload.map((item) => formatPayload(item, 1, 31));
      }
    }
    switch (action.type) {
      case "-":
      case "/": {
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
      case ",":
        return setConfigNum({ ...state, ",": payload as string[] });
      case "L":
        return setConfigNum({ ...state, [action.type]: payload as string });
      case "W":
        return setConfigNum({ ...state, [action.type]: payload as string });
      default:
        return state;
    }
  };

  /** radio选择 */
  const [radioValue, setRadioValue] = useState<
    keyof typeof configNum | undefined
  >("*");
  const handleRadioValueChange = (e: RadioChangeEvent) =>
    setRadioValue(e.target.value);

  /** 触发onChange */
  useEffect(() => {
    if (radioValue === "-" || radioValue === "/" || radioValue === ",") {
      onChange?.(configNum[radioValue]?.join(radioValue));
    } else if (radioValue === "L") {
      onChange?.(`L-${configNum.L}`);
    } else if (radioValue === "W") {
      onChange?.(`${configNum.W}W`);
    } else if (radioValue === "L0") {
      onChange?.("L");
    } else if (radioValue === "*" || radioValue === "?") {
      onChange?.(radioValue);
    } else if (!isEmptyRadioValue(radioValue)) {
      onChange?.("*");
    }
  }, [configNum, radioValue]);

  /** 反解析value */
  useEffect(() => {
    if (value && /^\d{1,}-\d{1,}$/.test(value)) {
      const valueList = value.split("-");
      setRadioValue("-");
      setConfigNum((pre) => ({ ...pre, "-": [valueList[0], valueList[1]] }));
    } else if (value && /^\d{1,}\/\d{1,}$/.test(value)) {
      const valueList = value.split("/");
      setRadioValue("/");
      setConfigNum((pre) => ({ ...pre, "/": [valueList[0], valueList[1]] }));
    } else if (value && /^(\d{1,},){0,}(\d{1,})$/.test(value)) {
      const valueList = value.split(",");
      setRadioValue(",");
      setConfigNum((pre) => ({ ...pre, ",": valueList }));
    } else if (value && /^L-\d{1,}$/.test(value)) {
      setRadioValue("L");
      setConfigNum((pre) => ({ ...pre, L: value.replace("L-", "") }));
    } else if (value && /^\d{1,}W$/.test(value)) {
      setRadioValue("W");
      setConfigNum((pre) => ({ ...pre, W: value.replace("W", "") }));
    } else if (value === "L") {
      setRadioValue("L0");
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
          从
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
            min={0}
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
          号 到
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
            min={0}
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
          号
        </Radio>
        <Radio value="/" disabled={analyzeGroupDisabled(3, disabled)}>
          从
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
            min={0}
            value={configNum["/"]?.[0]}
            onChange={(e) =>
              configNumReducer(configNum, {
                type: "/",
                trigger: "change",
                index: 0,
                payload: e.target.value,
              })
            }
            onBlur={(e) =>
              configNumReducer(configNum, {
                type: "/",
                trigger: "blur",
                index: 0,
                payload: e.target.value,
              })
            }
            disabled={analyzeGroupDisabled(3, disabled) || radioValue !== "/"}
          />
          号开始，每
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
            min={0}
            value={configNum["/"]?.[1]}
            onChange={(e) =>
              configNumReducer(configNum, {
                type: "/",
                trigger: "change",
                index: 1,
                payload: e.target.value,
              })
            }
            onBlur={(e) =>
              configNumReducer(configNum, {
                type: "/",
                trigger: "blur",
                index: 1,
                payload: e.target.value,
              })
            }
            disabled={analyzeGroupDisabled(3, disabled) || radioValue !== "/"}
          />
          日执行一次
        </Radio>
        <Radio value="W" disabled={analyzeGroupDisabled(4, disabled)}>
          每月
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
            min={0}
            value={configNum["W"]}
            onChange={(e) =>
              configNumReducer(configNum, {
                type: "W",
                trigger: "change",
                payload: e.target.value,
              })
            }
            onBlur={(e) =>
              configNumReducer(configNum, {
                type: "W",
                trigger: "blur",
                payload: e.target.value,
              })
            }
            disabled={analyzeGroupDisabled(4, disabled) || radioValue !== "W"}
          />
          号最近的一个工作日
        </Radio>
        <Radio value="L0" disabled={analyzeGroupDisabled(4, disabled)}>
          本月最后一天
        </Radio>
        <Radio value="L" disabled={analyzeGroupDisabled(4, disabled)}>
          本月倒数第
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
            min={0}
            value={configNum["L"]}
            onChange={(e) =>
              configNumReducer(configNum, {
                type: "L",
                trigger: "change",
                payload: e.target.value,
              })
            }
            onBlur={(e) =>
              configNumReducer(configNum, {
                type: "L",
                trigger: "blur",
                payload: e.target.value,
              })
            }
            disabled={analyzeGroupDisabled(4, disabled) || radioValue !== "L"}
          />
          天
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
            {dateCheckboxOptions.map((_, index) => (
              <Checkbox
                value={String(index + 1)}
                key={index}
                className="checkbox"
              >
                {index + 1}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Radio>
      </Space>
    </Radio.Group>
  );
};

export default memo(DateSelector);
