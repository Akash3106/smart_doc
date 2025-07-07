import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ScrapedData {
  title: string;
  content: string;
  author: string;
  publishedDate: string;
  description: string;
  keywords: string;
  images: string[];
  links: string[];
}

export interface ScrapingState {
  currentUrl: string;
  scrapedData: ScrapedData | null;
  isScraping: boolean;
  error: string | null;
  scrapingHistory: Array<{
    url: string;
    data: ScrapedData;
    scrapedAt: string;
  }>;
}

const initialState: ScrapingState = {
  currentUrl: '',
  scrapedData: null,
  isScraping: false,
  error: null,
  scrapingHistory: [],
};

// Async thunk for scraping URLs
export const scrapeUrl = createAsyncThunk(
  'scraping/scrapeUrl',
  async (url: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to scrape URL');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to scrape URL');
    }
  }
);

const scrapingSlice = createSlice({
  name: 'scraping',
  initialState,
  reducers: {
    setCurrentUrl: (state, action: PayloadAction<string>) => {
      state.currentUrl = action.payload;
      state.error = null;
    },
    clearScrapedData: (state) => {
      state.currentUrl = '';
      state.scrapedData = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addToHistory: (state, action: PayloadAction<{ url: string; data: ScrapedData; scrapedAt: string }>) => {
      state.scrapingHistory.unshift(action.payload);
      // Keep only last 10 items
      if (state.scrapingHistory.length > 10) {
        state.scrapingHistory = state.scrapingHistory.slice(0, 10);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scrapeUrl.pending, (state) => {
        state.isScraping = true;
        state.error = null;
      })
      .addCase(scrapeUrl.fulfilled, (state, action) => {
        state.isScraping = false;
        state.scrapedData = action.payload.data;
        state.error = null;
        // Add to history
        state.scrapingHistory.unshift({
          url: action.payload.url,
          data: action.payload.data,
          scrapedAt: action.payload.scrapedAt,
        });
        if (state.scrapingHistory.length > 10) {
          state.scrapingHistory = state.scrapingHistory.slice(0, 10);
        }
      })
      .addCase(scrapeUrl.rejected, (state, action) => {
        state.isScraping = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentUrl, clearScrapedData, clearError, addToHistory } = scrapingSlice.actions;
export default scrapingSlice.reducer; 