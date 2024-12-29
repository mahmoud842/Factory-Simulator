package org.example.backend.DTOs;

public class QueueDTO {
    long id;
    long itemsNum;

    public QueueDTO(long id, long itemsNum) {
        this.id = id;
        this.itemsNum = itemsNum;
    }

    public long getItemsNum() {
        return itemsNum;
    }

    public void setItemsNum(long itemsNum) {
        this.itemsNum = itemsNum;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }
}
