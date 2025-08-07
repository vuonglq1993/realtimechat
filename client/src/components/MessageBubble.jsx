// src/components/MessageBubble.jsx
function MessageBubble({ msg, isMe }) {
    return (
      <div className={`bubble ${isMe ? 'me' : 'other'}`}>
        {!isMe && <strong>{msg.sender}</strong>}
        <p>{msg.text}</p>
      </div>
    );
  }
  
  export default MessageBubble;
  