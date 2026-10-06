jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(async () => undefined),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
}));

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");

  return {
    ...actual,
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  };
});

jest.mock("react-native-gesture-handler", () => {
  const pan = {
    activeOffsetY: () => pan,
    onEnd: () => pan,
    onUpdate: () => pan,
  };

  return {
    Gesture: { Pan: () => pan },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: { View },
    runOnJS: (callback: () => void) => callback,
    useAnimatedStyle: (callback: () => object) => callback(),
    useSharedValue: (value: number) => ({ value }),
    withSpring: (value: number) => value,
    withTiming: (value: number) => value,
  };
});
