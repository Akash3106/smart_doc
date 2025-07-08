import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface PushState {
  subscription: PushSubscription | null;
  isSubscribed: boolean;
  isAuthenticated: boolean;
  isRequestingAuth: boolean;
  error: string | null;
  notificationPermission: NotificationPermission;
}

const initialState: PushState = {
  subscription: null,
  isSubscribed: false,
  isAuthenticated: false,
  isRequestingAuth: false,
  error: null,
  notificationPermission: 'default',
};

// Async thunk for subscribing to push notifications
export const subscribeToPushNotifications = createAsyncThunk(
  'push/subscribe',
  async (_, { rejectWithValue }) => {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser');
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error('Failed to register subscription');
      }

      return subscription;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to subscribe');
    }
  }
);

// Async thunk for requesting authentication
export const requestPushAuth = createAsyncThunk(
  'push/requestAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/push/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'request' }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Authentication failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Authentication failed');
    }
  }
);

const pushSlice = createSlice({
  name: 'push',
  initialState,
  reducers: {
    setNotificationPermission: (state, action: PayloadAction<NotificationPermission>) => {
      state.notificationPermission = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPush: (state) => {
      state.subscription = null;
      state.isSubscribed = false;
      state.isAuthenticated = false;
      state.isRequestingAuth = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeToPushNotifications.pending, (state) => {
        state.error = null;
      })
      .addCase(subscribeToPushNotifications.fulfilled, (state, action) => {
        state.subscription = action.payload;
        state.isSubscribed = true;
        state.error = null;
      })
      .addCase(subscribeToPushNotifications.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isSubscribed = false;
      })
      .addCase(requestPushAuth.pending, (state) => {
        state.isRequestingAuth = true;
        state.error = null;
      })
      .addCase(requestPushAuth.fulfilled, (state, action) => {
        state.isRequestingAuth = false;
        state.isAuthenticated = action.payload.authenticated;
        state.error = null;
      })
      .addCase(requestPushAuth.rejected, (state, action) => {
        state.isRequestingAuth = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setNotificationPermission,
  setAuthenticated,
  clearError,
  resetPush,
} = pushSlice.actions;

export default pushSlice.reducer; 