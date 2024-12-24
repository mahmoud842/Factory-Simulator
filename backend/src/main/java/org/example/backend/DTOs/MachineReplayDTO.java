package org.example.backend.DTOs;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class MachineReplayDTO {
    double processingTime;
    String machineName;
}
