/** Stops the container started by `global-setup.ts`. */
export default async function globalTeardown(): Promise<void> {
  await globalThis.postgresContainer?.stop();
}
