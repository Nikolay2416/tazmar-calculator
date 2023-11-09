import { useState, useRef, useEffect } from 'react';
import { Button, Select } from 'antd';
import ReactFlow, { Controls, Background, Node, Edge, OnConnect, Panel, useNodesState, useEdgesState } from 'reactflow';

import { useOnConnect } from '../../hook/useOnConnect';
import { equipment } from '../../data/equipment';
import { nodeTypes } from '../customNode/CustomNode';
import { Equipment } from '../../type/type';

import s from './flow.module.css';
import 'reactflow/dist/style.css';

export function Flow() {
  const [valueSelect, setValueSelect] = useState<string>('');
  const [оnConnectTarget, setOnConnectTarget] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const flowRef = useRef<HTMLDivElement | null>(null);
  const onConnect: OnConnect = useOnConnect(nodes, setNodes, edges, setEdges, setOnConnectTarget);

  useEffect(() => {
    if (оnConnectTarget) {
      updateAllChildNodes(оnConnectTarget);
    }
  }, [nodes]);

  const updateAllChildNodes = (targetId: string) => {
    const parentEdges = edges.filter((edge) => edge.source === targetId);

    console.log(parentEdges);

    if (parentEdges.length === 0) {
      setOnConnectTarget('');
    }

    parentEdges.forEach((edge) => {
      const childNode = nodes.find((node) => node.id === edge.target);
      //@ts-ignore
      const parentNode = nodes.find((node) => node.id === childNode?.data.parentNode);

      if (childNode) {
        let recalculationOutletThrust;

        //@ts-ignore
        if (childNode.data.category === 'Гиня4') {
          //@ts-ignore
          recalculationOutletThrust = parentNode?.data.outletThrust * 4;
          //@ts-ignore
        } else if (childNode.data.category === 'Гиня7') {
          //@ts-ignore
          recalculationOutletThrust = parentNode?.data.outletThrust * 7;
        } else {
          //@ts-ignore
          recalculationOutletThrust = parentNode?.data.outletThrust;
        }

        const updatedChildNode = {
          ...childNode,
          data: {
            ...childNode.data,
            //@ts-ignore
            inletThrust: parentNode?.data.outletThrust / parentEdges.length,
            //@ts-ignore
            outletThrust: recalculationOutletThrust / parentEdges.length,
          },
        };

        setNodes((prevNodes) => [...prevNodes.filter((node) => node.id !== childNode.id), updatedChildNode]);
        setOnConnectTarget(childNode.id);
      }
    });
  };

  const handleAddNode = () => {
    if (!valueSelect) return;

    const value = equipment.find((item: Equipment) => item.value === valueSelect);
    const verticalArrangement: number = parseInt(String(nodes.length) + '0');
    const firstLocationNode: number = flowRef.current?.clientWidth ? flowRef.current.clientWidth / 2 - 73 : 0;
    const locationNode: number = flowRef.current?.clientWidth ? flowRef.current.clientWidth - 250 : 0;

    const newNode: Node = {
      id: value?.label + String(nodes.length) + String(Math.floor(Math.random() * 1000000) + 1),
      data: { ...value, parentNode: '' },
      position: { x: nodes.length === 0 ? firstLocationNode : locationNode, y: verticalArrangement },
      type: nodes.length === 0 ? 'input' : 'custom',
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
  };

  return (
    <div className={s.flow}>
      <div className={s.bodyReactFlow} ref={flowRef}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
          <Panel position="top-left">
            <div className={s.bodyEquipmentSelection}>
              <Select className={s.antdSelect} onChange={(value) => setValueSelect(value)} options={equipment} />
              <div>
                <Button onClick={handleAddNode} className={s.antdButton}>
                  Добавить
                </Button>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
