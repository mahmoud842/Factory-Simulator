package org.example.backend.models;

import org.example.backend.models.Item;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class SimulationData {
    Map<Long, Long> machineSleepTime;
    List<Item> Items;
    List<Long> ItemsSleepTime;

    public SimulationData(Map<Long, Long> machineSleepTime, List<Item> Items, List<Long> ItemsSleepTime) {
        this.machineSleepTime = machineSleepTime;
        this.Items = Items;
        this.ItemsSleepTime = ItemsSleepTime;
    }

    public Map<Long, Long> getMachineSleepTime() {
        return machineSleepTime;
    }

    public List<Item> getItems() {
        return Items;
    }

    public List<Long> getItemsSleepTime() {
        return ItemsSleepTime;
    }

    public SimulationData clone() {
        return new SimulationData(
            new HashMap<>(machineSleepTime),
            new ArrayList<>(Items),
            new ArrayList<>(ItemsSleepTime)
        );
    }
}
