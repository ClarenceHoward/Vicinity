import { initChatService } from './services/chatService.js';
import { initMapService } from './services/mapService.js';
import { initSocketService } from './services/socketService.js';


document.addEventListener('DOMContentLoaded', function () {
    initChatService();
    initMapService();
    initSocketService();
});
