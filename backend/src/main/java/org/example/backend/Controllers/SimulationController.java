package org.example.backend.Controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.example.backend.Services.SimulationService;
import org.example.backend.DTOs.StatusDTO;

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
    @SendTo("/topic/status")
    public StatusDTO sendMessage(String message) {
        switch (message) {
            case "start":
                if (simulationService.startSimulation())
                    return new StatusDTO("start");
                else return new StatusDTO("failed to start");

            case "replay":
                if (simulationService.replaySimulation())
                    return new StatusDTO("replay");
                else return new StatusDTO("failed to replay");

            case "pause":
                if (simulationService.pauseSimulation())
                    return new StatusDTO("pause");
                else return new StatusDTO("failed to pause");

            case "resume":
                if (simulationService.resumeSimulation())
                    return new StatusDTO("resume");
                else return new StatusDTO("failed to resume");
            
            case "terminate":
                if (simulationService.terminateSimulation())
                    return new StatusDTO("terminate");
                else return new StatusDTO("failed to terminate");
        
            default:
                System.out.println("invalid simulation action");
                break;
        }
        return new StatusDTO("invalid simulation action");
    }
}