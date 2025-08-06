import React, { useCallback, useEffect, useState } from "react";
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
  useReactFlow,
} from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
import { useParams, useSearchParams } from "react-router-dom";
import apiService from "./../../services/apiService";
import CustomNode from "./CustomNode";
import { components } from "./../../initial-elements";
import { useTheme } from "@mui/material/styles";

import { Box } from "@mui/material";
import { Position } from "@xyflow/react";
import Sidebar from "./sidebar/Sidebar";

const initialNodes: Node[] = [
  {
    type: "customNode",
    id: "vpc-1",
    position: { x: 150, y: 0 },
    data: {
      header: {
        icon: "vpc",
        label: "VPC",
        sub_label: "Virtual private cloud",
        info: (
          <>
            <h2 style={{ borderBottom: "1px solid #eaeded" }}>VPC</h2>
            <p>
              Amazon Virtual Private Cloud (Amazon VPC) enables you to launch
              AWS resources into a virtual network that you've defined. This
              virtual network closely resembles a traditional network that you'd
              operate in your own data center, with the benefits of using the
              scalable infrastructure of AWS.
            </p>
          </>
        ),
      },
      footer: {
        notes:
          "Note: Your Instances will launch in the {{default_info.region}} region.",
      },
      fields: [
        {
          type: "card",
          label: "VPC settings",
          sub_label: "",
          info: null,
          fields: [
            {
              name: "vpc_name",
              sub_label:
                "Creates a tag with a key of 'Name' and a value that you specify.",
              hint: "",
              label: "Name tag - optional",
              type: "text",
              error_text: "",
              required: false,
              size: 12,
              value: "",
              placeholder: "myproject-production-network-vpc",
              info: (
                <>
                  <p>
                    <strong>Name tag:</strong> (Optional) Name to be used as an
                    identifier for the VPC.
                  </p>
                  <p>
                    <strong>Type:</strong> string
                  </p>
                  <p>
                    <strong>Default value:</strong> "" (empty string)
                  </p>

                  <h3>Best Practices:</h3>
                  <ul>
                    <li>
                      Choose a meaningful and unique name for the VPC that
                      reflects its purpose or environment.
                    </li>
                    <li>
                      Follow a consistent naming convention for all resources to
                      improve clarity and organization.
                    </li>
                    <li>
                      <code>
                        projectName-environmentName-vpcPurpose[-additionalInfo]
                      </code>
                    </li>
                  </ul>
                  <p>
                    <strong>Example:</strong> "myproject-production-network-vpc"
                  </p>

                  <h3>Considerations:</h3>
                  <ul>
                    <li>
                      The VPC name is used as an identifier for the VPC
                      resource.
                    </li>
                    <li>
                      Ensure the name adheres to naming conventions and
                      restrictions.
                    </li>
                  </ul>

                  <h3>Validation:</h3>
                  <ul>
                    <li>
                      The name should be a string with a maximum length of 50
                      characters.
                    </li>
                    <li>
                      Allowed characters: Alphanumeric, underscores, and dashes.
                    </li>
                  </ul>

                  <h3>Note:</h3>
                  <p>
                    Use a name that helps easily identify the VPC's purpose or
                    environment in a multi-resource environment.
                  </p>
                </>
              ),
            },
            {
              name: "use_ipam_pool",
              label: "IPv4 CIDR block",
              type: "radio",
              size: 12,
              required: true,
              value: "false",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    IPv4 CIDR block
                  </h2>
                  <p>
                    Specify an IPv4 CIDR block (or IP address range) for your
                    VPC.
                  </p>
                  <p>
                    If there is an Amazon VPC IP Address Manager (IPAM) IPv4
                    address pool available in this Region, you can get a CIDR
                    from an IPAM pool. If you select an IPAM pool, the size of
                    the CIDR is limited by the allocation rules on the IPAM pool
                    (allowed minimum, allowed maximum, and default).
                  </p>
                  <p>
                    If there is no IPv4 IPAM pool in this Region, you can
                    manually input an IPv4 CIDR. The CIDR block size must have a
                    size between /16 and /28.
                  </p>
                </>
              ),
              options: [
                {
                  value: "false",
                  label: "IPv4 CIDR manual input",
                },
                {
                  value: "true",
                  label: "IPAM-allocated IPv4 CIDR block",
                  disabled: true,
                },
              ],
            },
            {
              depends_on: "values.use_ipam_pool === 'false'",
              name: "cidr",
              sub_label: "",
              placeholder: "10.0.0.0/24",
              label: "IPv4 CIDR",
              hint: "CIDR block size must be between /16 and /28.",
              type: "text",
              error_text: "CIDR cannot be empty",
              required: true,
              size: 12,
              value: "",
              info: (
                <>
                  <p>
                    <strong>Description:</strong> The IPv4 CIDR block for the
                    VPC.
                  </p>
                  <p>
                    <strong>Type:</strong> string
                  </p>
                  <p>
                    <strong>Default:</strong> ""
                  </p>

                  <h3>Example:</h3>
                  <ul>
                    <li>Specify CIDR block: "10.1.0.0/16"</li>
                  </ul>

                  <h3>Note:</h3>
                  <ul>
                    <li>
                      CIDR block size must be between <code>/16</code> and{" "}
                      <code>/28</code>.
                    </li>
                  </ul>
                </>
              ),
            },
            {
              depends_on: "values.use_ipam_pool === 'true'",
              name: "ipv6_ipam_pool_id",
              sub_label: "",
              placeholder: "Choose an IPAM pool",
              label: "IPv4 IPAM pool",
              hint: "The locale of the IPAM pool must be equal to the current region.",
              type: "select",
              error_text: "IPv4 IPAM pool selection is required.",
              required: "values.use_ipam_pool === 'true'",
              size: 12,
              value: "",
              options: [],
              info: null,
            },
            {
              depends_on: "values.use_ipam_pool === 'true'",
              name: "ipv6_netmask_length",
              sub_label: "",
              placeholder: "Choose a netmask",
              label: "Netmask",
              hint: "",
              type: "select",
              error_text: "Netmask selection is required.",
              required: "values.use_ipam_pool === 'true'",
              size: 12,
              value: "",
              options: [],
              info: null,
            },
            {
              name: "enable_ipv6",
              label: "IPv6 CIDR block",
              type: "radio",
              size: 12,
              required: true,
              value: "false",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>
                    IPv6 CIDR block
                  </h2>
                  <p>Specifying an IPv6 CIDR Block for Your VPC</p>
                  <p>
                    If there is an Amazon VPC IP Address Manager (IPAM) IPv6
                    address pool available in this Region, you can provision a
                    CIDR from an IPAM pool.
                  </p>
                  <p>
                    If there is no IPv6 IPAM pool in this Region, Amazon can
                    provide the IPv6 CIDR for you. Amazon provides a fixed IPv6
                    CIDR block size of /56. You cannot configure the size of the
                    IPv6 CIDR that Amazon provides.
                  </p>
                  <p>
                    If you have brought your own IPv6 CIDR to AWS, you can
                    specify an IPv6 CIDR block from your address pool.
                  </p>
                </>
              ),
              options: [
                {
                  value: "false",
                  label: "No IPv6 CIDR block",
                },
                {
                  value: "IPAM-allocated_IPv6_CIDR_block",
                  label: "IPAM-allocated IPv6 CIDR block",
                  disabled: true,
                },
                {
                  value: "Amazon-provided_IPv6_CIDR_block",
                  label: "Amazon-provided IPv6 CIDR block",
                  disabled: true,
                },
                {
                  value: "IPv6_CIDR_owned_by_me",
                  label: "IPv6 CIDR owned by me",
                  disabled: true,
                },
              ],
            },
            {
              name: "instance_tenancy",
              label: "Tenancy",
              type: "select",
              size: 12,
              required: true,
              value: "default",
              info: (
                <>
                  <h2 style={{ borderBottom: "1px solid #eaeded" }}>Tenancy</h2>
                  <p>
                    You can run instances in your VPC on single-tenant,
                    dedicated hardware.
                  </p>
                  <p>
                    Select <strong>Default</strong> to ensure that instances
                    launched in this VPC use the tenancy attribute specified at
                    launch or if you are creating a VPC for Outposts private
                    connectivity.
                  </p>
                  <p>
                    Select <strong>Dedicated</strong> to ensure that instances
                    launched in this VPC are run on dedicated tenancy instances
                    regardless of the tenancy attribute specified at launch.
                  </p>
                  <p>
                    If your Outposts VPCs require private connectivity, you must
                    select <strong>Default</strong>.
                  </p>
                </>
              ),
              options: [
                {
                  value: "default",
                  label: "Default",
                },
                {
                  value: "dedicated",
                  label: "Dedicated",
                },
              ],
            },
          ],
        },
        {
          type: "card",
          label: "Tags",
          sub_label:
            "A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value. You can use tags to search and filter your resources or track your AWS costs.",
          info: null,
          fields: [
            {
              name: "tags",
              label: "",
              sub_label: "",
              hint: "You can add 50 tags",
              type: "list<key-value>",
              size: 12,
              required: true,
              value: {
                created_by: "{{default_info.user_name}}",
              },
              config: {
                key: {
                  name: "key",
                  label: "Key",
                  sub_label: "",
                  required: true,
                  error_text: "You must specify a tag key",
                  size: 5,
                  type: "text",
                  info: null,
                },
                value: {
                  name: "value",
                  label: "Value - optional",
                  sub_label: "",
                  size: 5,
                  type: "text",
                  info: null,
                },
                add_button: {
                  label: "Add new tag",
                  variant: "outlined",
                  icon: "",
                },
                remove_button: {
                  label: "Delete",
                  variant: "outlined",
                  icon: "fa-trash",
                  style: {
                    fontSize: "24px",
                    color: "#d11a2a",
                    cursor: "pointer",
                  },
                  size: 2,
                },
              },
              info: null,
            },
          ],
        },
      ],
      values: {
        use_ipam_pool: "false",
        enable_ipv6: "false",
        instance_tenancy: "default",
        tags: {
          created_by: "{{default_info.user_name}}",
        },
      },
      handles: [
        {
          type: "source",
          position: Position.Right,
        },
      ],
    },
  },
];
const initialEdges: Edge[] = [];
const elk = new ELK();

