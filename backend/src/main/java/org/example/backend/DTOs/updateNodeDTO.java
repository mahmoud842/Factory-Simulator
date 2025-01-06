package org.example.backend.DTOs;

import org.example.backend.DTOs.ItemDTO;

public class updateNodeDTO {
    long fromId;
    long toId;
    String actionType;
    ItemDTO product;

    public updateNodeDTO(long fromId, long toId, String actionType, ItemDTO product) {
        this.fromId = fromId;
        this.toId = toId;
        this.actionType = actionType;
        this.product = product;
    }

    public long getFromId() {
        return fromId;
    }
    
    public void setFromId(long fromId) {
        this.fromId = fromId;
    }

    public long getToId() {
        return toId;
    }

    public void setToId(long toId) {
        this.toId = toId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public ItemDTO getProduct() {
        return product;
    }

    public void setProduct(ItemDTO product) {
        this.product = product;
    }
}
