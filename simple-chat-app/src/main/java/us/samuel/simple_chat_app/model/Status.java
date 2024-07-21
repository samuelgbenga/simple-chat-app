package us.samuel.simple_chat_app.model;

public enum Status {

    JOIN, // for when the user joins chat for the first time

    MESSAGE, // for when the user sends a message

    LEAVE // for when the user leaves the chat (logout)
}
