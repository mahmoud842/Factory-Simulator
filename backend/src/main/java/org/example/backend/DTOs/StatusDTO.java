package org.example.backend.DTOs;

public class StatusDTO {
    String action;

    public StatusDTO(String action) {
        this.action = action;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

}
