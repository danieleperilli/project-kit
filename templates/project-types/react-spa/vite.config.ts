import fs from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type ConfigEnv, type Plugin, type ResolvedConfig, type UserConfig } from "vite";
import { errorCodes } from "./src/model/error.ts";

/**
 * Generate static HTML files for supported error responses after each build.
 */
function generateErrorFiles(): Plugin {
    let resolvedOutDir = "";

    return {
        name: "generate-error-files",

        /**
         * Capture the final Vite output directory.
         * @param config Resolved Vite configuration.
         */
        configResolved(config: ResolvedConfig) {
            resolvedOutDir = config.build.outDir;
        },

        /**
         * Create one static HTML entry point for every supported error code.
         */
        closeBundle() {
            const outDir = resolve(resolvedOutDir);
            const html = fs.readFileSync(`${outDir}/index.html`, "utf8");

            errorCodes.forEach((code) => {
                const errorPageHtml = html.replace(
                    "</head>",
                    `  <script>window.APP_ERROR="${code}";</script>\n</head>`
                );

                fs.writeFileSync(`${outDir}/${code}.html`, errorPageHtml, "utf8");
            });
        }
    };
}

/**
 * Build the Vite configuration for the current mode.
 * @param configEnvironment Vite configuration environment.
 */
function buildViteConfig({ mode }: ConfigEnv): UserConfig {
    return {
        plugins: [react(), generateErrorFiles()],
        define: {
            "import.meta.env.VITE_APP_VERSION": JSON.stringify(process.env.npm_package_version ?? "0.0.0")
        },
        build: {
            outDir: "dist",
            sourcemap: mode === "development",
            minify: mode === "development" ? false : "esbuild",
            rollupOptions: {
                output: {
                    assetFileNames: "assets/[name][extname]"
                }
            }
        },
        css: {
            preprocessorOptions: {
                scss: {}
            }
        }
    };
}

export default defineConfig(buildViteConfig);
