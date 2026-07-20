import { describe, expect, it } from "vitest";

import { resolveAccessOptions } from "../src/access-options.js";

describe("resolveAccessOptions", () => {
  it("defaults fullCustomerAccess to false when no options are given", () => {
    expect(resolveAccessOptions()).toEqual({ fullCustomerAccess: false });
    expect(resolveAccessOptions(undefined)).toEqual({ fullCustomerAccess: false });
    expect(resolveAccessOptions({})).toEqual({ fullCustomerAccess: false });
  });

  it("passes through an explicit fullCustomerAccess value", () => {
    expect(resolveAccessOptions({ fullCustomerAccess: true })).toEqual({ fullCustomerAccess: true });
    expect(resolveAccessOptions({ fullCustomerAccess: false })).toEqual({ fullCustomerAccess: false });
  });
});
