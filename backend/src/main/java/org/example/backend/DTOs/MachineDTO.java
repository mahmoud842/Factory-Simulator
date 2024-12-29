package org.example.backend.DTOs;

import java.util.List;

public class MachineDTO {
    long id;
    long outputQueueId;
    List<Long> inputQueueIds;
    String color;

    public MachineDTO(long id, long outputQueueId, List<Long> inputQueueIds, String color) {
        this.id = id;
        this.outputQueueId = outputQueueId;
        this.inputQueueIds = inputQueueIds;
        this.color = color;
    }
    
    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public List<Long> getInputQueueIds() {
        return inputQueueIds;
    }

    public void setInputQueueIds(List<Long> inputQueueIds) {
        this.inputQueueIds = inputQueueIds;
    }

    public long getOutputQueueId() {
        return outputQueueId;
    }

    public void setOutputQueueId(long outputQueueId) {
        this.outputQueueId = outputQueueId;
    }
}
