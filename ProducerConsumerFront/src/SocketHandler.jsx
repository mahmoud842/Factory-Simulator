import SockJS from "sockjs-client/dist/sockjs";
import { Stomp } from "@stomp/stompjs";

if (typeof global === "undefined") {
  window.global = window;
}

class SocketHandler {
    constructor(updateNodes, graphDTO) {
        this.updateNodes = updateNodes
        this.graphDTO = graphDTO
        this.client = null
    }

    async initiateWebSocket() {
        const socket = new SockJS('http://localhost:8080/ws');
        this.client = Stomp.over(socket);
        this.client.debug = () => {};
        
        return new Promise((resolve, reject) => {
            this.client.connect({}, (frame) => {
                console.log('Connected: ' + frame);
                this.client.subscribe('/topic/main', (message) => {
                    const jsonData = JSON.parse(message.body);
                    this.updateNodes(jsonData);
                });
                this.client.subscribe('/topic/status', (message) => {
                    console.log('hehehehe')
                    console.log(message)
                    const jsonData = JSON.parse(message.body);
                    console.log(jsonData.action)
                })
                resolve();
            }, (error) => {
                console.error('Error connecting to WebSocket: ', error);
                reject(error);
            });
        });
    }

    terminateWebSocket() {
        this.client.disconnect()
    }

    sendMessage(action) {
        this.client.send('/app/action', {}, action);
        console.log(`Sent message: ${action}`);
    }

    async setGraph() {
        try {
            const response = await fetch('http://localhost:8080/setGraph', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.graphDTO)
            });
        
            if (response.ok) {
                const result = await response.text();
                console.log(result);
            }
        } 
        catch (error) {
            console.error('Network error:', error);
        }
    }

    async startSimulation() {
        console.log(this.nodes)
        await this.setGraph()
        if (this.client == null)
            await this.initiateWebSocket()
        this.sendMessage('start')
    }

    endSimulation() {
        this.sendMessage('terminate')
    }

    pauseSimulation() {
        this.sendMessage('pause')
    }

    resumeSimulation() {
        this.sendMessage('resume')
    }

    replaySimulation() {
        this.sendMessage('replay')
    }
}

export default SocketHandler