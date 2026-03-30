import { teardownFixtures } from "./setup-fixtures";

export default function globalTeardown() {
  teardownFixtures();
}
