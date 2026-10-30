import { act, renderHook, waitFor } from "@testing-library/react-native";
import { loadAsync } from "expo-font";

import { useOnCooperaFonts } from "./fonts";

jest.mock("expo-font", () => ({ loadAsync: jest.fn() }));
jest.mock("@expo-google-fonts/fraunces", () => ({ Fraunces_700Bold: 1 }));
jest.mock("@expo-google-fonts/plus-jakarta-sans", () => ({
  PlusJakartaSans_400Regular: 2,
  PlusJakartaSans_500Medium: 3,
  PlusJakartaSans_600SemiBold: 4,
  PlusJakartaSans_700Bold: 5,
}));

const mockedLoadAsync = jest.mocked(loadAsync);

describe("useOnCooperaFonts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("only becomes ready after all application fonts load", async () => {
    mockedLoadAsync.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useOnCooperaFonts());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(mockedLoadAsync).toHaveBeenCalledWith({
      "Fraunces-Bold": 1,
      "PlusJakartaSans-Bold": 5,
      "PlusJakartaSans-Medium": 3,
      "PlusJakartaSans-Regular": 2,
      "PlusJakartaSans-SemiBold": 4,
    });
  });

  it("keeps the failure visible and retries loading", async () => {
    mockedLoadAsync.mockRejectedValueOnce(new Error("asset indisponível")).mockResolvedValueOnce(undefined);

    const { result } = await renderHook(() => useOnCooperaFonts());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.loaded).toBe(false);
    expect(result.current.error).toEqual(new Error("asset indisponível"));

    await act(async () => result.current.retry());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(mockedLoadAsync).toHaveBeenCalledTimes(2);
  });
});
