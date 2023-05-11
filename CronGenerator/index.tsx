import { Button, Input, Popover, PopoverProps, Tabs } from "antd";
import { isEmpty } from "lodash";
import React from "react";
import {
  ChangeEvent,
  CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";
import DateSelector from "./DateSelector";
import DaySelector from "./DaySelector";
import MonthSelector from "./MonthSelector";
import SecondSelector from "./SecondSelector";
import { analyzeSelectorDisabled, analyzeTabDisabled, isEmptyRadioValue } from "./util";
import YearSelector from "./YearSelector";

export enum CRON_KEY {
  SECOND = "s",
  MINUTE = "m",
  HOUR = "h",
  DATE = "d",
  DAY = "D",
  MONTH = "M",
  YEAR = "y",
}

interface CronSelectorProps<L extends boolean> {
  value?: string;
  disabled?: boolean | CRON_KEY[] | Partial<Record<CRON_KEY, number[]>>;
  onChange: (value: string | undefined) => void;
  lazy?: L;
  onConfirm: L extends true ? (value: string | undefined) => void : never;
}
const CronSelector = <L extends boolean>(props: CronSelectorProps<L>) => {
  const { value, disabled, lazy, onConfirm, onChange } = props;

  /**
   * 更新流程： value变更/selector变更 => 中间态变更 => 触发onChange
   * 主逻辑在于中间态上
   */
  /** cron表达式中间态 */
  const [valueList, setValueList] = useState(value?.split(" "));

  const updateIntermedidateState = (valueListParam?: string[]) => {
    const list = valueListParam?.slice(0, 7);
    if (list?.[6] === "?" || isEmptyRadioValue(list?.[6])) {
      list?.splice(6, 1);
    }
    return list;
  }

  /** 处理value change, 更新cron中间态 */
  useEffect(() => {
    const list = updateIntermedidateState(value?.split(" "));
    console.log(list)
    if(list?.some((item, index) => item !== valueList?.[index])) {
      setValueList(list);
    }
  }, [value]);

  /** 处理选择器change, 更新cron中间态 */
  const handleSelectorChange = (value: string | undefined, index: number) => {
    setValueList((pre) => {
      const copy = pre ? [...pre] : [];
      if(value) copy[index] = value;
      // 日与周冲突，处理
      const conflictIndex = index === 3 ? 5 : 3;
      if (
        (index === 3 || index === 5) &&
        !(copy[index] === "?" && copy[conflictIndex] !== "?") &&
        !(copy[index] !== "?" && copy[conflictIndex] === "?")
      ) {
        if(copy[index] !== "?") {
          copy[conflictIndex] = "?";
        } else if(copy[index] === "?" && copy[conflictIndex] === "?") {
          copy[conflictIndex] = "*";
        }
      }
      return copy;
    });
  };

  /** 中间态变更 触发onChange */
  useEffect(() => {
    if(!isEmpty(valueList?.filter(item => !isEmpty(item)))) {
      onChange?.(valueList?.reduce((total, item, index) => {
        if(index === 0){
          return item || '*';
        }
        if(isEmptyRadioValue(item)) {
          return `${total} *`;
        }
        if(index === 6 && (item === '?' || isEmptyRadioValue(item))) {
          return total;
        }
        return `${total} ${item}`
      }));
    }
  }, [valueList]);

  const handleConfirm = () => {
    if (lazy) {
      /**  首次设置生成的corn无法解析 */
      const valueListFirst = updateIntermedidateState(valueList);
      onConfirm?.(valueListFirst?.join(" "));
    }
  };

  const [activeKey, setActiveKey] = useState<CRON_KEY>();
  const handleActiveTabChange = (key: string) => {
    setActiveKey(key as CRON_KEY);
  };

  const tabItems = useMemo(
    () => [
      {
        label: "秒",
        key: CRON_KEY.SECOND,
        disabled: analyzeTabDisabled(CRON_KEY.SECOND, disabled),
        children: (
          <SecondSelector
            disabled={analyzeSelectorDisabled(CRON_KEY.SECOND, disabled)}
            unit="秒"
            value={valueList?.[0]}
            onChange={(value) => handleSelectorChange(value, 0)}
          />
        ),
      },
      {
        label: "分",
        key: CRON_KEY.MINUTE,
        disabled: analyzeTabDisabled(CRON_KEY.MINUTE, disabled),
        children: (
          <SecondSelector
            disabled={analyzeSelectorDisabled(CRON_KEY.MINUTE, disabled)}
            unit="分"
            value={valueList?.[1]}
            onChange={(value) => {
              handleSelectorChange(value, 1);
            }}
          />
        ),
      },
      {
        label: "时",
        key: CRON_KEY.HOUR,
        disabled: analyzeTabDisabled(CRON_KEY.HOUR, disabled),
        children: (
          <SecondSelector
            disabled={analyzeSelectorDisabled(CRON_KEY.HOUR, disabled)}
            unit="时"
            value={valueList?.[2]}
            onChange={(value) => handleSelectorChange(value, 2)}
          />
        ),
      },
      {
        label: "日",
        key: CRON_KEY.DATE,
        disabled: analyzeTabDisabled(CRON_KEY.DATE, disabled),
        children: (
          <DateSelector
            disabled={analyzeSelectorDisabled(CRON_KEY.DATE, disabled)}
            value={valueList?.[3]}
            onChange={(value) => handleSelectorChange(value, 3)}
          />
        ),
      },
      {
        label: "月",
        key: CRON_KEY.MONTH,
        disabled: analyzeTabDisabled(CRON_KEY.MONTH, disabled),
        children: (
          <MonthSelector
            disabled={analyzeSelectorDisabled(CRON_KEY.MONTH, disabled)}
            value={valueList?.[4]}
            onChange={(value) => handleSelectorChange(value, 4)}
          />
        ),
      },
      {
        label: "周",
        key: CRON_KEY.DAY,
        disabled: analyzeTabDisabled(CRON_KEY.DAY, disabled),
        children: (
          <DaySelector
            disabled={analyzeSelectorDisabled(CRON_KEY.DAY, disabled)}
            value={valueList?.[5]}
            onChange={(value) => handleSelectorChange(value, 5)}
          />
        ),
      },
      {
        label: "年",
        key: CRON_KEY.YEAR,
        disabled: analyzeTabDisabled(CRON_KEY.YEAR, disabled),
        children: (
          <YearSelector
            disabled={analyzeSelectorDisabled(CRON_KEY.YEAR, disabled)}
            value={valueList?.[6]}
            onChange={(value) => handleSelectorChange(value, 6)}
          />
        ),
      },
    ].map((item) => ({ ...item, forceRender: true })),
    [valueList]
  );
  return (
    <Tabs
      activeKey={activeKey}
      onChange={handleActiveTabChange}
      items={tabItems}
      tabBarExtraContent={
        lazy && (
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        )
      }
    />
  );
};

interface Props {
  value: string | undefined;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  onChange: (value?: string) => void;
  generatorDisabled?: boolean | CRON_KEY[] | Partial<Record<CRON_KEY, number[]>>;
  lazy?: boolean;
  className?: string;
  style?: CSSProperties;
  popoverProps?: PopoverProps;
}
const CronGenerator = (props: Props) => {
  const {
    value,
    placeholder,
    disabled,
    readonly,
    onChange,
    generatorDisabled,
    lazy,
    className,
    style,
    popoverProps,
  } = props;

  const [open, setOpen] = useState(false);
  const handleOpenChange = (curOpen: boolean) => setOpen(curOpen);

  /** 内部input change管理 */
  const [selfValue, setSelfValue] = useState(value);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSelfValue(e.target.value);

  /** 同步外部value传入 */
  useEffect(() => setSelfValue(value), [value]);

  /** input blur触发onChange */
  const handleInputBlur = () => onChange?.(selfValue);

  const updateValues = (value: string | undefined) => {
    setSelfValue(value);
    onChange?.(value);
  };

  /** cronSelector change */
  const handleCronSelectorChange = (value: string | undefined) => {
    if (!lazy) {
      updateValues(value);
    }
  };
  /** cronSelector confirm */
  const handleConfirm = (value: string | undefined) => {
    if (lazy) {
      updateValues(value);
      setOpen(false);
    }
  };

  return (
    <Popover
      placement="bottom"
      trigger="click"
      open={(disabled || readonly) ? false : open}
      onOpenChange={handleOpenChange}
      {...popoverProps}
      content={
        <CronSelector
          value={value}
          disabled={generatorDisabled}
          lazy={lazy}
          onChange={handleCronSelectorChange}
          onConfirm={handleConfirm}
        />
      }
    >
      <Input
        value={selfValue}
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        className={className}
        style={style}
      />
    </Popover>
  );
};

export default CronGenerator;
