// jest.setup.ts

import { TextDecoder, TextEncoder } from "util";
if (!global.TextDecoder) global.TextDecoder = TextDecoder as any;
if (!global.TextEncoder) global.TextEncoder = TextEncoder as any;

import "@testing-library/jest-dom";

global.URL.createObjectURL = jest.fn(() => "mocked-url");
global.URL.revokeObjectURL = jest.fn(); // ✅ added

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "warn").mockImplementation(() => {});
