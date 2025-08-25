// Google Analytics and Umami Analytics
interface Window {
  gtag: (
    command: 'event' | 'config' | 'set' | 'js',
    targetId: string | Date,
    params?: Record<string, any>
  ) => void;
  dataLayer: Array<Record<string, any>>;
  umami: {
    track: (eventName: string, eventData?: Record<string, any>) => void;
  };
}

// Additional type declarations can be added here 