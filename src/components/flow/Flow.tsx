import { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  OnConnect,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MiniMap,
} from 'reactflow';

import { useOnConnect } from '../../hook/useOnConnect';
import { useUpdateChildNode } from '../../hook/useUpdateChildNode';
import { equipment } from '../../data/equipment';
import { nodeTypes } from '../customNode/CustomNode';
import { edgeTypes } from '../customEdge/CustomEdge';
import { Equipment } from '../../type/type';

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

  console.log(edges);

  //@ts-ignore
  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    //@ts-ignore
    (event) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');
      const parentNode = getNode(connectingNodeId.current);
      const edges = getEdges();
      const otherConnections = edges.filter((edge) => edge.source === parentNode?.id);

      if (targetIsPane) {
        //@ts-ignore
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const id = String(nodes.length) + String(Math.floor(Math.random() * 1000000) + 1);

        const newNode = {
          id,
          data: {
            ...equipment[5],
            parentNode: parentNode?.id,
            inletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
            outletThrust: parentNode?.data.outletThrust / (otherConnections.length + 1),
          },
          position: project({ x: event.clientX - left - 111.5, y: event.clientY - top }),
          type: 'custom',
        };

        //@ts-ignore
        setNodes((nds) => nds.concat(newNode));

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

        //@ts-ignore
        setEdges((eds) => eds.concat({ id, source: connectingNodeId.current, target: id, type: 'custom' }));
      }
    },
    [project],
  );

  return (
    // <div className={cls.flow}>
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
        //@ts-ignore
          nodeStrokeColor={(n) => {
            console.log(n)
            // if (n.data.inletThrust > n.data.workingLoad) return '#ffe58f';
            // if (n.type === 'selectorNode') return '#1A192B';
            // if (n.type === 'output') return '#ff0072';

            if (n.data.inletThrust > n.data.loadLimit) {
              return '#ff0072'
            } else if (n.data.inletThrust > n.data.workingLoad) {
              return '#ffc53d'
            } else {
              return '#1A192B'
            }
          }}
          nodeColor={(n) => {
            if (n.data.inletThrust > n.data.loadLimit) {
              return '#ff0072'
            } else if (n.data.inletThrust > n.data.workingLoad) {
              return '#ffc53d'
            } else {
              return '#eee'
            }
          }}
        />
        {/* <Background /> */}
        {/* <Panel position="top-left">
          <Button>Очистить</Button>
        </Panel> */}
      </ReactFlow>
    </div>
    // </div>
  );
}

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { Button, Select } from 'antd';
// import ReactFlow, {
//   Controls,
//   Background,
//   Node,
//   Edge,
//   OnConnect,
//   Panel,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   useReactFlow,
//   ReactFlowProvider,
// } from 'reactflow';

// import { useOnConnect } from '../../hook/useOnConnect';
// import { equipment } from '../../data/equipment';
// import { nodeTypes } from '../customNode/CustomNode';
// import { Equipment } from '../../type/type';

// import cls from './flow.module.css';
// import 'reactflow/dist/style.css';
// import './flow.css';

// const initialNodes = [
//   {
//     id: '0',
//     type: 'input',
//     // data: { label: 'Node' },
//     data: equipment[0],
//     position: { x: 0, y: 50 },
//   },
// ];

// let id = 1;
// const getId = () => `${id++}`;

// const fitViewOptions = {
//   padding: 3,
// };

// export function Flow() {
//   const [valueSelect, setValueSelect] = useState<string>('');
//   const [оnConnectTarget, setOnConnectTarget] = useState<string>('');
//   // const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
//   // const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
//   const flowRef = useRef<HTMLDivElement | null>(null);
//   // const onConnect: OnConnect = useOnConnect(nodes, setNodes, edges, setEdges, setOnConnectTarget);

//   const reactFlowWrapper = useRef(null);
//   const connectingNodeId = useRef(null);
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState([]);
//   const { project } = useReactFlow();
//   //@ts-ignore
//   const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

//   //@ts-ignore
//   const onConnectStart = useCallback((_, { nodeId }) => {
//     connectingNodeId.current = nodeId;
//   }, []);

//   const onConnectEnd = useCallback(
//     //@ts-ignore
//     (event) => {
//       const targetIsPane = event.target.classList.contains('react-flow__pane');
//       console.log(connectingNodeId.current);

