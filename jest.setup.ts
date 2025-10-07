import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

import '@testing-library/jest-dom';

(global as any).URL.createObjectURL = jest.fn(() => 'blob:mocked-url');
(global as any).URL.revokeObjectURL = jest.fn();
(global as any).fetch = jest.fn();
