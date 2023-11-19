import { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Node,
  Edge,
  OnConnectStart,
  OnConnectEnd,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MiniMap,
} from 'reactflow';

import { useOnConnect } from '../../hook/useOnConnect';
import { useUpdateChildNode } from '../../hook/useUpdateChildNode';
import { nodeTypes } from '../customNode/CustomNode';
import { edgeTypes } from '../customEdge/CustomEdge';
import { equipment } from '../../data/equipment';
import { Equipment } from '../../type/type';

import cls from './flow.module.css';

const equipmentExcavator = equipment.find((item: Equipment) => item.value === 'Экскаватор');
const initialNodes: Node = {
  id: '0',
  type: 'custom',
  data: equipmentExcavator,
  position: { x: 0, y: 20 },
};

export function Flow() {
  const { project, getNode, getEdges } = useReactFlow();
  const connectingNodeId = useRef<string>('');
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [оnConnectTarget, setOnConnectTarget] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  const firstLocationNode: number = reactFlowWrapper.current?.clientWidth
    ? reactFlowWrapper.current.clientWidth / 2 - 111.5
    : 0;

  const onConnect = useOnConnect(setOnConnectTarget);
  useUpdateChildNode(оnConnectTarget, setOnConnectTarget);

  useEffect(() => {
    if (firstLocationNode && nodes.length === 0) {
      setNodes((nds) =>
        nds.concat({
          ...initialNodes,
          position: { x: firstLocationNode, y: 20 },
        }),
      );
    } else if (firstLocationNode) {
      setNodes((prevNodes) => {
        const updatedNodes = prevNodes.map((node) => {
          if (node.id === initialNodes.id) {
            return {
              ...initialNodes,
              position: { x: firstLocationNode, y: 20 },
            };
          }
          return node;
        });

        return updatedNodes;
      });
    }
  }, [firstLocationNode]);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    if (!nodeId) return;
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      if (!event.target) return;
      const targetIsPane = (event.target as Element).classList?.contains('react-flow__pane');
      const parentNode = getNode(connectingNodeId.current);
      const edges = getEdges();
      const otherConnections = edges.filter((edge) => edge.source === parentNode?.id);
      const equipmentD19 = equipment.find((item: Equipment) => item.value === 'д19,5мм -120м 2шт');

      if (targetIsPane && reactFlowWrapper.current) {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const id = String(nodes.length) + String(Math.floor(Math.random() * 1000000) + 1);

        const newNode: Node = {
          id,
          data: {
            ...equipmentD19,
            parentNode: parentNode?.id,
            inletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
            outletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
          },
          position: project({
            x: (event as MouseEvent).clientX - left - 111.5,
            y: (event as MouseEvent).clientY - top,
          }),
          type: 'custom',
        };

        setNodes((nds) => nds.concat(newNode));

        if (parentNode?.id) {
          setOnConnectTarget(parentNode?.id);
        }

        setNodes((prevNodes) => {
          const updatedNodes = prevNodes.map((node) => {
            for (let i = 0; i < otherConnections.length; i++) {
              if (node.id === otherConnections[i].target) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    inletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
                    outletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
                  },
                };
              }
            }
            return node;
          });
          return updatedNodes;
        });

        setEdges((eds) => eds.concat({ id, source: connectingNodeId.current, target: id, type: 'custom' }));
      }
    },
    [project],
  );

  return (
    <div className={cls.bodyReactFlow} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        className={cls.reactFlow}
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.data.inletThrust > n.data.loadLimit) {
              return '#ff0072';
            } else if (n.data.inletThrust > n.data.workingLoad) {
              return '#ffc53d';
            } else {
              return '#1A192B';
            }
          }}
          nodeColor={(n) => {
            if (n.data.inletThrust > n.data.loadLimit) {
              return '#ff0072';
            } else if (n.data.inletThrust > n.data.workingLoad) {
              return '#ffc53d';
            } else {
              return '#eee';
            }
          }}
        />
        {/* <Panel position="top-left">
          <Button>Очистить</Button>
        </Panel> */}
      </ReactFlow>
    </div>
  );
}