const useLayoutedElements = () => {
  const { getNodes, setNodes, getEdges, fitView } = useReactFlow();

  const defaultOptions = {
    "elk.algorithm": "layered",
    "elk.layered.spacing.nodeNodeBetweenLayers": 100,
    "elk.spacing.nodeNode": 80,
  };

  const getLayoutedElements = useCallback(
    (options = {}) => {
      const layoutOptions = { ...defaultOptions, ...options };

      const graph = {
        id: "root",
        layoutOptions,
        children: getNodes().map((node) => ({
          ...node,
          width: 180,
          height: 40,
        })),
        edges: getEdges(),
      };

      elk.layout(graph).then(({ children }) => {
        children.forEach((node) => {
          node.position = { x: node.x, y: node.y };
        });

        setNodes(children);
        window.requestAnimationFrame(() => {
          fitView();
        });
      });
    },
    [getNodes, getEdges, setNodes, fitView]
  );

  return { getLayoutedElements };
};

const OrchestratorReactFlow: React.FC = () => {
  const theme = useTheme();
  const { template_id } = useParams<{ template_id: string }>();
  const [searchParams] = useSearchParams();
  const template_type = searchParams.get("template_type");

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { getLayoutedElements } = useLayoutedElements();
  const drawerWidth = 240;
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Wait a short time before calling fitView so DOM updates finish
    const timeout = setTimeout(() => {
      fitView();
    }, 300);
    return () => clearTimeout(timeout);
  }, [sidebarOpen, fitView]);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme.palette.mode);
  }, [theme.palette.mode]);

  useEffect(() => {
    apiService
      .get(`/wrapper/${template_type}?template_id=${template_id}`)
      .then((wrapper) => {
        const wrapperData = wrapper?.data?.[0];

        if (wrapperData?.nodes) {
          const updatedNodes = wrapperData.nodes.map((node: any) => {
            const component = components?.[node.component_name];
            return {
              ...node,
              ...(component ?? {}),
              type: component ? component.type : "customNode",
            };
          });

          setNodes(updatedNodes);
        }

        setEdges(wrapperData?.edges ?? []);

        // Run layout after nodes/edges are updated
        setTimeout(() => {
          getLayoutedElements({
            "elk.algorithm": "layered",
            "elk.direction": "DOWN",
          });
        }, 100);
      });
  }, [template_id, template_type, setNodes, setEdges, getLayoutedElements]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box
      sx={{
        height: "calc(100vh - 65px)",
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Box
        sx={{
          flexGrow: 1,
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          transition: 'width 0.3s ease',
        }}
      >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        colorMode={theme.palette.mode}
        nodeTypes={{ customNode: CustomNode }}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
      </Box>
    </Box>
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
