import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  documentContent: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  documentContent: null,
};

// Async thunk for sending chat messages
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ prompt, documentContent, conversationHistory }: {
    prompt: string;
    documentContent: string;
    conversationHistory: ChatMessage[];
  }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          documentContent,
          conversationHistory: conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to send message');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setDocumentContent: (state, action: PayloadAction<string>) => {
      state.documentContent = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChat: (state) => {
      state.messages = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the AI response to messages
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: action.payload.response,
          timestamp: action.payload.timestamp,
        };
        state.messages.push(aiMessage);
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setDocumentContent, 
  addMessage, 
  clearMessages, 
  clearError, 
  resetChat 
} = chatSlice.actions;

export default chatSlice.reducer; 