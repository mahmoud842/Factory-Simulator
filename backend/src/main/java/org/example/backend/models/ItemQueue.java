package org.example.backend.models;


import org.example.backend.models.Item;
import org.example.backend.models.Graph;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public class ItemQueue {
    
    private Queue<Item> queue = new LinkedList<>();
    private long pendingPush;
    private long activePush;
    private long id;

    private boolean isEnd;
    private long interruptThreshold;
    private Graph graph;

    public long getId() {
        return id;
    }

    public ItemQueue(long id) {
        this.pendingPush = 0;
        this.activePush = 0;
        this.id = id;
        this.isEnd = false;
        this.interruptThreshold = 0;
    }
    
    synchronized public Item pop() {
        // could synchronize the condition only
        if (pendingPush + activePush > 0 || queue.isEmpty())
            return null;
        return queue.poll();
    }

    synchronized public void push(Item newItem) {
        pendingPush++;
        while (activePush > 0) {
            try {
                wait();
            } catch (InterruptedException e) {
                System.out.print("queue: ");
                System.out.print(id);
                System.out.println(" error in push");
                Thread.currentThread().interrupt();
                return;
            }
        }
        pendingPush--;
        activePush++;
        // need to catch potential exception when adding to queue
        queue.add(newItem);
        activePush--;
        notifyAll();

        if (isEnd && queue.size() == interruptThreshold) {
            graph.endSimulation();
        }

        return;
    }

    public long getSize() {
        return queue.size();
    }

    synchronized public List<Item> getAllItems() {
        return new ArrayList<>(queue);
    }

    public void setAsEndQueue(long threshold, Graph graph) {
        this.isEnd = true;
        this.interruptThreshold = threshold;
        this.graph = graph;
    }

    public void addItems(long n) {
        activePush++;
        while (n-- > 0){
            queue.add(new Item());
        }
        activePush--;
    }

    public void clearQueue() {
        queue.clear();
    }

}
