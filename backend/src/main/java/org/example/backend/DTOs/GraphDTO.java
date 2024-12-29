package org.example.backend.DTOs;

import org.example.backend.DTOs.MachineDTO;
import org.example.backend.DTOs.QueueDTO;
import java.util.List;

public class GraphDTO {
    private List<MachineDTO> machines;
    private List<QueueDTO> queues;
    private long itemsNumber;

    public GraphDTO(List<MachineDTO> machines, List<QueueDTO> queues, long itemsNumber) {
        this.machines = machines;
        this.queues = queues;
        this.itemsNumber = itemsNumber;
    }

    public long getItemsNumber() {
        return itemsNumber;
    }

    public void setItemsNumber(long itemsNumber) {
        this.itemsNumber = itemsNumber;
    }

    public List<QueueDTO> getQueues() {
        return queues;
    }

    public void setQueues(List<QueueDTO> queues) {
        this.queues = queues;
    }

    public List<MachineDTO> getMachines() {
        return machines;
    }

    public void setMachines(List<MachineDTO> machines) {
        this.machines = machines;
    }
}
