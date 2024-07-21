import React, { useEffect, useState } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client/dist/sockjs";

var stompClient = null;
const MessageArea = () => {
  const [privateMessage, setPrivateMessage] = useState(new Map());
  const [publicMessage, setPublicMessage] = useState([]);
  const [chatArea, setChatArea] = useState("PUBLIC");
  const [userData, setUserData] = useState({
    username: "",
    recievername: "",
    message: "",
    connected: false,
  });

  // gegister user
  const registerUser = () => {
    connect();
  };

  // connect the user
  const connect = () => {
    // to connect you set up two things
    let sock = new SockJS("http://localhost:8080/ms");

    // we instantiate the stompClient
    stompClient = over(sock);

    // finally we connect
    stompClient.connect({}, onConnect, onError);
  };

  // handle on connection success
  // subscribe to the different channels available on the backend
  const onConnect = () => {
    // update user connect to true
    setUserData({ ...userData, connected: true });

    // subscribe the public channel
    stompClient.subscribe("/chatroom/public", onPublicMessageReceived);
    stompClient.subscribe(
      "/user/" + userData.username + "/private",
      onPrivateMessageReceived
    );

    // this joins a new user to some privat user with status JOIN
    userJoin();
  };

  // print default error message if connection fail
  const onError = (error) => {
    console.log(error);
  };

  // performs some business logic on
  // receiving a public message
  const onPublicMessageReceived = (payload) => {
    // converts the payload body to json
    var payloadData = JSON.parse(payload.body);

    switch (payloadData.status) {
      // if the user is joining for the first time
      // with status join create a private chat map
      // for the user
      case "JOIN":
        if (!privateMessage.get(payloadData.senderName)) {
          privateMessage.set(payloadData.senderName, []);
          setPrivateMessage(new Map(privateMessage));
        }
        break;
      // if the user is sending a message (status message)
      // update the the  the user public message if messageid
      case "MESSAGE":
        publicMessage.push(payloadData);
        setPublicMessage([...publicMessage]);
        break;
    }
  };

  // on private message gets the payload on subscription to a particular channel
  const onPrivateMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    // if sender does not exist in the private
    // message map create a new map for the user
    // with empty array for private messages
    if (!privateMessage.get(payloadData.senderName)) {
      privateMessage.set(payloadData.senderName, []);
    }
    // update the private message
    privateMessage.get(payloadData.senderName).push(payloadData);
    setPrivateMessage(new Map(privateChats));
  };

  // on new user join
  // this handles the first user message on join
  // it sends the user details to the general public.
  // without any message
  // user can joins the public chat by default
  const userJoin = () => {
    var chatMessage = {
      senderName: userData.username,
      status: "JOIN",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  // send public message:
  // handle send message public
  const sendPublicMessage = () => {
    // if client is indeed connected
    if (stompClient) {
      // set the user detail including the message
      let chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: "MESSAGE",
      };

      // send the user details the message controller
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      // update the user message to empty string
      setUserData({ ...userData, message: "" });
    }
  };

  // handle send private message
  const sendPrivateMessage = () => {
    // check if the user is connected
    if (stompClient) {
      // set the user details including the message and the reciever
      let chatMessage = {
        senderName: userData.username,
        receiverName: chatArea,
        message: userData.message,
        status: "MESSAGE",
      };

      if (!privateMessage.get(chatArea)) {
        privateMessage.set(chatArea, []);
      }

      // finally update the receiver private message anyway

      privateMessage.get(chatArea).push(chatMessage);
      setPrivateMessage(new Map(privateMessage));

      // update the user message to empty string
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  // handle message input
  const handleMessageInput = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, message: value });
  };

  // handle username input
  const handleUsernameInput = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, username: value });
  };
  return (
    <div className="container">
      {userData.connected ? (
        //if the user is connected display this
        <div className="chat-box">
          <div className="member-list">
            {/* loop throught the member list */}
            <ul>
              {/* onclick set the tab to the current tab */}
              <li
                onClick={() => {
                  setChatArea("PUBLIC");
                }}
                className={`member ${chatArea === "PUBLIC" && "active"}`}
              >
                PUBLIC CHAT
              </li>
              {/* spreads all the user into an array and then list them out */}
              {[...privateMessage.keys()].map((name, index) => (
                <li
                  onClick={() => {
                    setChatArea(name);
                  }}
                  className={`member ${chatArea === name && "active"}`}
                  key={index}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
          {chatArea === "PUBLIC" ? (
            <div className="chat-content">
              <ul className="chat-messages">
              
              {
                publicMessage.map((chat, index)=>(
                  <li
                  className={`message ${
                    chat.senderName === userData.username && "self"
                  }`}
                  key={index}
                  >
                      {chat.senderName !== userData.username && (
                      <div className="avatar">{chat.senderName}</div>)}
                      <div className="message-data">{chat.message}</div>
                      {chat.senderName === userData.username && (
                      <div className="avatar self">{chat.senderName}</div>
                    )}
                  </li>
                ))
              }

              </ul>

              <div className="send-message">
              <input
                  type="text"
                  className="input-message"
                  placeholder="enter the message"
                  value={userData.message}
                  onChange={handleMessageInput}
                />
                <button
                  type="button"
                  className="send-button"
                  onClick={sendPublicMessage}
                >
                  send
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-content">
              <ul className="chat-messages">
              {
                [...privateMessage.get(chatArea)].map((chat, index)=> (

                  <li
                  className={`message ${
                    chat.senderName === userData.username && "self"
                  }`}
                  key={index}
                  >
                      {chat.senderName !== userData.username && (
                      <div className="avatar">{chat.senderName}</div>)}
                      <div className="message-data">{chat.message}</div>
                      {chat.senderName === userData.username && (
                      <div className="avatar self">{chat.senderName}</div>
                    )}
                  </li>
                ))
              }

              </ul>

              <div className="send-message">
              <input
                  type="text"
                  className="input-message"
                  placeholder="enter the message"
                  value={userData.message}
                  onChange={handleMessageInput}
                />
                <button
                  type="button"
                  className="send-button"
                  onClick={sendPrivateMessage}
                >
                  send
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        //if the user is not connected display this
        // this will handle the user login/registration
        <div className="register">
          <input
            id="user-name"
            placeholder="Enter your name"
            name="userName"
            value={userData.username}
            onChange={handleUsernameInput}
            margin="normal"
          />
          <button type="button" onClick={registerUser}>
            connect
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageArea;
