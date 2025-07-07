import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ProcessedDocument {
  content: string;
  metadata: {
    title: string;
    author: string;
    pageCount: number;
    wordCount: number;
    fileType: string;
    fileSize: number;
  };
  fileName: string;
  processedAt: string;
}

export interface DocumentState {
  currentFile: File | null;
  processedDocument: ProcessedDocument | null;
  isProcessing: boolean;
  error: string | null;
  processingHistory: ProcessedDocument[];
}

const initialState: DocumentState = {
  currentFile: null,
  processedDocument: null,
  isProcessing: false,
  error: null,
  processingHistory: [],
};

// Async thunk for processing documents
export const processDocument = createAsyncThunk(
  'document/processDocument',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to process document');
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to process document');
    }
  }
);

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setCurrentFile: (state, action: PayloadAction<File | null>) => {
      state.currentFile = action.payload;
      state.error = null;
    },
    clearDocument: (state) => {
      state.currentFile = null;
      state.processedDocument = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addToHistory: (state, action: PayloadAction<ProcessedDocument>) => {
      state.processingHistory.unshift(action.payload);
      // Keep only last 10 items
      if (state.processingHistory.length > 10) {
        state.processingHistory = state.processingHistory.slice(0, 10);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processDocument.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processDocument.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.processedDocument = action.payload;
        state.error = null;
        // Add to history
        state.processingHistory.unshift(action.payload);
        if (state.processingHistory.length > 10) {
          state.processingHistory = state.processingHistory.slice(0, 10);
        }
      })
      .addCase(processDocument.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentFile, clearDocument, clearError, addToHistory } = documentSlice.actions;
export default documentSlice.reducer; 