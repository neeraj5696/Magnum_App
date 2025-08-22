import React from "react";
import { render } from "@testing-library/react-native";
import Login from "../../app/engineer/login";

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({
      push: jest.fn(),
    }),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => null),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("Logn", () => {
  it("render correctly", () => {
    const { getByText, getByPlaceholderText } = render(<Login />);
    const loginText = getByText("ENGINEER LOGIN");
    const usernameInput = getByPlaceholderText("Username");
    const passwordInput = getByPlaceholderText("Password");
    const remembermetext = getByText("Remember Me");
    const forgetpasswordtext = getByText("Forgot Password?");
    const loginbutton = getByText("Login");
    expect(loginText).toBeTruthy();
    expect(usernameInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(remembermetext).toBeTruthy();
    expect(forgetpasswordtext).toBeTruthy();
    expect(loginbutton).toBeTruthy();
  });
});
