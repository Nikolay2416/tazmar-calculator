import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from 'reactflow';
import { Popover, Select, Button, ConfigProvider } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';

import { setIsNodeRemove } from '../../store/slices/idNodeToUpdate';
import { useAppDispatch } from '../../hook/store';
import { useUpdateChildNode } from '../../hook/useUpdateChildNode';
import { equipment } from '../../data/equipment';
import { Equipment, StatusType } from '../../type/type';

import cls from './customNode.module.css';
import './reactFlowCustomNode.css';

export const nodeTypes = { custom: CustomNode };

export function CustomNode({ id, data, isConnectable }: NodeProps) {
  const { label, inletThrust, outletThrust, workingLoad, loadLimit } = data;
  const { setNodes, getEdges, deleteElements } = useReactFlow();
  const [valueSelect, setValueSelect] = useState<string>(label);
  const [оnConnectTarget, setOnConnectTarget] = useState<string>('');
  const dispatch = useAppDispatch();
  const edges = getEdges();

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

  useUpdateChildNode(id, setOnConnectTarget);

  useEffect(() => {
    const value = equipment.find((item: Equipment) => item.value === valueSelect);
    setNodes((prevNodes) => {
      if (id === '0') {
        return prevNodes;
      }

      const updatedNodes = prevNodes.map((node) => {
        if (node.id === id) {
          const childNode = prevNodes.find((node) => node.id === id);
          const parentNode = prevNodes.find((node) => node.id === childNode?.data.parentNode);
          const otherParentConnections = edges.filter((edge) => edge.source === parentNode?.id);
          const parentConnectionsWithNode = edges.filter((edge) => edge.target === childNode?.id);

          let parentOutletThrust = 0;
          prevNodes.map((node) => {
            for (let i = 0; i < parentConnectionsWithNode.length; i++) {
              if (parentConnectionsWithNode && node.id === parentConnectionsWithNode[i]?.source) {
                parentOutletThrust += node.data.outletThrust;
                return;
              }
            }
          });

          let recalculationOutletThrust;
          if (value?.category === 'Гиня4') {
            recalculationOutletThrust = parentOutletThrust * 4;
          } else if (value?.category === 'Гиня7') {
            recalculationOutletThrust = parentOutletThrust * 7;
          } else {
            recalculationOutletThrust = parentOutletThrust;
          }

          return {
            ...node,
            data: {
              ...value,
              inletThrust: inletThrust,
              outletThrust: recalculationOutletThrust / otherParentConnections.length,
              parentNode: node.data.parentNode,
            },
          };
        }
        return node;
      });
      return updatedNodes;
    });
  }, [valueSelect]);

  const onClickRemove = (id: string) => {
    const otherConnections = edges.filter((edge) => edge.source === id || edge.target === id);

    console.log(otherConnections)
    deleteElements({ nodes: [{ id }], edges: otherConnections });
    dispatch(setIsNodeRemove(true));
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
      {/* {id} */}
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
