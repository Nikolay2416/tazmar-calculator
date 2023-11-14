import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from 'reactflow';
import { Popover, Select, Button, ConfigProvider } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';

import { equipment } from '../../data/equipment';
import { Equipment, StatusType } from '../../type/type';

import cls from './customNode.module.css';
import './customNode.css';

export const nodeTypes = { custom: CustomNode };

export function CustomNode({ id, data, isConnectable }: NodeProps) {
  const { setNodes, getEdges, setEdges } = useReactFlow();
  const { label, inletThrust, outletThrust, workingLoad, loadLimit } = data;
  const [valueSelect, setValueSelect] = useState<string>(label);

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
  }, [valueSelect]);

  let styleBlock = cls.textUpdaterNode;
  let styleWorkingLoad = cls.contentPopoverText;
  let styleLoadLimit = cls.contentPopoverText;
  let selectBg = '#eee';
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

  const onEdgeClick = (evt: any, id: any) => {
    evt.stopPropagation();
    const edges = getEdges();
    const otherConnections = edges.filter((edge) => edge.source === id || edge.target === id);

    // Доделать
    // console.log(otherConnections)

    otherConnections.forEach((connection) => {
      setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== connection.id));
    });

    // setEdges((edg) => edg.filter((edg) => edg.id !== otherConnections?.id));
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  const content = (
    <div className={cls.contentPopover}>
      <p>Входная тяга: {Math.round(inletThrust * 100) / 100}тс</p>
      <p>Выходная тяга: {Math.round(outletThrust * 100) / 100}тс</p>
      <p className={styleWorkingLoad}>Рабочая нагрузка: {workingLoad}тс</p>
      <p className={styleLoadLimit}>Максимальная нагрузка: {loadLimit}тс</p>
      <Button className={cls.antdButton} danger onClick={(evt) => onEdgeClick(evt, id)}>
        Удалить
      </Button>
    </div>
  );

  return (
    <div className={styleBlock}>
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




// const [open, setOpen] = useState(false);

// const hide = () => {
//   setOpen(false);
// };

// const handleOpenChange = (newOpen: boolean) => {
//   setOpen(newOpen);
// };

// <Select className={cls.antdSelect} onChange={(value) => {
//   setValueSelect(value);
//   hide();
// }} options={equipment} />
// <Popover content={content} trigger="click" placement="top" open={open} onOpenChange={handleOpenChange}>

// import { Handle, Position } from 'reactflow';
// import { Popover } from 'antd';

// import { Equipment } from '../../type/type';

// import cls from './customNode.module.css';

// interface ModuleProps {
//   data: Equipment;
//   isConnectable: boolean;
// }

// export const nodeTypes = { custom: CustomNode };

// export function CustomNode({ data, isConnectable }: ModuleProps) {
//   const { label, inletThrust, outletThrust, workingLoad, loadLimit } = data;
//   let styleBlock;
//   let styleWorkingLoad;
//   let styleLoadLimit;

//   if (inletThrust > loadLimit) {
//     styleBlock = cls.textUpdaterNodeError;
//   } else if (inletThrust > workingLoad) {
//     styleBlock = cls.textUpdaterNodeWarning;
//   } else {
//     styleBlock = cls.textUpdaterNode;
//   }

//   if (inletThrust > workingLoad) {
//     styleWorkingLoad = cls.contentPopoverTextError;
//   } else {
//     styleWorkingLoad = cls.contentPopoverText;
//   }

//   if (inletThrust > loadLimit) {
//     styleLoadLimit = cls.contentPopoverTextError;
//   } else {
//     styleLoadLimit = cls.contentPopoverText;
//   }

//   const content = (
//     <div className={cls.contentPopover}>
//       <p>Входная тяга: {Math.round(inletThrust * 100) / 100}тс</p>
//       <p>Выходная тяга: {Math.round(outletThrust * 100) / 100}тс</p>
//       <p className={styleWorkingLoad}>Рабочая нагрузка: {workingLoad}тс</p>
//       <p className={styleLoadLimit}>Максимальная нагрузка: {loadLimit}тс</p>
//     </div>
//   );

//   return (
//     <Popover content={content} trigger="click" placement="right">
//       <div className={styleBlock}>
//         <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
//         <div>{label}</div>
//         <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />
//       </div>
//     </Popover>
//   );
// }
