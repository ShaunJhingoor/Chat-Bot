"use client";
import { Button, TextField, Box } from "@mui/material";
import {Stack} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import SendIcon from '@mui/icons-material/Send';
// import IconButton from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your frontend assistant how can I help?` }
  ]);
  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef(null);

 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (userMessage.trim() === "") return;

    const newMessage = { role: 'user', content: userMessage };
    setUserMessage('');
    setMessages((messages) => [
        ...messages,
        newMessage
    ]);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMessage)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        const answer = result.answer || 'No answer received';

        setMessages((messages) => {
            // Find the index of the last user message
            // const userMessageIndex = messages[messages.length-1];
            // Replace the last user message's corresponding assistant message
            const updatedMessages = [...messages];
            updatedMessages[updatedMessages.length] = { role: 'assistant', content: answer };
            
            return updatedMessages;
        });
    } catch (error) {
        console.error('Failed to send message', error);
    }
};



  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 0,
        m: 0,
        bgcolor: "#f0f0f0",
        overflow: "hidden"
      }}
    >
      <Stack
        direction="column"
        spacing={2}
        width="100%"
        maxWidth="40rem"
        height="calc(100% - 6rem)"
        border="1px solid #ddd"
        borderRadius="0.75rem"
        bgcolor="white"
        p={2}
        overflow="auto"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
      >
        <Stack direction="column" spacing={2} flexGrow={1}>
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={message.role === 'assistant' ? '#e1e1e1' : '#007aff'} // Gray for assistant, blue for user
                color={message.role === 'assistant' ? 'black' : 'white'}
                borderRadius="1rem"
                p={2}
                maxWidth="70%"
                minWidth="10rem"
                sx={{
                  wordBreak: 'break-word',
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} /> {/* This helps to scroll to the bottom */}
        </Stack>

        <Box
          display="flex"
          alignItems="center"
          width="100%"
          mt={2}
          borderTop="1px solid #ddd"
          pt={2}
          bgcolor="white"
        >
          <TextField
            label="Message"
            variant="outlined"
            fullWidth
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            size="small"
            sx={{
              mr: 2,
              '& .MuiInputBase-root': {
                borderRadius: '0.5rem',
                backgroundColor: '#f9f9f9',
              }
            }}
          />
            <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              minWidth: 0,
              p: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                
              }
            }}
          >
             <span className="icon-container" >
              <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: '1.2rem' }} />
            </span>
          </Button>
        </Box>

        <style jsx>{`
      @keyframes flyAway {
        0% {
          transform: translate(0, 0);
          opacity: 1;
        }
        25% {
          transform: translate(50px, -50px); /* Move to the top-right */
          opacity: 0; /* Make the icon disappear */
        }
        50% {
          transform: translate(50px, -50px); /* Stay off-screen at the top-right */
          opacity: 0; /* Keep the icon invisible */
        }
        75% {
          transform: translate(-75px, 75px); /* Move to the bottom-left smoothly */
          opacity: 0; 
        }
        100% {
          transform: translate(0, 0); /* Return to the original position */
          opacity: 1; /* Fully visible */
        }
      }

      .icon-container {
        display: inline-block;
        position: relative;
        transition: transform 0.3s ease;
      }

      .icon-container:hover {
        animation: flyAway 3s infinite; /* Continuous loop with 3-second duration */
      }

      .dotted-line {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 150%; /* Make the dotted line larger to cover the movement area */
        height: 150%;
        border: 1px dotted white;
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0;
        animation: dash 3s linear infinite;
      }

      @keyframes dash {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 100px 0; /* Adjust length of the dash line */
        }
      }

      .icon-container:hover ~ .dotted-line {
        opacity: 0.5; /* Show the dotted line on hover */
      }
    `}</style>




      </Stack>
    </Box>
  );
}
