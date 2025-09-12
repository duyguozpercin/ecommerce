import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore";
import React from "react";
import '@testing-library/jest-dom';


jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  getFirestore: jest.fn(),
}));


const TestComponent = () => {
  const { user, role, loading } = useAuth();
  return (
    <div>
      <p>user: {user ? user.uid : "null"}</p>
      <p>role: {role !== null ? role : "null"}</p>

      <p>loading: {loading ? "true" : "false"}</p>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets role=null and user=null when no user is logged in", async () => {
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(null);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/user: null/)).toBeInTheDocument();
      expect(screen.getByText(/role: null/)).toBeInTheDocument();
      expect(screen.getByText(/loading: false/)).toBeInTheDocument();
    });
  });

  it("sets role from Firestore when user is logged in", async () => {
    const fakeUser = { uid: "123" };
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(fakeUser);
      return jest.fn();
    });

    (getDoc as jest.Mock).mockResolvedValue({
      data: () => ({ role: "admin" }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/user: 123/)).toBeInTheDocument();
      expect(screen.getByText(/role: admin/)).toBeInTheDocument();
      expect(screen.getByText(/loading: false/)).toBeInTheDocument();
    });
  });

  it("defaults role to 'user' if Firestore has no role", async () => {
    const fakeUser = { uid: "456" };
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(fakeUser);
      return jest.fn();
    });

    (getDoc as jest.Mock).mockResolvedValue({
      data: () => ({}),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/user: 456/)).toBeInTheDocument();
      expect(screen.getByText(/role: user/)).toBeInTheDocument();
      expect(screen.getByText(/loading: false/)).toBeInTheDocument();
    });
  });

  it("sets role to 'user' if Firestore getDoc throws an error", async () => {
    const fakeUser = { uid: "789" };
    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
      callback(fakeUser);
      return jest.fn();
    });

    (getDoc as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/user: 789/)).toBeInTheDocument();
      expect(screen.getByText(/role: user/)).toBeInTheDocument();
      expect(screen.getByText(/loading: false/)).toBeInTheDocument();
    });
  });
});
