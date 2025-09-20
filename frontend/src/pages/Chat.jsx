import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  InputAdornment,
  Paper
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      // LocalStorage'dan kullanıcı bilgisini al
      const currentUserData = localStorage.getItem('currentUser');
      if (currentUserData) {
        const userData = JSON.parse(currentUserData);
        const userId = userData._id || userData.id;
        setCurrentUserId(userId);
        
        // Konuşmaları yükle
        await fetchConversations(userId);
      }
      setLoading(false);
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/conversations?userId=${userId}`);
      setConversations(response.data);
      
      // İlk konuşmayı seç
      if (response.data.length > 0) {
        setActiveConversation(response.data[0]);
        fetchMessages(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/conversations/${conversationId}/messages`);
      console.log('Fetched messages:', response.data);
      console.log('Current user ID:', currentUserId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !currentUserId) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/conversations/${activeConversation._id}/messages`,
        {
          senderId: currentUserId,
          content: newMessage
        }
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Konuşmaları güncelle
      fetchConversations(currentUserId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== currentUserId);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f5f5f5' }}>
      <Grid container sx={{ height: '100%' }}>
        {/* Sol Panel - Konuşmalar */}
        <Grid item xs={4} sx={{ borderRight: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Messages
            </Typography>
          </Box>
          
          <List sx={{ p: 0 }}>
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              return (
                <ListItem
                  key={conversation._id}
                  button
                  selected={activeConversation?._id === conversation._id}
                  onClick={() => {
                    setActiveConversation(conversation);
                    fetchMessages(conversation._id);
                  }}
                  sx={{
                    borderBottom: '1px solid #f0f0f0',
                    '&.Mui-selected': {
                      bgcolor: '#e3f2fd'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            border: '2px solid white'
                          }}
                        />
                      }
                    >
                      <Avatar>
                        {otherUser?.username?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={otherUser?.username}
                    secondary={conversation.lastMessage?.content || 'No messages yet'}
                    secondaryTypographyProps={{
                      noWrap: true,
                      sx: { color: 'text.secondary' }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {conversation.lastMessageTime && formatTime(conversation.lastMessageTime)}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </Grid>

        {/* Sağ Panel - Mesajlar */}
        <Grid item xs={8} sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
          {activeConversation ? (
            <>
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2 }}>
                  {getOtherParticipant(activeConversation)?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {getOtherParticipant(activeConversation)?.username}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Active now
                  </Typography>
                </Box>
              </Box>

              {/* Mesajlar */}
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
                {messages.map((message) => (
                  <Box
                    key={message._id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender._id === currentUserId ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '70%' }}>
                      {message.sender._id !== currentUserId && (
                        <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                          {message.sender.username.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <Box>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: message.sender._id === currentUserId ? 'primary.main' : 'grey.100',
                            color: message.sender._id === currentUserId ? 'white' : 'text.primary',
                            borderRadius: 2
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                        </Paper>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {formatTime(message.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Mesaj Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Write a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton>
                          <AttachFileIcon />
                        </IconButton>
                        <IconButton 
                          color="primary" 
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Chat;