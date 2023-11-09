import { Handle, Position } from 'reactflow';
import { Popover } from 'antd';

import { Equipment } from '../../type/type';

import s from './customNode.module.css';

interface ModuleProps {
  data: Equipment;
  isConnectable: boolean;
}

export const nodeTypes = { custom: CustomNode };

export function CustomNode({ data, isConnectable }: ModuleProps) {
  const { label, inletThrust, outletThrust, workingLoad, loadLimit } = data;
  let styleBlock;
  let styleWorkingLoad;
  let styleLoadLimit;

  if (inletThrust > loadLimit) {
    styleBlock = s.textUpdaterNodeError;
  } else if (inletThrust > workingLoad) {
    styleBlock = s.textUpdaterNodeWarning;
  } else {
    styleBlock = s.textUpdaterNode;
  }

  if (inletThrust > workingLoad) {
    styleWorkingLoad = s.contentPopoverTextError;
  } else {
    styleWorkingLoad = s.contentPopoverText;
  }

  if (inletThrust > loadLimit) {
    styleLoadLimit = s.contentPopoverTextError;
  } else {
    styleLoadLimit = s.contentPopoverText;
  }

  const content = (
    <div className={s.contentPopover}>
      <p>Входная тяга: {Math.round(inletThrust * 100) / 100}тс</p>
      <p>Выходная тяга: {Math.round(outletThrust * 100) / 100}тс</p>
      <p className={styleWorkingLoad}>Рабочая нагрузка: {workingLoad}тс</p>
      <p className={styleLoadLimit}>Максимальная нагрузка: {loadLimit}тс</p>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="right">
      <div className={styleBlock}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
        <div>{label}</div>
        <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
      </div>
    </Popover>
  );
}
