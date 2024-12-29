package org.example.backend.models;

import org.example.backend.models.ItemQueue;
import org.example.backend.models.Item;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Machine implements Runnable {

    static final long TIME_INTERVALS = 100;

    private List<ItemQueue> inputQueues;
    private ItemQueue outputQueue;
    private Item activeItem;
    private long sleepTime;
    private long id;
    
    public long getId() {
        return id;
    }

    public Machine(List<ItemQueue> inputQueues, ItemQueue outputQueue, long id) {
        this.inputQueues = inputQueues;
        this.outputQueue = outputQueue;
        this.activeItem = null;
        this.sleepTime = getRandomTime();
        this.id = id;
    }

    public void run(){
        int i = 0;
        System.out.println("Machine "+ String.valueOf(id)+ " started");
        while (!Thread.currentThread().isInterrupted()) {
            try {
                activeItem = inputQueues.get(i).pop();
                if (activeItem != null) {
                    Thread.sleep(sleepTime);
                    outputQueue.push(activeItem);
                    activeItem = null;
                }
                // assuming each queue will have items equally probable
                i = (i + 1) % inputQueues.size();
            }
            catch (InterruptedException e) {
                System.out.print("machine: ");
                System.out.print(id);
                System.out.println(" error");
                Thread.currentThread().interrupt();
                break;
            }
        }
        System.out.println("Machine "+ String.valueOf(id)+ " stoped");

    }

    public String getColor() {
        if (activeItem == null)
            return null;
        return activeItem.getColor();
    }

    public List<Long> getInputQueueIds() {
        List<Long> ids = new ArrayList<>();
        for (int i = 0; i < inputQueues.size(); i++){
            ids.add(inputQueues.get(i).getId());
        }
        return ids;
    }

    public long getOutputQueueId() {
        return outputQueue.getId();
    }

    static long getRandomTime() {
        Random random = new Random();
        long randomNumber;

        do {
            randomNumber = 1000 + random.nextInt(5000 - 1000 + 1);
        } while (randomNumber % TIME_INTERVALS == 0);

        return randomNumber;
    }
}
