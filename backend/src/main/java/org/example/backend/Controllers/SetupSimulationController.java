package org.example.backend.Controllers;

import java.util.List;

import org.example.backend.DTOs.*;
import org.springframework.web.bind.annotation.*;
import org.example.backend.Services.SimulationService;

@RestController
@CrossOrigin(origins = {"*", "null"})
public class SetupSimulationController {

    SimulationService simulationService;

    SetupSimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/setGraph")
    public String handleGraphPost(@RequestBody GraphDTO graphDTO) {
        this.simulationService.setGraph(graphDTO);
        return "Graph received successfully!";
    }
}
