import numpy as np

from dataclasses import dataclass
from typing import Dict, Any, List

@dataclass
class Position:
    x: int
    y: int

@dataclass
class NodeData:
    label: str
    component: str
    port_potentials: List[float]
    time: List[float]

@dataclass
class Node:
    id: str
    position: Position
    data: NodeData

@dataclass
class EdgeData:
    current: List[float]
    time: List[float]

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
