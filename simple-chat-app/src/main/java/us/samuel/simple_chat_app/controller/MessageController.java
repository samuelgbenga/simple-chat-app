package us.samuel.simple_chat_app.controller;


import lombok.RequiredArgsConstructor;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import us.samuel.simple_chat_app.model.Message;

@Controller
@RequiredArgsConstructor
public class MessageController {

    // this template will be used to send private message to a specific user
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/message")
    @SendTo("/chatroom/public")
    public Message sendMessage(@Payload Message message) {
        return message;
    }

    // instead of using sendTo  we used the simpMessagingTemplate to deliver the
    // message to a specific user
    @MessageMapping("/private-message")
    public Message addUser(@Payload Message chatMessage) {
        simpMessagingTemplate.convertAndSendToUser(chatMessage.getReceiverName(),"/private", chatMessage);
        return chatMessage;
    }
}
