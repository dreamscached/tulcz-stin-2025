import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		swc.vite({
			jsc: {
				target: "esnext",
				parser: {
					syntax: "typescript",
					decorators: true
				},
				transform: {
					legacyDecorator: true,
					decoratorMetadata: true
				}
			}
		})
	],
	test: {
		globals: true,
		environment: "node",
		passWithNoTests: true,
		clearMocks: true,
		include: ["**/*.e2e-spec.ts"],
		reporters: ["verbose"],
		testTimeout: 120000,
		coverage: {
			enabled: false,
			all: false,
			provider: "v8",
			include: ["src/**"],
			reporter: ["json-summary", "html"]
		}
	}
});
