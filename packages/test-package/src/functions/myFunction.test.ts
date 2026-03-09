import { describe, expect, it } from "vitest";
import myFunction from "./myFunction";

//----------------------
// Tests
//----------------------

describe(myFunction, () => {
	describe("[PASS]", () => {
		it("should return void", () => {
			const result = myFunction();
			expect(result).toBe(undefined);
		});
	});
});
