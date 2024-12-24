package org.example.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.example.backend.models.Colors;

@Setter
@Getter
@AllArgsConstructor
public class ItemsReplayDTO {
    Colors itemColor;
    double timeEntered;
}
