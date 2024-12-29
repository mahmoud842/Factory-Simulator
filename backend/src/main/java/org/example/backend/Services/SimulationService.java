package org.example.backend.Services;

import org.springframework.stereotype.Service;
import org.example.backend.DTOs.GraphDTO;
import org.example.backend.models.Graph;

@Service
public class SimulationService {

    Graph graph;
    public SimulationService() {
        this.graph = new Graph();
    }
    
    public boolean setGraph(GraphDTO graphDTO) {
        return graph.build(graphDTO);
    }

    public GraphDTO getGraphState() {
        return graph.getState();
    }

    public boolean startSimulation() {
        return graph.startSimulation();
    }
    
    public boolean pauseSimulation() {
        return graph.pauseSimulation();
    }

    public boolean resumeSimulation() {
        return graph.resumeSimulation();
    }

    public boolean replaySimulation() {
        return graph.replaySimulation();
    }

}
