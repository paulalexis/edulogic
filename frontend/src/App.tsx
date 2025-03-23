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
import { Graph } from "./GraphHover";

const nodeTypes = {
  "node-with-toolbar": NodeWithToolbar,
};
const edgeTypes = {
  "animated-current": AnimatedCurrent,
};

function NodeWithToolbar({ data }) {
  const xValues = [1, 2, 3, 4, 5];
  const yValues = [10, 15, 7, 20, 12];

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
            [{ top: "80%" }, { top: "20%" }, { top: "80%" }, { top: "20%" }][k]
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
            [{ top: "80%" }, { top: "20%" }, { top: "80%" }, { top: "20%" }][k]
          }
          id={id}
          key={"target" + id}
        />
      ))}
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
    const fetchData = () => fetch("http://192.168.137.241:5000/api/graph")
      .then((response) => response.json())
      .then((data) => {
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
        setEdges((old_edge) =>
          data.edges.map((data_edge) => {
            return {
              ...data_edge,
              position: old_edge.position || data_edge.position,
              id: "e" + data_edge.source + "p" + data_edge.sourceHandle + "->" + data_edge.target + "p" + data_edge.targetHandle,
              // animated: true,
              type: "animated-current",
            };
          })
        );
      }, []);

    fetchData(); // Fetch immediately when the component mounts
    // const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds
    // return () => clearInterval(intervalId); // Clear the interval when the component unmounts

  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  return (
    <>
      <div style={{ width: "70%", height: "100%" }}>
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
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <div
        style={{
          width: "40%",
          height: "90%",
          margin: "5%",
        }}
      >
        <div style={{ height: "50%" }}>
          <Graph
            x={(nodes || []).map((n) => n.data.time)[0] || []}
            ys={(nodes || []).map((n) =>
              n.data.time.map(
                (t, idx) =>
                  n.data.port_potentials[0][idx] -
                  n.data.port_potentials[2][idx]
              )
            )}
            xlabel="Temps [s]"
            ylabels={(nodes || []).map((n) => n.data.label)}
          />
        </div>
        <div style={{ height: "50%" }}>
          <Graph
            x={(edges || []).map((e) => e.data.time)[0] || []}
            ys={(edges || []).map((e) => e.data.current)}
            xlabel="Temps [s]"
            ylabels={(edges || []).map((e) => e.id)}
          />
        </div>
      </div>
    </>
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
