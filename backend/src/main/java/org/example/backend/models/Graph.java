package org.example.backend.models;

import org.example.backend.DTOs.*;
import org.example.backend.observers.Observer;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class Graph {
    Observer observer;
    ItemsManager itemsManager;
    SimulationData simulationData;
    Map<Long, Machine> machines;
    Map<Long, ItemQueue> queues;
    List<Thread> threads;
    ItemQueue endQueue;
    ItemQueue startQueue;
    long totalItems;
    boolean ready;
    boolean running;
    boolean paused;

    public Graph(Observer observer) {
        this.itemsManager = new ItemsManager(observer);
        this.simulationData = null;
        this.machines = new HashMap<>();
        this.queues = new HashMap<>();
        this.threads = new ArrayList<>();
        this.totalItems = 0;
        this.ready = false;
        this.running = false;
        this.paused = false;
        this.observer = observer;
    }

    public boolean replaySimulation() {
        if (running || !ready || simulationData == null) return false;
        running = true;
        paused = false;
        itemsManager.setComponents(simulationData.getItems(), simulationData.getItemsSleepTime(), startQueue);
        setMachinesSleepTime(simulationData.getMachineSleepTime());
        clearQueues();
        clearMachines();
        setupThreads();        
        startThreads();
        return true;
    }

    public boolean startSimulation() {
        if (running || !ready)
            return false;
        running = true;
        paused = false;

        itemsManager.generateComponents(totalItems, startQueue);
        simulationData = new SimulationData(
            getMachinesSleepTime(),
            itemsManager.getItems(),
            itemsManager.getItemsSleepTime()
        );
        
        clearQueues();
        clearMachines();
        setupThreads();
        startThreads();

        return true;
    }

    public boolean pauseSimulation() {
        if (!running || paused) return false;
        for (Map.Entry<Long, Machine> machine : machines.entrySet()) {
            machine.getValue().pause();
        }
        itemsManager.pause();
        paused = true;
        return true;
    }

    public boolean resumeSimulation() {
        if (!running || !paused) return false;
        for (Map.Entry<Long, Machine> machine : machines.entrySet()) {
            machine.getValue().resume();;
        }
        itemsManager.resume();
        paused = false;
        return true;
    }

    public boolean endSimulation() {
        if (!running) return false;
        interruptThreads();
        running = false;
        return true;
    }

    public void setupThreads() {
        threads.clear();
        for (Map.Entry<Long, Machine> entry : machines.entrySet()) {
            threads.add(new Thread(entry.getValue()));
        }
        threads.add(new Thread(itemsManager));
    }

    public void startThreads() {
        threads.get(threads.size()-1).start();
        for (int i = 0; i < threads.size()-1; i++){
            threads.get(i).start();
        }
    }

    public void interruptThreads() {
        for (int i = 0; i < threads.size(); i++){
            threads.get(i).interrupt();
        }
    }

    public void clearQueues() {
        for (Map.Entry<Long, ItemQueue> q : queues.entrySet()) {
            q.getValue().clearQueue();
        }
    }

    public void clearMachines() {
        for (Map.Entry<Long, Machine> m : machines.entrySet()) {
            m.getValue().clearMachine();
        }
    }

    public boolean isReady() {
        return ready;
    }

    private boolean validGraphDTO(GraphDTO graphDTO) {
        return true;
    }

    private ItemQueue getStartQueue() {
        for (Map.Entry<Long, ItemQueue> q : queues.entrySet()) {
            boolean flag = true;
            for (Map.Entry<Long, Machine> m : machines.entrySet()) {
                if (q.getKey() == m.getValue().getOutputQueueId()){
                    flag = false;
                    break;
                }
            }
            if (flag)
                return q.getValue();
        }
        return null;
    }

    private ItemQueue getEndQueue() {
        for (Map.Entry<Long, ItemQueue> q : queues.entrySet()) {
            boolean flag = true;
            for (Map.Entry<Long, Machine> m : machines.entrySet()) {
                List<Long> ids = m.getValue().getInputQueueIds();
                for (int i = 0; i < ids.size(); i++){
                    if (q.getKey() == ids.get(i)){
                        flag = false;
                        break;
                    }
                }
                if (!flag)
                    break;
            }
            if (flag)
                return q.getValue();
        }
        return null;
    }

    public boolean build(GraphDTO graphDTO) {
        if (running)
            return false;

        if (!validGraphDTO(graphDTO))
            return false;

        // clear data
        machines.clear();
        queues.clear();

        List<QueueDTO> queueDTOs = graphDTO.getQueues();
        for (int i = 0; i < queueDTOs.size(); i++){
            long queueId = queueDTOs.get(i).getId();
            queues.put(queueId, new ItemQueue(queueId, observer));
        }
        
        List<MachineDTO> machineDTOs = graphDTO.getMachines();
        for (int i = 0; i < machineDTOs.size(); i++){
            long machineId = machineDTOs.get(i).getId();
            // add error handling to check if queue doesn't exist
            List<ItemQueue> inputQueues = new ArrayList<>();
            for (int j = 0; j < machineDTOs.get(i).getInputQueueIds().size(); j++){
                inputQueues.add(queues.get(machineDTOs.get(i).getInputQueueIds().get(j)));
            }
            Machine newMachine = new Machine(
                inputQueues,
                queues.get(machineDTOs.get(i).getOutputQueueId()),
                machineId,
                observer
            );
            machines.put(machineId, newMachine);
        }

        totalItems = graphDTO.getItemsNumber();

        startQueue = getStartQueue();
        endQueue = getEndQueue();
        endQueue.setAsEndQueue(totalItems, this);

        simulationData = null;
        paused = false;
        ready = true;
        return true;
    }

    public GraphDTO getState() {
        List<QueueDTO> queuesDTO = new ArrayList<>();
        for (Map.Entry<Long, ItemQueue> entry : queues.entrySet()) {
            QueueDTO newQueue = new QueueDTO(
                entry.getKey(),
                ItemDTO.toItemDTOList(entry.getValue().getAllItems())
            );
            queuesDTO.add(newQueue);
        }

        List<MachineDTO> machinesDTO = new ArrayList<>();
        for (Map.Entry<Long, Machine> entry : machines.entrySet()) {
            MachineDTO newMachine = new MachineDTO(
                entry.getKey(),
                entry.getValue().getOutputQueueId(),
                entry.getValue().getInputQueueIds(),
                entry.getValue().getItemDTO()
            );
            machinesDTO.add(newMachine);
        }

        if (!running)
            return new GraphDTO(machinesDTO, queuesDTO, 0);
        
        return new GraphDTO(machinesDTO, queuesDTO, totalItems);
    }

    private Map<Long, Long> getMachinesSleepTime() {
        Map<Long, Long> machinesSleepTime = new HashMap<>();
        for (Map.Entry<Long, Machine> m : machines.entrySet()) {
            machinesSleepTime.put(m.getKey(), m.getValue().getSleepTime());
        }
        return machinesSleepTime;
    }

    private void setMachinesSleepTime(Map<Long, Long> machinesSleepTime) {
        for (Map.Entry<Long, Long> m : machinesSleepTime.entrySet()) {
            machines.get(m.getKey()).setSleepTime(m.getValue());
        }
    }
}
