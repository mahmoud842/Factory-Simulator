package org.example.backend.observers;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class Observer {

    private final SimpMessagingTemplate messagingTemplate;
    private final String[] topics;

    public Observer(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.topics = new String[] { "/topic/main", "/topic/topic2", "/topic/topic3" };
    }

    // Send a message to a dynamically chosen topic from the list
    synchronized public void sendMessageToTopic(Object message) throws InterruptedException {
        int topicIndex = 0;
        if (topicIndex >= 0 && topicIndex < topics.length) {
            String topic = topics[topicIndex];
            messagingTemplate.convertAndSend(topic, message);
        } 
        else {
            throw new IllegalArgumentException("Invalid topic index");
        }
        Thread.sleep(10);
    }

    synchronized public void sendStatus(Object message) {
        messagingTemplate.convertAndSend("/topic/status", message);
    }

}
