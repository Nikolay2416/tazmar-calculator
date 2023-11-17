import { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  OnConnect,
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

import cls from './flow.module.css';

const initialNodes: Node = {
  id: '0',
  type: 'custom',
  data: equipment[0],
  position: { x: 0, y: 20 },
};

export function Flow() {
  const { project, getNode, getEdges } = useReactFlow();
  const connectingNodeId = useRef<string>('');
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [оnConnectTarget, setOnConnectTarget] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  const onConnect: OnConnect = useOnConnect(nodes, setNodes, edges, setEdges, setOnConnectTarget);
  useUpdateChildNode(nodes, setNodes, edges, setOnConnectTarget, оnConnectTarget);
  // useUpdateChildNode(nodes, setNodes, edges, setOnConnectTarget, '0');

  const firstLocationNode: number = reactFlowWrapper.current?.clientWidth
    ? reactFlowWrapper.current.clientWidth / 2 - 111.5
    : 0;

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

  // useEffect(() => {
  //   if (оnConnectTarget) {
  //     updateAllChildNodes(nodes, setNodes, edges, setOnConnectTarget, оnConnectTarget);
  //   }
  // }, [nodes, edges]);

  // console.log(edges);

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

      if (targetIsPane && reactFlowWrapper.current) {
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const id = String(nodes.length) + String(Math.floor(Math.random() * 1000000) + 1);

        const newNode: Node = {
          id,
          data: {
            ...equipment[5],
            parentNode: parentNode?.id,
            inletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
            outletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
            // inletThrust: parentNode?.data.outletThrust,
            // outletThrust: parentNode?.data.outletThrust,
          },
          position: project({
            x: (event as MouseEvent).clientX - left - 111.5,
            y: (event as MouseEvent).clientY - top,
          }),
          type: 'custom',
        };

        // console.log(parentNode?.data.outletThrust / (otherConnections.length + 1))
        // console.log(parentNode?.data.outletThrust / (otherConnections.length + 1))
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
                    // inletThrust: parentNode?.data.outletThrust ,
                    // outletThrust: parentNode?.data.outletThrust,
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
        {/* <Background /> */}
        {/* <Panel position="top-left">
          <Button>Очистить</Button>
        </Panel> */}
      </ReactFlow>
    </div>
  );
}
