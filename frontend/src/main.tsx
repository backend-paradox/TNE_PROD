import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.tsx';
import { persistor, store } from './store';
import { setHasHydrated } from './store/slices/authSlice';
import './styles/design-tokens.css'; // 1st - CSS variables (source of truth)
import './styles/animations.css';    // 2nd - Keyframe animations
import './styles/globals.css';       // 3rd - Tailwind base styles
import './styles/global.css';        // 4th - Global utility classes (buttons, forms, cards)
import './styles/grid-system.css';   // 5th - Grid system utilities
import './styles/section-header.css'; // 6th - Unified section header styles
import './index.css';                // 7th - Utilities/components

// Set hasHydrated flag after persist gate finishes rehydration
const onBeforeLift = () => {
  store.dispatch(setHasHydrated());
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} onBeforeLift={onBeforeLift}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
  
