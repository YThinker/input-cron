import { RadioChangeEvent, Radio, Space, Input, Checkbox } from "antd";
import { cloneDeep } from "lodash";
import React, { useState, useEffect, memo } from "react";

import "./index.less";
import { analyzeGroupDisabled, formatPayload, isEmptyRadioValue } from "./util";

const secondCheckboxOptions = new Array(60).fill(undefined);
const hourCheckboxOptions = new Array(24).fill(undefined);

interface Props {
  unit: string;
  value?: string;
  disabled?: boolean | number[];
  onChange?: (value?: string) => void;
}
const SecondSelector = (props: Props) => {
  const { unit, value, disabled, onChange } = props;

  /** radio后的额外配置 */
  const [configNum, setConfigNum] = useState<
    Record<"*" | "-" | "/" | ",", string[] | undefined>
  >({
    "*": undefined,
    "-": ["0", "0"],
    "/": ["0", "0"],
    ",": ["0"],
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
      /** 绕过类型校验 */
      if (typeof payload === "string") {
        payload = formatPayload(payload, 0, unit === "时" ? 23 : 59);
      }
      if (Array.isArray(payload)) {
        payload = payload.map((item) =>
          formatPayload(item, 0, unit === "时" ? 23 : 59)
        );
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
        if ((payload as string[])?.length) {
          setConfigNum({ ...state, ",": payload as string[] });
        }
        return;
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
      const valueList = value?.split(",");
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
          每一{unit}
        </Radio>
        <Radio value="-" disabled={analyzeGroupDisabled(1, disabled)}>
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
            disabled={analyzeGroupDisabled(1, disabled) || radioValue !== "-"}
          />
          {unit}
          到
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
            disabled={analyzeGroupDisabled(1, disabled) || radioValue !== "-"}
          />
          {unit}
        </Radio>
        <Radio value="/" disabled={analyzeGroupDisabled(2, disabled)}>
          从
          <Input
            type="number"
            size="small"
            min={0}
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
          {unit}开始，每
          <Input
            type="number"
            size="small"
            min={0}
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
          {unit}执行一次
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
            {(unit === "时" ? hourCheckboxOptions : secondCheckboxOptions).map(
              (_, index) => (
                <Checkbox
                  value={String(index)}
                  key={index}
                  className="checkbox"
                >
                  {index}
                </Checkbox>
              )
            )}
          </Checkbox.Group>
        </Radio>
      </Space>
    </Radio.Group>
  );
};

export default memo(SecondSelector);
