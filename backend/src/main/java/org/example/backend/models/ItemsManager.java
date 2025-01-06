package org.example.backend.models;

import org.example.backend.models.Item;
import org.example.backend.models.ItemQueue;
import org.example.backend.DTOs.updateNodeDTO;
import org.example.backend.observers.Observer;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ItemsManager implements Runnable{
    private Observer observer;
    private List<Item> items;
    private List<Long> itemsSleepTime;
    private ItemQueue startQueue;

    private final Object pauseLock = new Object();
    private volatile boolean isPaused = false;
    private long timeSlept;

    public ItemsManager(Observer observer) {
        this.items = new ArrayList<>();
        this.itemsSleepTime = new ArrayList<>();
        this.startQueue = null;
        this.observer = observer;
        this.timeSlept = 0;
    }

    public void setComponents(List<Item> items, List<Long> itemsSleepTime, ItemQueue startQueue){
        this.items = items;
        this.itemsSleepTime = itemsSleepTime;
        this.startQueue = startQueue;
    }

    public void generateComponents(long itemsNumber, ItemQueue startQueue) {
        items.clear();
        itemsSleepTime.clear();
        while (itemsNumber-- > 0) {
            items.add(new Item());
            itemsSleepTime.add(getRandomTime());
        }
        this.startQueue = startQueue;
    }

    public List<Item> getItems() {
        return items;
    }

    public List<Long> getItemsSleepTime() {
        return itemsSleepTime;
    }

    public void run() {
        int i = 0;
        timeSlept = itemsSleepTime.get(i)-50;
        isPaused = false;
        while (i < items.size() && !Thread.currentThread().isInterrupted()) {
            try {
                synchronized (pauseLock) {
                    while (isPaused) {
                        pauseLock.wait();
                    }
                }
                while (timeSlept < itemsSleepTime.get(i) && !isPaused){
                    long s = Math.min(20, itemsSleepTime.get(i) - timeSlept);
                    Thread.sleep(s);
                    timeSlept += s;
                }
                if (itemsSleepTime.get(i) >= timeSlept && !isPaused) {
                    observer.sendMessageToTopic(
                        new updateNodeDTO(
                            -1,
                            startQueue.getId(),
                            "move",
                            items.get(i).getDTO()
                        )
                    );
                    startQueue.push(items.get(i));
                    timeSlept = 0;
                    i++;
                }
            }
            catch (InterruptedException e){
                System.err.println(e);
                Thread.currentThread().interrupt();
                break;
            }
        }
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

    static long getRandomTime() {
        Random random = new Random();
        long randomNumber;
        randomNumber = 1000 + random.nextInt(2000);
        return randomNumber;
    }
}
