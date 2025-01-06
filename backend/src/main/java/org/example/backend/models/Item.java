package org.example.backend.models;

import org.example.backend.models.Color;
import org.example.backend.DTOs.ItemDTO;

public class Item {
    Color itemColor;

    Item() {
        itemColor = Color.getRandomColor();
    }

    public String getColor() {
        return itemColor.getDescription();
    }

    public ItemDTO getDTO() {
        return new ItemDTO(itemColor.getDescription());
    }
}
