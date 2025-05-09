import { createSignal, createEffect, createResource, Show, Suspense, startTransition } from "solid-js"
import { b } from "~/../baml_client/index.js"
import type { Resume } from "~/../baml_client/types"

async function extractResumeServer(text: string): Promise<Resume> {
	"use server"
	console.log("[SERVER FN] Attempting to extract resume...")
	try {
		const result = await b.ExtractResume(text)
		console.log("[SERVER FN] BAML extraction successful.")
		return result
	} catch (error) {
		console.error("[SERVER FN] BAML extraction failed:", error)
		throw error
	}
}

export default function BamlResume() {
	const [resumeText, setResumeText] = createSignal(`
      Vaibhav Gupta
      vbv@boundaryml.com

      Experience:
      - Founder at BoundaryML
      - CV Engineer at Google
      - CV Engineer at Microsoft

      Skills:
      - Rust
      - C++
    `)

	const [apiKeyStatus, setApiKeyStatus] = createSignal("Checking API key...")
	const [clientSideMode, setClientSideMode] = createSignal(false)

	const [resume, { refetch }] = createResource(resumeText, async text => {
		console.log("[RESOURCE FETCHER] Calling extractResumeServer (will use RPC if on client)...")
		try {
			const result = await extractResumeServer(text)
			console.log("[RESOURCE FETCHER] extractResumeServer successful.")
			return result
		} catch (error) {
			console.error("[RESOURCE FETCHER] Error calling extractResumeServer:", error)
			throw error
		}
	})

	console.log("Counter component initialized")

	createEffect(() => {
		console.log(`[EFFECT] Resume resource state changed:`)
		console.log(`[EFFECT]   Loading:`, resume.loading)
		console.log(`[EFFECT]   Error:`, resume.error)
		const rawData = resume()
		console.log(`[EFFECT]   Raw Data Value:`, rawData)
		try {
			console.log(`[EFFECT]   Data accessed via resume():`, resume())
		} catch (e) {
			console.log(`[EFFECT]   Data: (Error accessing data)`, e)
		}

		if (resume.error) {
			console.error(`[EFFECT]   Error details:`, resume.error)
		}
	})

	const handleClientRefetch = () => {
		console.log("[HANDLER] handleClientRefetch called")
		setClientSideMode(true)
		console.log("[HANDLER] clientSideMode set to true, calling refetch() within startTransition")
		startTransition(() => {
			refetch()
		})
	}

	const handleServerRefetch = () => {
		console.log("[HANDLER] Server refetch button clicked")
		setClientSideMode(false)
		console.log("[HANDLER] clientSideMode set to false, calling refetch() within startTransition")
		startTransition(() => {
			refetch()
		})
	}

	return (
		<div class="flex flex-col gap-6 items-center max-w-2xl mx-auto p-6">
			<h1 class="text-2xl font-bold text-gray-800">BAML Resume Extractor (Client/Server RPC)</h1>

			<div class="flex gap-4">
				<button
					class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
					onClick={handleServerRefetch}
					disabled={resume.loading}
				>
					{resume.loading && !clientSideMode() ? "Processing..." : "Refetch Resume (Server Fn)"}
				</button>

				<button
					class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
					onClick={handleClientRefetch}
					disabled={resume.loading}
				>
					{resume.loading && clientSideMode() ? "Processing..." : "Refetch Resume (Client Trigger)"}
				</button>
			</div>

			<div class="w-full bg-white rounded-lg shadow-md overflow-hidden">
				<div class="p-6">
					<h2 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Resume Extraction</h2>

					<Suspense
						fallback={
							<div class="flex justify-center p-4">
								<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
								<p class="ml-2">Loading resume data...</p>
							</div>
						}
					>
						<Show
							when={!resume.error && resume()}
							fallback={
								<div>
									<Show when={resume.error}>
										<p class="text-red-500 p-4">Error: {resume.error?.message || "Unknown error"}</p>
									</Show>
									<Show when={!resume.error && !resume()}>
										<p class="text-gray-500 p-4">No resume data available.</p>
									</Show>
								</div>
							}
						>
							{data => {
								console.log("[SHOW COMPONENT] Rendering SIMPLIFIED content. Data:", data())
								return (
									<div>
										<h3 class="text-lg font-bold text-green-600">Data Received (Simplified View):</h3>
										<pre class="bg-gray-100 p-2 border rounded mt-2 text-xs">{JSON.stringify(data(), null, 2)}</pre>
									</div>
								)
							}}
						</Show>
					</Suspense>
				</div>

				<div class="bg-gray-50 p-4 border-t">
					<div class="flex justify-between items-center">
						<div class="text-sm text-gray-500">API Status: {apiKeyStatus()}</div>
						<div class="text-xs text-gray-400">Mode: {clientSideMode() ? "Client-side" : "Server-side"}</div>
					</div>
				</div>
			</div>

			<div class="mt-4 w-full">
				<h3 class="text-sm font-semibold mb-2">Raw Resource Data (Live):</h3>
				<pre class="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">{JSON.stringify(resume(), null, 2)}</pre>
			</div>
		</div>
	)
}