//       if (targetIsPane) {
//         // we need to remove the wrapper bounds, in order to get the correct position
//         //@ts-ignore
//         const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
//         const id = getId();
//         const newNode = {
//           id,
//           // we are removing the half of the node width (75) to center the new node
//           position: project({ x: event.clientX - left - 75, y: event.clientY - top }),
//           data: { label: `Node ${id}` },
//           type: 'custom',
//         };

//         //@ts-ignore
//         setNodes((nds) => nds.concat(newNode));
//         //@ts-ignore
//         setEdges((eds) => eds.concat({ id, source: connectingNodeId.current, target: id }));
//       }
//     },
//     [project],
//   );

//   useEffect(() => {
//     if (оnConnectTarget) {
//       updateAllChildNodes(оnConnectTarget);
//     }
//   }, [nodes]);

//   const updateAllChildNodes = (targetId: string) => {
//     const parentEdges = edges.filter((edge) => edge.source === targetId);

//     console.log(parentEdges);

//     if (parentEdges.length === 0) {
//       setOnConnectTarget('');
//     }

//     parentEdges.forEach((edge) => {
//       const childNode = nodes.find((node) => node.id === edge.target);
//       //@ts-ignore
//       const parentNode = nodes.find((node) => node.id === childNode?.data.parentNode);

//       if (childNode) {
//         let recalculationOutletThrust;

//         //@ts-ignore
//         if (childNode.data.category === 'Гиня4') {
//           //@ts-ignore
//           recalculationOutletThrust = parentNode?.data.outletThrust * 4;
//           //@ts-ignore
//         } else if (childNode.data.category === 'Гиня7') {
//           //@ts-ignore
//           recalculationOutletThrust = parentNode?.data.outletThrust * 7;
//         } else {
//           //@ts-ignore
//           recalculationOutletThrust = parentNode?.data.outletThrust;
//         }

//         const updatedChildNode = {
//           ...childNode,
//           data: {
//             ...childNode.data,
//             //@ts-ignore
//             inletThrust: parentNode?.data.outletThrust / parentEdges.length,
//             //@ts-ignore
//             outletThrust: recalculationOutletThrust / parentEdges.length,
//           },
//         };

//         setNodes((prevNodes) => [...prevNodes.filter((node) => node.id !== childNode.id), updatedChildNode]);
//         setOnConnectTarget(childNode.id);
//       }
//     });
//   };

//   const handleAddNode = () => {
//     if (!valueSelect) return;

//     const value = equipment.find((item: Equipment) => item.value === valueSelect);
//     const verticalArrangement: number = parseInt(String(nodes.length) + '0');
//     const firstLocationNode: number = flowRef.current?.clientWidth ? flowRef.current.clientWidth / 2 - 73 : 0;
//     const locationNode: number = flowRef.current?.clientWidth ? flowRef.current.clientWidth - 250 : 0;

//     const newNode: Node = {
//       id: value?.label + String(nodes.length) + String(Math.floor(Math.random() * 1000000) + 1),
//       data: { ...value, parentNode: '' },
//       position: { x: nodes.length === 0 ? firstLocationNode : locationNode, y: verticalArrangement },
//       type: nodes.length === 0 ? 'input' : 'custom',
//     };

//     setNodes((prevNodes) => [...prevNodes, newNode]);
//   };

//   return (
//     <div className={cls.flow}>
//       {/* <div className={cls.bodyReactFlow} ref={flowRef} > */}
//       <div className={cls.bodyReactFlow} ref={reactFlowWrapper}>
//         <ReactFlow
//           // nodes={nodes}
//           // onNodesChange={onNodesChange}
//           // edges={edges}
//           // onEdgesChange={onEdgesChange}
//           // onConnect={onConnect}
//           // nodeTypes={nodeTypes}

//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           onConnect={onConnect}
//           onConnectStart={onConnectStart}
//           onConnectEnd={onConnectEnd}
//           // fitView
//           // fitViewOptions={fitViewOptions}
//           nodeTypes={nodeTypes}
//         >
//           <Background />
//           <Controls />
//           <Panel position="top-left">
//             <div className={cls.bodyEquipmentSelection}>
//               <Select className={cls.antdSelect} onChange={(value) => setValueSelect(value)} options={equipment} />
//               <div>
//                 <Button onClick={handleAddNode} className={cls.antdButton}>
//                   Добавить
//                 </Button>
//               </div>
//             </div>
//           </Panel>
//         </ReactFlow>
//       </div>
//     </div>
//   );
// }
