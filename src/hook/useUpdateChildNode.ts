import { useEffect, Dispatch, SetStateAction, useState } from 'react';
import { useReactFlow } from 'reactflow';

export function useUpdateChildNode(оnConnectTarget: string, setOnConnectTarget: Dispatch<SetStateAction<string>>) {
  const { getEdges, getNodes, setNodes } = useReactFlow();
  const nodes = getNodes();
  const edges = getEdges();

  useEffect(() => {
    if (оnConnectTarget) {
      updateAllChildNodes(оnConnectTarget);
    }
    console.log('!');
  }, [nodes, edges]);

  const updateAllChildNodes = (targetId: string) => {
    const parentEdges = edges.filter((edge) => edge.source === targetId);

    if (parentEdges.length === 0) {
      setOnConnectTarget('');
      return;
    }

    parentEdges.forEach((edge) => {
      const childNode = nodes.find((node) => node.id === edge.target);
      const parentNode = nodes.find((node) => node.id === childNode?.data.parentNode);
      const otherParentConnections = edges.filter((edge) => edge.source === parentNode?.id);
      const parentConnectionsWithNode = edges.filter((edge) => edge.target === childNode?.id);

      let parentOutletThrust = 0;
      nodes.map((node) => {
        for (let i = 0; i < parentConnectionsWithNode.length; i++) {
          if (parentConnectionsWithNode && node.id === parentConnectionsWithNode[i]?.source) {
            parentOutletThrust += node.data.outletThrust;
            return;
          }
        }
      });

      setNodes((prevNodes) => {
        const updatedNodes = prevNodes.map((node) => {
          for (let i = 0; i < otherParentConnections.length; i++) {
            if (node.id === otherParentConnections[i].target) {
              let recalculationOutletThrust;

              if (node.data.category === 'Гиня4') {
                recalculationOutletThrust = parentOutletThrust * 4;
              } else if (node.data.category === 'Гиня7') {
                recalculationOutletThrust = parentOutletThrust * 7;
              } else {
                recalculationOutletThrust = parentOutletThrust;
              }

              return {
                ...node,
                data: {
                  ...node.data,
                  inletThrust: parentOutletThrust / otherParentConnections.length,
                  outletThrust: recalculationOutletThrust / otherParentConnections.length,
                },
              };
            }
          }
          return node;
        });
        setOnConnectTarget(childNode?.id ?? '');
        return updatedNodes;
      });
    });
  };
}
