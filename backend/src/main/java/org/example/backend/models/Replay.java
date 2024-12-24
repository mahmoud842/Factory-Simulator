package org.example.backend.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.backend.DTOs.ItemsReplayDTO;
import org.example.backend.DTOs.MachineReplayDTO;

import java.util.List;

@Setter
@Getter
@AllArgsConstructor
public class Replay {
    List<MachineReplayDTO> machines;
    List<ItemsReplayDTO> items;

}
