import { configureStore } from '@reduxjs/toolkit';
import documentReducer from './slices/documentSlice';
import scrapingReducer from './slices/scrapingSlice';
import uiReducer from './slices/uiSlice';
import chatReducer from './slices/chatSlice';
import pushReducer from './slices/pushSlice';

export const store = configureStore({
  reducer: {
    document: documentReducer,
    scraping: scrapingReducer,
    ui: uiReducer,
    chat: chatReducer,
    push: pushReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['document/processDocument/pending', 'document/processDocument/fulfilled', 'document/processDocument/rejected'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.file'],
        // Ignore these paths in the state
        ignoredPaths: ['document.currentFile'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 