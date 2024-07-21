package us.samuel.simple_chat_app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@EnableWebSocketMessageBroker
@Configuration
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        // access link would be : ('http://localhost:8080/ms');
        registry.addEndpoint("/ms").setAllowedOriginPatterns("*").withSockJS();

    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // this is the web broker endpoint that manages how message are delivered
        registry.enableSimpleBroker("/chatroom", "/user");

        // it is a prefix used by the client to send message to the server
        registry.setApplicationDestinationPrefixes("/app");

        // for private user
        registry.setUserDestinationPrefix("/user");
    }
}
