import { useEffect, Dispatch, SetStateAction } from 'react';
import { Node, Edge } from 'reactflow';

export function useUpdateChildNode(
  nodes: Node[],
  setNodes: Dispatch<SetStateAction<Node[]>>,
  edges: Edge[],
  setOnConnectTarget: Dispatch<SetStateAction<string>>,
  оnConnectTarget: any,
) {
  useEffect(() => {
    if (оnConnectTarget) {
      updateAllChildNodes(оnConnectTarget);
    }
  }, [nodes]);

  const updateAllChildNodes = (targetId: string) => {
    const parentEdges = edges.filter((edge) => edge.source === targetId);

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
}
