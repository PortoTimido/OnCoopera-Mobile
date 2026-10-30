import { getAppTextClassName } from "./app-text";

describe("AppText", () => {
  it("keeps Fraunces for title even when the caller provides a conflicting font class", () => {
    const className = getAppTextClassName("title", "font-sans-bold text-[28px]");

    expect(className).toContain("font-display");
    expect(className).not.toContain("font-sans-bold");
  });
});
