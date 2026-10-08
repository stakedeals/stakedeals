import test from "node:test";
import assert from "node:assert/strict";
import { runSeed } from "../lib/db/seed";
import {
  hasPermission,
  hasRole,
  getUserPermissions,
} from "../lib/domain/permissions/service";
import { SYSTEM_ROLES, SYSTEM_PERMISSIONS } from "../lib/domain/permissions/constants";

test("RBAC Roles & Permissions Tests", async (t) => {
  await t.test("Owner possesses ALL permissions unconditionally", async () => {
    const ownerId = "usr_owner_01";
    const hasOwnerRole = await hasRole(ownerId, SYSTEM_ROLES.OWNER);
    assert.equal(hasOwnerRole, true);

    const canViewUsers = await hasPermission(ownerId, SYSTEM_PERMISSIONS.USERS_VIEW);
    const canIssueSdc = await hasPermission(ownerId, SYSTEM_PERMISSIONS.SDC_ISSUE);
    const canManageSettings = await hasPermission(ownerId, SYSTEM_PERMISSIONS.PLATFORM_SETTINGS_MANAGE);
    const canProcessWithdrawals = await hasPermission(ownerId, SYSTEM_PERMISSIONS.WITHDRAWALS_PROCESS);

    assert.equal(canViewUsers, true);
    assert.equal(canIssueSdc, true);
    assert.equal(canManageSettings, true);
    assert.equal(canProcessWithdrawals, true);
  });

  await t.test("Product Manager can approve products but cannot process cash withdrawals", async () => {
    const prodMgrId = "usr_prod_mgr_01";
    const canApproveProducts = await hasPermission(prodMgrId, SYSTEM_PERMISSIONS.PRODUCTS_APPROVE);
    const canProcessWithdrawals = await hasPermission(prodMgrId, SYSTEM_PERMISSIONS.WITHDRAWALS_PROCESS);

    assert.equal(canApproveProducts, true);
    assert.equal(canProcessWithdrawals, false);
  });

  await t.test("Cash Manager can process withdrawals but cannot approve products", async () => {
    const cashMgrId = "usr_cash_mgr_01";
    const canProcessWithdrawals = await hasPermission(cashMgrId, SYSTEM_PERMISSIONS.WITHDRAWALS_PROCESS);
    const canApproveProducts = await hasPermission(cashMgrId, SYSTEM_PERMISSIONS.PRODUCTS_APPROVE);

    assert.equal(canProcessWithdrawals, true);
    assert.equal(canApproveProducts, false);
  });

  await t.test("Ordinary Patron has NO administrative permissions", async () => {
    const patronId = "usr_patron_01";
    const perms = await getUserPermissions(patronId);
    assert.equal(perms.length, 0);

    const canIssueSdc = await hasPermission(patronId, SYSTEM_PERMISSIONS.SDC_ISSUE);
    assert.equal(canIssueSdc, false);
  });
});
