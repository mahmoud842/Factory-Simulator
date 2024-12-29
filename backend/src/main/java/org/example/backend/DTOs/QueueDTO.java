package org.example.backend.DTOs;

import java.util.List;

public class QueueDTO {
    long id;
    List<ItemDTO> products;

    public QueueDTO(long id, List<ItemDTO> products) {
        this.id = id;
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
}
