import { defineConfig } from "@solidjs/start/config"
import UnoCSS from "unocss/vite"

export default defineConfig({
	ssr: true,
	server: {
		nodeModulesDirs: ["node_modules"],
		preset: "node"
	},
	vite: {
		plugins: [UnoCSS()],
		optimizeDeps: {
			exclude: ["@boundaryml/baml", "@boundaryml/baml-runtime"]
		},
		ssr: {
			external: ["@boundaryml/baml", "@boundaryml/baml-runtime"]
		},
		build: {
			rollupOptions: {
				external: ["@boundaryml/baml", "@boundaryml/baml-runtime"]
			}
		}
	}
})
