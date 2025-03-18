import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  Position,
  type EdgeProps,
} from "@xyflow/react";
import { Graph } from "./GraphHover";

function getPathLength(d: string): number {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  return path.getTotalLength();
}

export default function WidePath(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;

  // const edgePath = getBezierPath({ curvature: 0.1, ...props });

  const radiusX = Math.abs(sourceX - targetX) * 0.6;
  const radiusY = radiusX * 1;
  const edgePath = `M ${sourceX} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${targetX} ${targetY}`;

  return [edgePath];
}

export function AnimatedCurrent(props: EdgeProps) {
  const {
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  } = props;
  const current =
    (data?.current.reduce((a, b) => a + b, 0) as number) / data?.current.length;

  let [sX, sY, tX, tY, sP, tP] = [
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  ];
  if (current < 0) {
    [sX, sY, tX, tY, sP, tP] = [tX, tY, sX, sY, tP, sP];
  }

  const [edgePath] = (source !== target ? getSmoothStepPath : WidePath)({
    ...props,
    sourceX: sX,
    sourceY: sY,
    targetX: tX,
    targetY: tY,
    sourcePosition: sP,
    targetPosition: tP,
  });

  const L = getPathLength(edgePath);

  const circleRadius = 3;
  const speed = Math.abs(current) * 2000;
  const idealWavelength = 3 * 2 * circleRadius;

  const numberOfCircles = Math.round(L / idealWavelength);
  const dur = L / speed;

  const circles = [];
  for (let i = 0; i < numberOfCircles; i++) {
    circles.push(
      <circle key={`circle-${id}-${i}`} r={circleRadius} fill="#FFEA00">
        <animateMotion
          dur={`${dur}s`}
          repeatCount="indefinite"
          path={edgePath}
          begin={`${(i * dur) / numberOfCircles}s`}
        />
      </circle>
    );
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      {circles}
    </>
  );
}
