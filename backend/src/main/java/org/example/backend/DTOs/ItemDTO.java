package org.example.backend.DTOs;

import org.example.backend.models.Item;

import java.util.ArrayList;
import java.util.List;

public class ItemDTO {
    String color;

    public ItemDTO() {
    }

    public ItemDTO(String color){
        this.color = color;
    }

    public ItemDTO(Item item) {
        this.color = item.getColor();
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public static List<ItemDTO> toItemDTOList(List<Item> items) {
        List<ItemDTO> itemsDTO = new ArrayList<>();
        for (int i = 0; i < items.size(); i++){
            itemsDTO.add(new ItemDTO(items.get(i)));
        }
        return itemsDTO;
    }
}
