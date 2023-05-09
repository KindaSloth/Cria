import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/*.ts'],
    watch: false,
    testTimeout: 10000,
  }
});