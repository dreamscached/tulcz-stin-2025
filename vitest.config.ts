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
		include: ["**/*.spec.ts"],
		reporters: ["verbose"],
		testTimeout: 120000,
		coverage: {
			enabled: false,
			all: false,
			provider: "v8",
			include: ["src/**/*.ts"],
			exclude: [
				// Bootstrap code
				"src/main.ts",
				// The listed pattern excludes only files that aren't important
				// for coverage, and some of which do not contain any executable
				// code at all, just declarative NestJS DSL
				"src/**/*.{module,types,e2e-spec,dto,entity}.ts"
			],
			reporter: ["text", "json-summary", "html"]
		}
	}
});
