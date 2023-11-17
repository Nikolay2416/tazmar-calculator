import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from 'reactflow';
import { Popover, Select, Button, ConfigProvider } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';

import { useUpdateChildNode } from '../../hook/useUpdateChildNode';
import { equipment } from '../../data/equipment';
import { Equipment, StatusType } from '../../type/type';

import cls from './customNode.module.css';
import './reactFlowCustomNode.css';

export const nodeTypes = { custom: CustomNode };

export function CustomNode({ id, data, isConnectable }: NodeProps) {
  const { label, inletThrust, outletThrust, workingLoad, loadLimit } = data;
  const { setNodes, getEdges, deleteElements, getNodes } = useReactFlow();
  const [valueSelect, setValueSelect] = useState<string>(label);
  const [оnConnectTarget, setOnConnectTarget] = useState<string>('');
  useEffect(() => {
    setOnConnectTarget(id);
  }, [valueSelect]);
  useUpdateChildNode(getNodes(), setNodes, getEdges(), setOnConnectTarget, id); 
  // useUpdateChildNode(getNodes(), setNodes, getEdges(), setOnConnectTarget, оnConnectTarget); 

  let styleBlock: string = cls.textUpdaterNodeDefolt;
  let styleWorkingLoad: string = cls.contentPopoverText;
  let styleLoadLimit: string = cls.contentPopoverText;
  let selectBg: string = '#eee';
  let statusType: StatusType = '';

  if (inletThrust > loadLimit) {
    statusType = 'error';
    selectBg = '#fff2e8';
    styleBlock = cls.textUpdaterNodeError;
  } else if (inletThrust > workingLoad) {
    statusType = 'warning';
    selectBg = '#fffbe6';
    styleBlock = cls.textUpdaterNodeWarning;
  }

  if (inletThrust > workingLoad) {
    styleWorkingLoad = cls.contentPopoverTextError;
  }

  if (inletThrust > loadLimit) {
    styleLoadLimit = cls.contentPopoverTextError;
  }

  useEffect(() => {
    const value = equipment.find((item: Equipment) => item.value === valueSelect);
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((node) => {
        if (node.id === id) {
          let recalculationOutletThrust;

          // Доделать
          if (value?.category === 'Гиня4') {
            recalculationOutletThrust = outletThrust * 4;
          } else if (value?.category === 'Гиня7') {
            recalculationOutletThrust = outletThrust * 7;
          } else {
            recalculationOutletThrust = outletThrust;
          }

          return {
            ...node,
            data: {
              ...value,
              inletThrust: inletThrust,
              outletThrust: recalculationOutletThrust,
              parentNode: node.data.parentNode,
            },
          };
        }
        return node;
      });
      return updatedNodes;
    });
    // setOnConnectTarget(id)
  }, [valueSelect]);

  const onClickRemove = (id: string) => {
    const otherConnections = getEdges().filter((edge) => edge.source === id || edge.target === id);
    deleteElements({ nodes: [{ id }], edges: otherConnections });
  };

  const content = (
    <div className={cls.contentPopover}>
      <p>Входная тяга: {Math.round(inletThrust * 100) / 100}тс</p>
      <p>Выходная тяга: {Math.round(outletThrust * 100) / 100}тс</p>
      <p className={styleWorkingLoad}>Рабочая нагрузка: {workingLoad}тс</p>
      <p className={styleLoadLimit}>Максимальная нагрузка: {loadLimit}тс</p>
      <Button className={cls.antdButton} danger onClick={() => onClickRemove(id)}>
        Удалить
      </Button>
    </div>
  );

  return (
    <div className={`${styleBlock} ${cls.textUpdaterNode}`}>
      {label !== 'Экскаватор' && <Handle type="target" position={Position.Top} isConnectable={isConnectable} />}
      <ConfigProvider
        theme={{
          components: {
            Select: {
              selectorBg: selectBg,
            },
          },
        }}
      >
        <Select
          className={`nodrag nopan ${cls.antdSelect}`}
          value={valueSelect}
          onChange={(value) => setValueSelect(value)}
          options={equipment}
          status={statusType}
        />
      </ConfigProvider>
      <Popover content={content} trigger="click" placement="right">
        <UnorderedListOutlined className={cls.antdIcon} />
      </Popover>
      <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
    </div>
  );
}
