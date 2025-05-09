from graph import *
from okletsgo import get_nodes, get_edges, set_current

from PySpice.Physics.SemiConductor import ShockleyDiode
from PySpice.Doc.ExampleTools import find_libraries
from flask import Flask, Response, jsonify, render_template
from flask_cors import CORS  # This lets React talk to Python
from PySpice.Probe.Plot import plot
from PySpice.Spice.Library import SpiceLibrary
from PySpice.Spice.Netlist import Circuit
from PySpice.Unit import *
import matplotlib.pyplot as plt
import io

import matplotlib.pyplot as plt

import PySpice.Logging.Logging as Logging
logger = Logging.setup_logging()


libraries_path = find_libraries()
spice_library = SpiceLibrary(libraries_path)


app = Flask(__name__)
CORS(app)


@app.route('/api/graph')
def test():

    print("-"*60)

    """
    elements: list[Element] = [
        Element(11, "V", 3@u_V),
        Element(12, "R", 5@u_Ω),
        Element(13, "L", 1000.@u_mH)
    ]
    connections: list[Connection] = [
        Connection(11, 3, 12, 2),
        Connection(12, 0, 13, 0),
        Connection(13, 2, 11, 1),
    ]
    connections: list[Connection] = [
        Connection(11, 0, 12, 0),
        Connection(11, 1, 13, 0),
        Connection(12, 2, 11, 2),
        Connection(13, 2, 11, 3),
    ]
    """

    elements: list[Element] = get_nodes()
    connections: list[Connection] = get_edges()

    print(elements)
    print(connections)

    circuit = Circuit("main")

    def PORT_FMT(addr, port): return f'el_{addr}_port_{port}'

    N_V = 0

    # make a ground
    circuit.V(N_V, circuit.gnd, PORT_FMT(elements[0].address, 0), 0@u_V)
    N_V += 1

    # connect port 0-1 and 2-3
    for e in elements:
        circuit.V(N_V, PORT_FMT(e.address, 0), PORT_FMT(e.address, 1), 0@u_V)
        # circuit.R(N_V, PORT_FMT(e.address, 0), f"tmp_v{N_V}", 1@u_Ω)
        # circuit.V(N_V, f"tmp_v{N_V}", PORT_FMT(e.address, 1), 0@u_V)
        N_V += 1
        circuit.V(N_V, PORT_FMT(e.address, 2), PORT_FMT(e.address, 3), 0@u_V)
        # circuit.R(N_V, PORT_FMT(e.address, 2), f"tmp_v{N_V}", 1@u_Ω)
        # circuit.V(N_V, f"tmp_v{N_V}", PORT_FMT(e.address, 3), 0@u_V)
        N_V += 1

    # actual components
    for e in elements:
        compo = {
            "V": None,
            "R": circuit.R,
            "L": circuit.L,
            "C": circuit.C,
            "AC": None,
        }[e.component]

        TMP = f"TMP_{N_V}"
        circuit.V(N_V, PORT_FMT(e.address, 0), TMP, 0@u_V)
        e.numbered = N_V
        N_V += 1

        if e.component == "V":
            circuit.PulseVoltageSource(N_V, TMP, PORT_FMT(e.address, 2), initial_value=0., pulsed_value=float(
                e.value), pulse_width=100., period=100., delay_time=0.1, rise_time=0.)
        elif e.component == "AC":
            circuit.PulseVoltageSource(N_V, TMP, PORT_FMT(e.address, 2), initial_value=0., pulsed_value=float(
                e.value), pulse_width=0.1, period=0.2, delay_time=0.1, rise_time=0.)
        else:
            compo(N_V, TMP, PORT_FMT(e.address, 2), e.value)
        N_V += 1

    # actual connections
    for c in connections:
        circuit.V(N_V, PORT_FMT(c.address1, c.port1),
                  PORT_FMT(c.address2, c.port2), 0@u_V)
        c.numbered = N_V
        N_V += 1

    # circuit.V(40, 'in', circuit.gnd, 1@u_V)
    # circuit.R(1, 'in', circuit.gnd, 1@u_kΩ).plus.add_current_probe(circuit)
    # circuit.R(2, 'in', circuit.gnd, 2@u_kΩ).plus.add_current_probe(circuit)

    simulator = circuit.simulator(temperature=25, nominal_temperature=25)
    # analysis = simulator.operating_point()
    analysis = simulator.transient(step_time=1@u_ms, end_time=1@u_s)

    def to_list(waveform):
        # print(waveform.abscissa)
        return [float(x) for x in waveform]

    lt = to_list(analysis.time)

    for e in elements:
        current = float(analysis.branches[f"v{e.numbered}"].mean())
        set_current(e.address, int(100*np.tanh(10.*current)))

    return jsonify(to_dicts(
        [
            Node(
                id=str(e.address),
                position=Position(x=np.random.random()*300,
                                  y=np.random.random()*300),
                data=NodeData(
                    label=f"{e.component}{e.address} : {e.value:.1e}{({'R': 'Ohm', 'V': 'V', 'L': 'H', 'C':'F'}).get(e.component, '')}",
                    component=e.component,
                    port_potentials=[
                        to_list(analysis.nodes[PORT_FMT(e.address, k)]) for k in range(4)],
                    time=lt,
                ),
            )
            for idx, e in enumerate(elements)
        ],
        [
            Edge(
                id=str(c),
                source=str(c.address1),
                target=str(c.address2),
                sourceHandle=str(c.port1),
                targetHandle=str(c.port2),
                data=EdgeData(
                    current=to_list(analysis.branches[f"v{c.numbered}"]),
                    time=lt,
                )
            )
            for idx, c in enumerate(connections)
        ]
    ))


@app.route('/api/message')
def get_message():
    message = {"text": "Hello from the Python backend!"}
    return jsonify(message)


def to_dicts(nodes: List[Node], edges: List[Edge]) -> Response:
    nodes_dict = [node.__dict__ for node in nodes]
    edges_dict = [edge.__dict__ for edge in edges]

    return {"nodes": nodes_dict, "edges": edges_dict}


@app.route('/api/graphold')
def get_graph_data():
    nodes = [
        Node(id="1", position=Position(x=0, y=0), data=NodeData(
            label="[Py] Select me to show the toolbar")),
        Node(id="2", position=Position(x=100, y=200),
             data=NodeData(label="Hello from the Python")),
        Node(id="3", position=Position(x=500, y=200),
             data=NodeData(label="[Py] Node 3")),
    ]
    edges = [
        Edge(id="e1-2", source="1", target="2", sourceHandle="0",
             targetHandle="2", data=EdgeData(10)),
        Edge(id="e2-1", source="2", target="1", sourceHandle="0",
             targetHandle="2", data=EdgeData(10)),
        Edge(id="e3-1", source="3", target="1", sourceHandle="2",
             targetHandle="3", data=EdgeData(-5)),
    ]

    return jsonify(to_dicts(nodes, edges))


if __name__ == '__main__':
    # test()
    app.run(debug=True, host="0.0.0.0")
