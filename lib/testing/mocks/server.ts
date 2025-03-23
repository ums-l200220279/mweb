/**
 * Mock Service Worker Server
 *
 * This file sets up a mock server using MSW (Mock Service Worker)
 * to intercept and mock API requests during testing.
 */

import { setupServer } from "msw/node"
import { handlers } from "./handlers"

// Setup requests interception using the given handlers
export const server = setupServer(...handlers)

