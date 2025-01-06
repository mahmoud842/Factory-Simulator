package org.example.backend.models;

import org.example.backend.models.ItemQueue;
import org.example.backend.DTOs.ItemDTO;
import org.example.backend.models.Item;
import org.example.backend.DTOs.updateNodeDTO;
import org.example.backend.observers.Observer;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Machine implements Runnable {

    static final long TIME_INTERVALS = 100;

    private Observer observer;
    private List<ItemQueue> inputQueues;
    private ItemQueue outputQueue;
    private Item activeItem;
    private long sleepTime;
    private long id;
    private final Object pauseLock = new Object();
    private volatile boolean isPaused = false;
    
    public long getId() {
        return id;
    }

    public Machine(List<ItemQueue> inputQueues, ItemQueue outputQueue, long id, Observer observer) {
        this.inputQueues = inputQueues;
        this.outputQueue = outputQueue;
        this.activeItem = null;
        this.sleepTime = getRandomTime();
        this.id = id;
        this.observer = observer;
    }

    public void run(){
        int i = 0;
        // System.out.println("Machine "+ String.valueOf(id)+ " started");
        while (!Thread.currentThread().isInterrupted()) {
            try {
                synchronized (pauseLock) {
                    while (isPaused) {
                        pauseLock.wait();
                    }
                }
                if (activeItem != null) {
                    observer.sendMessageToTopic(
                        new updateNodeDTO(
                            inputQueues.get(i).getId(),
                            id,
                            "move",
                            activeItem.getDTO()
                        )
                    );
                    Thread.sleep(sleepTime);
                    observer.sendMessageToTopic(
                        new updateNodeDTO(
                            id,
                            outputQueue.getId(),
                            "move",
                            activeItem.getDTO()
                        )
                    );
                    outputQueue.push(activeItem);
                    activeItem = null;
                }
                else {
                    activeItem = inputQueues.get(i).pop();
                    i = (i + 1) % inputQueues.size();
                }
            } catch (InterruptedException e) {
                System.out.print("Machine: ");
                System.out.print(id);
                System.out.println(" error");
                Thread.currentThread().interrupt();
                break;
            }
        }
        // System.out.println("Machine "+ String.valueOf(id)+ " stoped");
    }

    public String getColor() {
        if (activeItem == null)
            return null;
        return activeItem.getColor();
    }

    public List<ItemDTO> getItemDTO() {
        if (activeItem == null)
            return null;
        ItemDTO itemDTO = new ItemDTO(activeItem);
        List<ItemDTO> items = new ArrayList<>();
        items.add(itemDTO);
        return items;
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
        randomNumber = 2000 + random.nextInt(5000 - 1000 + 1);
        return randomNumber;
    }

    public void pause() {
        synchronized (pauseLock) {
            isPaused = true;
        }
    }

    public void resume() {
        synchronized (pauseLock) {
            isPaused = false;
            pauseLock.notifyAll();
        }
    }

    // remove item in it and calculate new sleep time
    public void clearMachine() {
        this.activeItem = null;
        this.sleepTime = getRandomTime();
    }

    public long getSleepTime() {
        return sleepTime;
    }

    public void setSleepTime(long time) {
        this.sleepTime = time;
    }
}
