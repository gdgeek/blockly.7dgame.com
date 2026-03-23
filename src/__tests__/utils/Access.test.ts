import { describe, it, expect } from "vitest";
import { Access, ROLES, ROLE_ABILITY } from "@/utils/Access";
import type { Role, UserInfo } from "@/utils/Access";

describe("Access", () => {
  describe("role getter", () => {
    it("returns the role from userInfo", () => {
      const access = new Access({ role: "admin" });
      expect(access.role).toBe("admin");
    });

    it('defaults to "guest" when no role is provided', () => {
      const access = new Access({});
      expect(access.role).toBe(ROLES.GUEST);
    });

    it('defaults to "guest" when userInfo.role is undefined', () => {
      const access = new Access({ role: undefined });
      expect(access.role).toBe(ROLES.GUEST);
    });
  });

  describe("can(ability)", () => {
    it("returns true if the role has the ability in ROLE_ABILITY", () => {
      // Add a temporary ability for testing
      const originalAbilities = ROLE_ABILITY[ROLES.USER];
      ROLE_ABILITY[ROLES.USER] = ["read", "write"];

      const access = new Access({ role: "user" });
      expect(access.can("read")).toBe(true);
      expect(access.can("write")).toBe(true);

      // Restore
      ROLE_ABILITY[ROLES.USER] = originalAbilities;
    });

    it("returns false if the role does not have the ability", () => {
      const access = new Access({ role: "guest" });
      expect(access.can("nonexistent-ability")).toBe(false);
    });

    it("returns true for root role regardless of ability", () => {
      const access = new Access({ role: "root" });
      expect(access.can("anything")).toBe(true);
      expect(access.can("")).toBe(true);
      expect(access.can("super-secret-ability")).toBe(true);
    });

    it("returns false for a role not in ROLE_ABILITY config", () => {
      // Cast to bypass type check for edge case
      const access = new Access({ role: "unknown" as Role });
      expect(access.can("read")).toBe(false);
    });
  });

  describe("is(role)", () => {
    it("returns true when current role matches the given role", () => {
      const access = new Access({ role: "admin" });
      expect(access.is("admin")).toBe(true);
    });

    it("returns false when current role does not match", () => {
      const access = new Access({ role: "user" });
      expect(access.is("admin")).toBe(false);
    });

    it("matches guest for empty userInfo", () => {
      const access = new Access({});
      expect(access.is("guest")).toBe(true);
      expect(access.is("user")).toBe(false);
    });
  });

  describe("atLeast(role)", () => {
    it("returns true when current role is above the given role", () => {
      const access = new Access({ role: "admin" });
      expect(access.atLeast("user")).toBe(true);
      expect(access.atLeast("guest")).toBe(true);
      expect(access.atLeast("manager")).toBe(true);
    });

    it("returns true when current role equals the given role", () => {
      const access = new Access({ role: "manager" });
      expect(access.atLeast("manager")).toBe(true);
    });

    it("returns false when current role is below the given role", () => {
      const access = new Access({ role: "user" });
      expect(access.atLeast("admin")).toBe(false);
      expect(access.atLeast("root")).toBe(false);
    });

    it("root is atLeast every role", () => {
      const access = new Access({ role: "root" });
      expect(access.atLeast("guest")).toBe(true);
      expect(access.atLeast("user")).toBe(true);
      expect(access.atLeast("manager")).toBe(true);
      expect(access.atLeast("admin")).toBe(true);
      expect(access.atLeast("root")).toBe(true);
    });

    it("guest is only atLeast guest", () => {
      const access = new Access({ role: "guest" });
      expect(access.atLeast("guest")).toBe(true);
      expect(access.atLeast("user")).toBe(false);
    });

    it("respects full hierarchy: guest < user < manager < admin < root", () => {
      const roles: Role[] = ["guest", "user", "manager", "admin", "root"];
      for (let i = 0; i < roles.length; i++) {
        const access = new Access({ role: roles[i] });
        for (let j = 0; j < roles.length; j++) {
          expect(access.atLeast(roles[j])).toBe(i >= j);
        }
      }
    });
  });
});
