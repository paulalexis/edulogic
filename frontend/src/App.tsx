// @ts-nocheck

import { useCallback, useEffect, useState } from "react";
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  NodeToolbar,
  Position,
  useNodesState,
  useEdgesState,
  Handle,
  addEdge,
  Controls,
  MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { AnimatedCurrent } from "./AnimatedCurrent";

const nodeTypes = {
  "node-with-toolbar": NodeWithToolbar,
};
const edgeTypes = {
  "animated-current": AnimatedCurrent,
};

function NodeWithToolbar({ data }) {
  return (
    <>
      {["0", "1", "2", "3"].map((id, k) => (
        <Handle
          type="source"
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={true}
          position={
            [Position.Left, Position.Left, Position.Right, Position.Right][k]
          }
          style={
            [{ top: "20%" }, { top: "80%" }, { top: "20%" }, { top: "80%" }][k]
          }
          id={id}
          key={"source" + id}
        />
      ))}
      {["0", "1", "2", "3"].map((id, k) => (
        <Handle
          type="target"
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={true}
          position={
            [Position.Left, Position.Left, Position.Right, Position.Right][k]
          }
          style={
            [{ top: "20%" }, { top: "80%" }, { top: "20%" }, { top: "80%" }][k]
          }
          id={id}
          key={"target" + id}
        />
      ))}
      <NodeToolbar
        isVisible={data.forceToolbarVisible || undefined}
        position={data.toolbarPosition}
      >
        <button>cut</button>
        <button>copy</button>
        <button>paste</button>
      </NodeToolbar>
      <div>{data?.label}</div>
    </>
  );
}

const bgColor = undefined;

const CustomNodeFlow = () => {
  const [snap, setSnap] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/graph")
      .then((response) => response.json())
      .then((data) => {
        console.log(JSON.stringify(data));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setNodes((_old) =>
          data.nodes.map((data_node) => {
            return {
              ...data_node,
              type: "node-with-toolbar",
            };
          })
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setEdges((_old) =>
          data.edges.map((data_edge) => {
            return {
              ...data_edge,
              id: "e" + data_edge.source + "->" + data_edge.target,
              // animated: true,
              type: "animated-current",
            };
          })
        );
      }, []);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      style={{ background: bgColor }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      snapToGrid={snap}
      snapGrid={[20, 20]}
      fitView
      attributionPosition="bottom-left"
    >
      <MiniMap
        nodeStrokeColor={(n) => {
          if (n.type === "input") return "#0041d0";
          if (n.type === "selectorNode") return bgColor;
          if (n.type === "output") return "#ff0072";
        }}
        nodeColor={(n) => {
          if (n.type === "selectorNode") return bgColor;
          return "#fff";
        }}
      />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

function Main(props) {
  return (
    <div className="full-page">
      <ReactFlowProvider>
        <CustomNodeFlow {...props} />
      </ReactFlowProvider>
    </div>
  );
}

export default Main;
