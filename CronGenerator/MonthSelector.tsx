import { RadioChangeEvent, Radio, Space, Input, Checkbox } from "antd";
import { cloneDeep } from "lodash";
import React, { useState, useEffect, memo } from "react";

import "./index.less";
import { analyzeGroupDisabled, formatPayload, isEmptyRadioValue } from "./util";

const monthCheckboxOptions = new Array(12).fill(undefined);

interface Props {
  value?: string;
  disabled?: boolean | number[];
  onChange?: (value?: string) => void;
}
const MonthSelector = (props: Props) => {
  const { value, disabled, onChange } = props;

  /** radio后的额外配置 */
  const [configNum, setConfigNum] = useState<
    Record<"*" | "-" | "/" | ",", string[] | undefined>
  >({
    "*": undefined,
    "-": ["1", "1"],
    "/": ["1", "1"],
    ",": ["1"],
  });

  const configNumReducer = (
    state: typeof configNum,
    action: {
      type: "-" | "/" | ",";
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
      if (typeof payload === "string") {
        payload = formatPayload(payload, 1, 12);
      }
      if (Array.isArray(payload)) {
        payload = payload.map((item) => formatPayload(item, 1, 12));
      }
    }
    switch (action.type) {
      case "-":
      case "/": {
        const copy = cloneDeep(state["-"]);
        if (
          copy &&
          typeof action.index === "number" &&
          typeof payload === "string"
        ) {
          copy[action.index] = payload;
          setConfigNum({ ...state, "-": copy });
        }
        return;
      }
      case ",":
        return setConfigNum({ ...state, ",": payload as string[] });
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
    if (radioValue && ["-", "/", ","].includes(radioValue)) {
      onChange?.(configNum[radioValue]?.join(radioValue));
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
    } else if (value === "*") {
      setRadioValue("*");
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
          每一月
        </Radio>
        <Radio value="-" disabled={analyzeGroupDisabled(1, disabled)}>
          从
          <Input
            type="number"
            size="small"
            min={1}
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
            disabled={analyzeGroupDisabled(1, disabled) || radioValue !== "-"}
          />
          月 到
          <Input
            type="number"
            size="small"
            min={1}
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
            disabled={analyzeGroupDisabled(1, disabled) || radioValue !== "-"}
          />
          月
        </Radio>
        <Radio value="/" disabled={analyzeGroupDisabled(2, disabled)}>
          从
          <Input
            type="number"
            size="small"
            min={1}
            className="cron-generator-small-input"
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
            disabled={analyzeGroupDisabled(2, disabled) || radioValue !== "/"}
          />
          月开始，每
          <Input
            type="number"
            size="small"
            className="cron-generator-small-input"
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
            disabled={analyzeGroupDisabled(2, disabled) || radioValue !== "/"}
          />
          月执行一次
        </Radio>
        <Radio
          value=","
          className="cron-generator-has-checkbox-radio"
          disabled={analyzeGroupDisabled(3, disabled)}
        >
          <span className="checkbox-radio-label">指定</span>
          <Checkbox.Group
            className="checkbox-group"
            disabled={analyzeGroupDisabled(3, disabled) || radioValue !== ","}
            value={configNum[","]}
            onChange={(list) =>
              configNumReducer(configNum, {
                type: ",",
                trigger: "change",
                payload: list.map(String),
              })
            }
          >
            {monthCheckboxOptions.map((_, index) => (
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

export default memo(MonthSelector);
