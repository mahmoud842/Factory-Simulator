package org.example.backend.models;

import org.example.backend.DTOs.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class Graph {
    Map<Long, Machine> machines;
    Map<Long, ItemQueue> queues;
    long totalItems;
    boolean ready;
    List<Thread> threads;
    ItemQueue endQueue;
    ItemQueue startQueue;
    boolean running;

    public Graph() {
        this.machines = new HashMap<>();
        this.queues = new HashMap<>();
        this.totalItems = 0;
        this.ready = false;
        this.threads = new ArrayList<>();
        this.running = false;
    }

    public boolean startSimulation() {
        if (running)
            return false;
        running = true;

        threads.clear();
        startQueue.clearQueue();
        endQueue.clearQueue();
        for (Map.Entry<Long, Machine> entry : machines.entrySet()) {
            System.out.print("machine: ");
            System.out.print(entry.getKey());
            System.out.print(" ");
            System.out.println(entry.getValue());
            threads.add(new Thread(entry.getValue()));
        }
        
        for (int i = 0; i < threads.size(); i++){
            threads.get(i).start();
        }

        startQueue.addItems(totalItems);
        
        return true;
    }

    public void stopSimulation() {
        for (int i = 0; i < threads.size(); i++){
            threads.get(i).interrupt();
        }
        running = false;
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

        if (!validGraphDTO(graphDTO))
            return false;

        // clear data
        machines.clear();
        queues.clear();

        List<QueueDTO> queueDTOs = graphDTO.getQueues();
        for (int i = 0; i < queueDTOs.size(); i++){
            long queueId = queueDTOs.get(i).getId();
            queues.put(queueId, new ItemQueue(queueId));
        }
        
        List<MachineDTO> machineDTOs = graphDTO.getMachines();
        for (int i = 0; i < machineDTOs.size(); i++){
            long machineId = machineDTOs.get(i).getId();
            // add error handling to check if queue doesn't exist
            List<ItemQueue> inputQueues = new ArrayList<>();
            for (int j = 0; j < machineDTOs.get(i).getInputQueueIds().size(); j++){
                inputQueues.add(queues.get(machineDTOs.get(i).getInputQueueIds().get(j)));
            }
            Machine newMachine = new Machine(inputQueues, queues.get(machineDTOs.get(i).getOutputQueueId()), machineId);
            machines.put(machineId, newMachine);
        }

        totalItems = graphDTO.getItemsNum();

        startQueue = getStartQueue();
        endQueue = getEndQueue();
        endQueue.setAsEndQueue(totalItems, this);

        // System.out.println(startQueue.getId());
        // System.out.println(endQueue.getId());

        ready = true;
        return true;
    }

    public GraphDTO getState() {
        if (!running)
            return new GraphDTO(null, null, 0);

        List<QueueDTO> queuesDTO = new ArrayList<>();
        for (Map.Entry<Long, ItemQueue> entry : queues.entrySet()) {
            QueueDTO newQueue = new QueueDTO(
                entry.getKey(),
                entry.getValue().getSize()
            );
            queuesDTO.add(newQueue);
        }

        List<MachineDTO> machinesDTO = new ArrayList<>();
        for (Map.Entry<Long, Machine> entry : machines.entrySet()) {
            MachineDTO newMachine = new MachineDTO(
                entry.getKey(),
                entry.getValue().getOutputQueueId(),
                entry.getValue().getInputQueueIds(),
                entry.getValue().getColor()
            );
            machinesDTO.add(newMachine);
        }

        return new GraphDTO(machinesDTO, queuesDTO, totalItems);
    }
}
