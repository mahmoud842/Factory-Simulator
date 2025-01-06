package org.example.backend.observers;

import org.example.backend.models.SimulationSnapShots;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class Observer {

    private final SimpMessagingTemplate messagingTemplate;
    private final String[] topics;
    private SimulationSnapShots simulationSnapShots;

    public Observer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.topics = new String[] { "/topic/main", "/topic/topic2", "/topic/topic3" };
        this.simulationSnapShots = null;
    }

    public void addSimulationSnapShot(SimulationSnapShots simulationSnapShots) {
        this.simulationSnapShots = simulationSnapShots;
    }

    public void sendMessageToTopic(Object message) throws InterruptedException {
        sendMessageToTopic(message, true);
    }

    synchronized public void sendMessageToTopic(Object message, boolean flag) throws InterruptedException {
        if (simulationSnapShots != null && flag)
            simulationSnapShots.addRecord(message);

        int topicIndex = 0;
        if (topicIndex >= 0 && topicIndex < topics.length) {
            String topic = topics[topicIndex];
            messagingTemplate.convertAndSend(topic, message);
        }
        else {
            throw new IllegalArgumentException("Invalid topic index");
        }
        if (flag)
            Thread.sleep(10);
    }

    synchronized public void sendStatus(Object message) {
        messagingTemplate.convertAndSend("/topic/status", message);
    }

}
