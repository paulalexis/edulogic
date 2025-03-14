from flask import Flask, jsonify, render_template
from flask_cors import CORS # This lets React talk to Python
from PySpice.Probe.Plot import plot
from PySpice.Spice.Library import SpiceLibrary
from PySpice.Spice.Netlist import Circuit
from PySpice.Unit import *
import matplotlib.pyplot as plt
import io

import matplotlib.pyplot as plt

import PySpice.Logging.Logging as Logging
logger = Logging.setup_logging()

from PySpice.Doc.ExampleTools import find_libraries
from PySpice.Probe.Plot import plot
from PySpice.Spice.Library import SpiceLibrary
from PySpice.Spice.Netlist import Circuit
from PySpice.Physics.SemiConductor import ShockleyDiode
from PySpice.Unit import *

from graph import *

libraries_path = find_libraries()
spice_library = SpiceLibrary(libraries_path)


app = Flask(__name__)
CORS(app)

@app.route('/')
def index():


    period = 50@u_ms
    pulse_width = period / 2

    circuit = Circuit('Relay')

    # circuit.V('digital', 'Vdigital', circuit.gnd, 5@u_V)
    circuit.PulseVoltageSource('clock', 'clock', circuit.gnd, 0@u_V, 5@u_V, pulse_width, period, rise_time=5@u_ms, fall_time=5@u_ms)
    circuit.R('base', 'clock', 'base', 100@u_Ω)
    circuit.BJT(1, 'collector', 'base', circuit.gnd, model='bjt') # Q is mapped to BJT !
    circuit.model('bjt', 'npn', bf=80, cjc=pico(5), rb=100)
    circuit.V('analog', 'VccAnalog', circuit.gnd, 8@u_V)
    circuit.R('relay', 'VccAnalog', 1, 50@u_Ω)
    circuit.L('relay', 1, 'collector', 100@u_mH)
    circuit.include(spice_library['1N5822']) # Schottky diode
    diode = circuit.X('D', '1N5822', 'collector', 'VccAnalog')
    # Fixme: subcircuit node
    # diode.minus.add_current_probe(circuit)


    figure = plt.figure(1, (20, 10))

    simulator = circuit.simulator(temperature=25, nominal_temperature=25)
    analysis = simulator.transient(step_time=period/1000, end_time=period*1.1)

    plt.figure()

    axe = plt.subplot(111)
    plt.title('')
    plt.xlabel('Time [s]')
    plt.ylabel('Voltage [V]')
    plt.grid()
    plot(analysis.base, axis=axe)
    plot(analysis.collector, axis=axe)
    # Fixme: current probe
    # plot((analysis['1'] - analysis.collector)/circuit.Rrelay.resistance, axis=axe)
    plot(analysis['1'] - analysis.collector, axis=axe)
    plt.legend(('Vbase', 'Vcollector'), loc=(.05,.1))

    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    
    return f'<h1>Resistor Divider</h1><img src="data:image/png;base64,{image_base64}"/>'


@app.route('/api/message')
def get_message():
    message = {"text": "Hello from the Python backend!"}
    return jsonify(message)


@app.route('/api/graph')
def get_graph_data():
    nodes = [
        Node(id="1", position=Position(x=0, y=0), data=NodeData(label="[Py] Select me to show the toolbar")),
        Node(id="2", position=Position(x=100, y=200), data=NodeData(label="Hello from the Python")),
        Node(id="3", position=Position(x=500, y=200), data=NodeData(label="[Py] Node 3")),
    ]
    edges = [
        Edge(id="e1-2", source="1", target="2", sourceHandle="0", targetHandle="2", data=EdgeData(10)),
        Edge(id="e2-1", source="2", target="1", sourceHandle="0", targetHandle="2", data=EdgeData(10)),
        Edge(id="e3-1", source="3", target="1", sourceHandle="2", targetHandle="3", data=EdgeData(-5)),
    ]

    # Convert dataclasses to dictionaries for JSON serialization
    nodes_dict = [node.__dict__ for node in nodes]
    edges_dict = [edge.__dict__ for edge in edges]

    return jsonify({"nodes": nodes_dict, "edges": edges_dict})


if __name__ == '__main__':
    app.run(debug=True)
