import React from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

export function AnimatedCurrentSimple({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <circle r="5" fill="#FFEA00">
        <animateMotion dur="0.5s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}

export function AnimatedCurrent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const current = data?.current as number;
  if (current < 0) {
    [sourceX, sourceY, targetX, targetY] = [targetX, targetY, sourceX, sourceY];
  }
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // lenght in L1 space
  const L = Math.abs(sourceX - targetX) + Math.abs(sourceY - targetY);
  const circleRadius = 5;
  const speed = Math.abs(current) * 20;
  const idealWavelength = 2 * 2 * circleRadius;

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
