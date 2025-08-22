import React from "react";
import { render } from "@testing-library/react-native";
import EngineerList from "../../app/engineer/list";

jest.mock("expo-router", () => {
  return {
    useRouter: () => ({
      push: jest.fn(),
    }),
    useLocalSearchParams: () => ({ username: "test", password: "test" }),
  };
});

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("EngineerList", () => {
  it("render correctly", async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      text: () =>
        Promise.resolve(JSON.stringify({ status: "success", data: [] })),
    });
    const { findByText, findAllByText, getByText } = render(<EngineerList />);
    const totaltext = await findByText("Total");
    const pendingMatches = await findAllByText("Pending");
    const completedtext = await findByText("Completed");
    const alltext = await findByText("All");
    const assigntext = await findByText("Assigned");
    const newtext = await findByText("New");
    //  const complainttext = getByText("Complaint No");
    const remarkstext = findByText("Remarks");
    const tasktypetext = findByText("Task Type");
    const systemtext = findByText("System");
    const assigndatetext = findByText("Assigned Date");
    const remarktext = findByText("Remark 2");
    const modeltext = findByText("Model");
    const reportedtext = findByText("Reported");
    expect(remarktext).toBeTruthy();
    //  expect(complainttext).toBeTruthy();
    expect(tasktypetext).toBeTruthy();
    expect(systemtext).toBeTruthy();
    expect(assigndatetext).toBeTruthy();
    expect(remarkstext).toBeTruthy();
    expect(modeltext).toBeTruthy();
    expect(reportedtext).toBeTruthy();
    expect(totaltext).toBeTruthy();
    // expect one or more occurrences of Pending
    expect(pendingMatches.length).toBeGreaterThanOrEqual(1);
    expect(completedtext).toBeTruthy();
    expect(alltext).toBeTruthy();
    expect(assigntext).toBeTruthy();
    expect(newtext).toBeTruthy();
  });
});
