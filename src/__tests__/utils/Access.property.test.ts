import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { Access, ROLES } from "@/utils/Access";
import type { Role } from "@/utils/Access";

// Arbitrary for generating random roles
const roleArb = fc.constantFrom(
  ROLES.GUEST,
  ROLES.USER,
  ROLES.MANAGER,
  ROLES.ADMIN,
  ROLES.ROOT
) as fc.Arbitrary<Role>;

describe("Access property-based tests", () => {
  /**
   * **Validates: Requirements 2.6**
   * atLeast transitivity — If role A atLeast role B, and role B atLeast role C,
   * then role A atLeast role C.
   */
  it("atLeast is transitive: if A >= B and B >= C then A >= C", () => {
    fc.assert(
      fc.property(roleArb, roleArb, roleArb, (roleA, roleB, roleC) => {
        const accessA = new Access({ role: roleA });
        const accessB = new Access({ role: roleB });

        if (accessA.atLeast(roleB) && accessB.atLeast(roleC)) {
          expect(accessA.atLeast(roleC)).toBe(true);
        }
      })
    );
  });

  /**
   * **Validates: Requirements 2.6**
   * atLeast reflexivity — Every role is atLeast itself.
   */
  it("atLeast is reflexive: every role is atLeast itself", () => {
    fc.assert(
      fc.property(roleArb, (role) => {
        const access = new Access({ role });
        expect(access.atLeast(role)).toBe(true);
      })
    );
  });

  /**
   * **Validates: Requirements 2.6**
   * atLeast antisymmetry — If A atLeast B and B atLeast A, then A === B.
   */
  it("atLeast is antisymmetric: if A >= B and B >= A then A === B", () => {
    fc.assert(
      fc.property(roleArb, roleArb, (roleA, roleB) => {
        const accessA = new Access({ role: roleA });
        const accessB = new Access({ role: roleB });

        if (accessA.atLeast(roleB) && accessB.atLeast(roleA)) {
          expect(roleA).toBe(roleB);
        }
      })
    );
  });
});
