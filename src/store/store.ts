import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from '@/modules/workspace/store/workspaceSlice';
import uiReducer from './slices/uiSlice';
import restReducer from '@/modules/protocols/rest/store/restSlice';

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    ui: uiReducer,
    rest: restReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;