from dataclasses import dataclass
from typing import Dict, Any, List

@dataclass
class Position:
    x: int
    y: int

@dataclass
class NodeData:
    label: str

@dataclass
class Node:
    id: str
    position: Position
    # type: str
    data: NodeData

@dataclass
class EdgeData:
    current: float

@dataclass
class Edge:
    id: str
    source: str
    target: str
    sourceHandle: str
    targetHandle: str
    data: EdgeData
