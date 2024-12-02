import React, { useCallback, useEffect } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    Node,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Edge,
    useReactFlow
} from "@xyflow/react";
import CustomNode from "./CustomNode";
import ELK from 'elkjs/lib/elk.bundled.js';
import { useParams, useSearchParams } from "react-router-dom";
import apiService from './../../services/apiService';
import { components } from './../../initial-elements';

const initialNodes: Node[] = [];

const initialEdges: Edge[] = [];

const elk = new ELK();

const useLayoutedElements = () => {
    const { getNodes, setNodes, getEdges, fitView } = useReactFlow();
    const defaultOptions = {
      'elk.algorithm': 'layered',
      'elk.layered.spacing.nodeNodeBetweenLayers': 100,
      'elk.spacing.nodeNode': 80,
    };
   
    const getLayoutedElements = useCallback((options) => {
      const layoutOptions = { ...defaultOptions, ...options };
      const graph = {
        id: 'root',
        layoutOptions: layoutOptions,
        children: getNodes().map((node) => ({
          ...node,
          width: node.measured.width,
          height: node.measured.height,
        })),
        edges: getEdges(),
      };
   
      elk.layout(graph).then(({ children }) => {
        // By mutating the children in-place we saves ourselves from creating a
        // needless copy of the nodes array.
        children.forEach((node) => {
          node.position = { x: node.x, y: node.y };
        });
   
        setNodes(children);
        window.requestAnimationFrame(() => {
          fitView();
        });
      });
    }, []);
   
    return { getLayoutedElements };
};

const OrchestratorReactFlow: React.FC = () => {
    const { template_id } = useParams<{ template_id: string }>();
    const [searchParams] = useSearchParams();
    const template_type = searchParams.get("template_type");
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const { getLayoutedElements } = useLayoutedElements();

    useEffect(() => {
        getLayoutedElements({
            'elk.algorithm': 'layered',
            'elk.direction': 'DOWN',
        });
        apiService.get(`/wrapper/${template_type}?&template_id=${template_id}`).then((wrapper) => {
            if(wrapper?.data[0]?.nodes) {
                setNodes(wrapper?.data[0]?.nodes.map((node: any) => {
                    // node.type = 'customNode';
                    if(components?.[node?.component_name]){
                        return {
                            ...node,
                            ...components[node?.component_name]
                        };
                    }
                    node.type = 'customNode';
                    return node;
                }));
            }
            setEdges(wrapper?.data[0]?.edges ?? [])
        });
    }, []);

    useEffect(() => {
        console.log(nodes);
    }, [nodes]);

    // Handle edge creation
    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
            </div>
        </ReactFlowProvider>
    );
};

const Orchestrator: React.FC = () => {
    return (
        <ReactFlowProvider>
          <OrchestratorReactFlow />
        </ReactFlowProvider>
    );
};

export default Orchestrator;

