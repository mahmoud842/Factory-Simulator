package org.example.backend.models;

import org.example.backend.DTOs.*;
import org.example.backend.observers.Observer;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class Graph {
    Observer observer;
    List<ItemsManager> itemsManagers;
    SimulationData simulationData;
    Map<Long, Machine> machines;
    Map<Long, ItemQueue> queues;
    List<Thread> threads;
    List<ItemQueue> endQueues;
    List<ItemQueue> startQueues;
    long totalItems;
    boolean ready;
    boolean running;
    boolean paused;
    boolean replay;
    SimulationSnapShots simulationSnapShots;
    long itemsDone = 0;

    public Graph(Observer observer) {
        this.itemsManagers = new ArrayList<>();
        this.simulationData = null;
        this.machines = new HashMap<>();
        this.queues = new HashMap<>();
        this.threads = new ArrayList<>();
        this.totalItems = 0;
        this.ready = false;
        this.running = false;
        this.paused = false;
        this.replay = false;
        this.observer = observer;
        this.simulationSnapShots = new SimulationSnapShots(observer, this);
        this.observer.addSimulationSnapShot(simulationSnapShots);
    }

    public boolean replaySimulation() {
        if (running || !ready || !simulationSnapShots.isReady()) return false;
        running = true;
        paused = false;
        replay = true;
        threads.clear();
        threads.add(new Thread(simulationSnapShots));
        startThreads();
        return true;
    }

    public boolean startSimulation() {
        if (running || !ready)
            return false;
        running = true;
        paused = false;

        itemsDone = 0;
        simulationSnapShots.clear();
        intializeItemsManagers();        
        clearQueues();
        clearMachines();
        setupThreads();
        simulationSnapShots.setStartTime();
        startThreads();

        return true;
    }

    public boolean pauseSimulation() {
        if (!running || paused) return false;

        if (replay){
            simulationSnapShots.pause();
        }

        for (int i = 0; i < itemsManagers.size(); i++){
            itemsManagers.get(i).pause();
        }
        for (Map.Entry<Long, Machine> machine : machines.entrySet()) {
            machine.getValue().pause();
        }
        paused = true;
        return true;
    }

    public boolean resumeSimulation() {
        if (!running || !paused) return false;

        if (replay){
            simulationSnapShots.resume();
        }

        for (int i = 0; i < itemsManagers.size(); i++){
            itemsManagers.get(i).resume();
        }

        for (Map.Entry<Long, Machine> machine : machines.entrySet()) {
            machine.getValue().resume();;
        }
        paused = false;
        return true;
    }

    public boolean endSimulation() {
        if (!running) return false;
        interruptThreads();
        running = false;
        replay = false;
        return true;
    }

    public void setupThreads() {
        threads.clear();
        for (int i = 0; i < itemsManagers.size(); i++){
            threads.add(new Thread(itemsManagers.get(i)));
        }
        for (Map.Entry<Long, Machine> entry : machines.entrySet()) {
            threads.add(new Thread(entry.getValue()));
        }
    }

    public void startThreads() {
        for (int i = 0; i < threads.size(); i++){
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

    public void intializeItemsManagers() {
        itemsManagers.clear();
        for (int i = 0; i < startQueues.size(); i++){
            itemsManagers.add(new ItemsManager(observer));
            itemsManagers.get(i).generateComponents(totalItems, startQueues.get(i));
        }
    }

    public synchronized void increment() {
        itemsDone++;
        if (itemsDone == totalItems * itemsManagers.size()){
            endSimulation();
            observer.sendStatus(new StatusDTO("end"));
        }
    }

    public boolean isReady() {
        return ready;
    }

    private boolean validGraphDTO(GraphDTO graphDTO) {
        return true;
    }

    private List<ItemQueue> getStartQueues() {
        List<ItemQueue> sq = new ArrayList<>();
        for (Map.Entry<Long, ItemQueue> q : queues.entrySet()) {
            boolean flag = true;
            for (Map.Entry<Long, Machine> m : machines.entrySet()) {
                if (q.getKey() == m.getValue().getOutputQueueId()){
                    flag = false;
                    break;
                }
            }
            if (flag)
                sq.add(q.getValue());
        }
        return sq;
    }

    private List<ItemQueue> getEndQueues() {
        List<ItemQueue> eq = new ArrayList<>();
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
                eq.add(q.getValue());
        }
        return eq;
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
            List<ItemQueue> inputQueues = new ArrayList<>();
            for (int j = 0; j < machineDTOs.get(i).getInputQueueIds().size(); j++){
                inputQueues.add(queues.get(machineDTOs.get(i).getInputQueueIds().get(j)));
            }
            
            // check if queue doesn't exist
            ItemQueue outQueue = queues.get(machineDTOs.get(i).getOutputQueueId());
            if (outQueue == null || inputQueues.size() == 0)
                return false;
            
            Machine newMachine = new Machine(
                inputQueues,
                queues.get(machineDTOs.get(i).getOutputQueueId()),
                machineId,
                observer
            );
            machines.put(machineId, newMachine);
        }

        totalItems = graphDTO.getItemsNumber();
        
        startQueues = getStartQueues();
        endQueues = getEndQueues();
        if (startQueues.size() == 0 || endQueues.size() == 0){
            return false;
        }

        for (int i = 0; i < endQueues.size(); i++)
            endQueues.get(i).setAsEndQueue(totalItems, this);

        simulationSnapShots.clear();
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
