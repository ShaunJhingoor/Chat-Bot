"use client";
import { Button, TextField, Box } from "@mui/material";
import { Stack } from "@mui/system";
import { useState, useRef, useEffect } from "react";
import SendIcon from '@mui/icons-material/Send'; // Import the send icon
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm Headstarter support assistant. How can I help you today?` }
  ]);
  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (userMessage.trim() === "") return;
  
    setUserMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' }
    ]);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: userMessage }])
      });
  
      if (!response.body) {
        console.error('No response body');
        return;
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
  
      const processText = async ({ done, value }) => {
        if (done) {
          return result;
        }
  
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
      
  
        setMessages((messages) => {
          const last = messages[messages.length - 1];
          const other = messages.slice(0, messages.length - 1);
          return [...other, { ...last, content: last.content + text }];
        });
  
        result += text;
        return reader.read().then(processText);
      };
  
      await reader.read().then(processText);
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
                <ReactMarkdown>{message.content}</ReactMarkdown>
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
            <SendIcon />
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
