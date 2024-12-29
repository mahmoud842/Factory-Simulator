package org.example.backend.Controllers;

import java.util.List;

import org.example.backend.DTOs.*;
import org.springframework.web.bind.annotation.*;
import org.example.backend.Services.SimulationService;

@RestController
@CrossOrigin(origins = {"*", "null"})
public class SimulationController {

    SimulationService simulationService;

    SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/setGraph")
    public String handleGraphPost(@RequestBody GraphDTO graphDTO) {
        this.simulationService.setGraph(graphDTO);
        return "Graph received successfully!";
    }

    @GetMapping("/getState")
    public GraphDTO handleGetState() {
        return simulationService.getGraphState();
    }

    @PostMapping("/startSimulation")
    public String startSimulation() {
        if (simulationService.startSimulation())
            return "simulation started";
        return "simulation failed to start";
    }

    @PostMapping("/pauseSimulation")
    public String pauseSimulation() {
        if (simulationService.pauseSimulation())
            return "simulation paused";
        return "faild to pause simulation";
    }

    @PostMapping("/resumeSimulation")
    public String resumeSimulation() {
        if (simulationService.resumeSimulation())
            return "simulation resumed";
        return "faild to resume simulation";
    }
}
