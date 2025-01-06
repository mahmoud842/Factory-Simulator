package org.example.backend.models;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

import org.example.backend.models.Graph;
import org.example.backend.DTOs.StatusDTO;
import org.example.backend.DTOs.updateNodeDTO;
import org.example.backend.observers.Observer;

public class SimulationSnapShots implements Runnable {
    private Long startTime;
    private List<Long> timeGaps;
    private List<Object> updateDTOs;
    private Observer observer;
    private Graph graph;
    private final Object pauseLock = new Object();
    private volatile boolean isPaused = false;

    public SimulationSnapShots(Observer observer, Graph graph) {
        this.timeGaps = new ArrayList<>();
        this.updateDTOs = new ArrayList<>();
        this.observer = observer;
        this.graph = graph;
    }

    public void clear() {
        timeGaps.clear();
        updateDTOs.clear();
    }

    public void setStartTime() {
        this.startTime = System.currentTimeMillis();
    }

    public void addRecord(Object msg) {
        timeGaps.add(System.currentTimeMillis() - startTime);
        updateDTOs.add(msg);
    }

    public boolean isReady() {
        if (timeGaps.size() > 0)
            return true;
        return false;
    }

    public void run() {
        Long time = 0L;
        int i = 0;
        isPaused = false;
        while (!Thread.currentThread().isInterrupted() && i < timeGaps.size()) {
            try {
                synchronized (pauseLock) {
                    while (isPaused) {
                        pauseLock.wait();
                    }
                }
                if (time >= timeGaps.get(i)){
                    observer.sendMessageToTopic(updateDTOs.get(i), false);
                    i++;
                }
                else {
                    Thread.sleep(20);
                    time += 20;
                }

                if (i == timeGaps.size()) {
                    graph.endSimulation();
                    observer.sendStatus(new StatusDTO("end"));
                }
            } catch (InterruptedException e) {
                // e.printStackTrace();
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

}
