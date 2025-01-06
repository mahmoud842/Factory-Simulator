package org.example.backend.Controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.example.backend.Services.SimulationService;

@Controller
public class SimulationController {

    private final SimpMessageSendingOperations messagingTemplate;
    SimulationService simulationService;

    public SimulationController(
            SimpMessageSendingOperations messagingTemplate,
            SimulationService simulationService
        ) {
        this.messagingTemplate = messagingTemplate;
        this.simulationService = simulationService;
    }

    @MessageMapping("/action")
    public void sendMessage(String message) {
        switch (message) {
            case "start":
                simulationService.startSimulation();
                break;
            
            case "replay":
                simulationService.replaySimulation();
                break;

            case "pause":
                simulationService.pauseSimulation();
                break;

            case "resume":
                simulationService.resumeSimulation();
                break;
            
            case "terminate":
                break;
        
            default:
                System.out.println("invalid simulation action");
                break;
        }
    }
}