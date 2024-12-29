package org.example.backend.DTOs;

import java.util.List;
import org.example.backend.DTOs.ItemDTO;

public class MachineDTO {
    long id;
    long outputQueueId;
    List<Long> inputQueueIds;
    List<ItemDTO> products;

    public MachineDTO(long id, long outputQueueId, List<Long> inputQueueIds, List<ItemDTO> products) {
        this.id = id;
        this.outputQueueId = outputQueueId;
        this.inputQueueIds = inputQueueIds;
        this.products = products;
    }

    public List<ItemDTO> getProducts() {
        return products;
    }

    public void setProducts(List<ItemDTO> products) {
        this.products = products;
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
