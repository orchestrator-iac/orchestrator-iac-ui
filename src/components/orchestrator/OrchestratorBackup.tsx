import React, { useCallback } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    Node,
    Position,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Edge,
    useReactFlow
} from "@xyflow/react";
import * as d3 from "d3";
import CustomNode from "./CustomNode";

const initialNodes: Node[] = [
    {
        id: "1",
        type: "customNode",
        data: { label: "Root Node", details: "Details about the root" },
        position: { x: 250, y: 5 },
    },
    {
        id: "2",
        type: "customNode",
        data: { label: "Root Node", details: "Details about the root" },
        position: { x: 250, y: 5 },
    },
];

const initialEdges: Edge[] = [];

const ReactFlowComponent: React.FC = () => {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Handle edge creation
    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // Generate hierarchical layout using D3
    const generateHierarchy = () => {
        const hierarchyData = d3.hierarchy({
            name: "Root",
            children: [
                { name: "Child 1" },
                { name: "Child 2", children: [{ name: "Grandchild" }] },
            ],
        });

        const treeLayout = d3.tree().size([400, 200]);
        const tree = treeLayout(hierarchyData);

        const newNodes = tree.descendants().map((node, index) => ({
            id: (index + 1).toString(),
            type: "customNode",
            data: { label: node.data.name, details: `Details about ${node.data.name}` },
            position: { x: node.x, y: node.y },
        }));

        setNodes(newNodes);
    };

    return (
        <ReactFlowProvider>
            <div style={{ height: "calc(100vh - 65px)", width: "100%" }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={{ customNode: CustomNode }}
                    proOptions={{ hideAttribution: true }}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap nodeStrokeWidth={3} zoomable pannable />
                </ReactFlow>
                <button onClick={generateHierarchy} style={{ position: "absolute", top: 10, left: 10 }}>
                    Generate Hierarchy
                </button>
            </div>
        </ReactFlowProvider>
    );
};

// export default ReactFlowComponent;

export default function () {
    return (
      <ReactFlowProvider>
        <ReactFlowComponent />
      </ReactFlowProvider>
    );
}
