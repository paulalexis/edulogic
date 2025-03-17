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

@dataclass
class Element:
    address: int
    component: str
    value: float | tuple[float, float]

@dataclass
class Connection:
    address1: int
    port1: int
    address2: int
    port2: int
