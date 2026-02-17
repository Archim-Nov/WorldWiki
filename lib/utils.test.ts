import { describe, expect, it } from "vitest"

import { cn } from "@/lib/utils"

describe("cn", () => {
  it("merges conflicting tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  it("handles conditional and array class inputs", () => {
    const result = cn("text-sm", false && "hidden", ["mt-2", null], {
      "font-bold": true,
      hidden: false,
    })

    expect(result).toContain("text-sm")
    expect(result).toContain("mt-2")
    expect(result).toContain("font-bold")
    expect(result).not.toContain("hidden")
  })
})
