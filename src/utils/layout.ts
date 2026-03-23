import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Adjust these values based on your node sizes
const nodeWidth = 220;
const nodeHeight = 80;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  
  // Configure dagre layout
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 100, // increased horizontal spacing between nodes
    edgesep: 80,  // added edge separation
    ranksep: 150, // increased vertical spacing between ranks
    // align: 'DL' // removed alignment to allow default centering which reduces overlaps
  });

  // Add nodes to dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Add edges to dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to React Flow nodes
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  const newEdges = edges.map((edge) => {
    const newEdge = { ...edge };
    if (isHorizontal) {
      newEdge.sourceHandle = 'right';
      newEdge.targetHandle = 'left';
    } else {
      delete newEdge.sourceHandle;
      delete newEdge.targetHandle;
    }
    return newEdge;
  });

  return { nodes: newNodes, edges: newEdges };
};
