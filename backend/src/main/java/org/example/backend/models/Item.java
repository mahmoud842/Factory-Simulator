package org.example.backend.models;

import org.example.backend.models.Color;

public class Item {
    Color itemColor;

    Item() {
        itemColor = Color.getRandomColor();
    }

    public String getColor() {
        return itemColor.getDescription();
    }
}
