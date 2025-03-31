import { createSignal, createEffect, createResource, Show } from "solid-js"
import { b } from "~/../baml_client"
import type { Resume } from "~/../baml_client/types"
import { For } from "solid-js"

// Define the server function using "use server"
// It remains async and takes the same arguments
async function extractResumeServer(text: string): Promise<Resume> {
	"use server" // Add this directive as the first line
	console.log("[SERVER FN] Attempting to extract resume...")
	try {
		// This code ONLY runs on the server thanks to "use server"
		const result = await b.ExtractResume(text)
		console.log("[SERVER FN] BAML extraction successful.")
		return result
	} catch (error) {
		console.error("[SERVER FN] BAML extraction failed:", error)
		// Re-throw or handle the error appropriately for the resource
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

	// Mock data to use when API fails
	const mockResumeData: Resume = {
		name: "Vaibhav Gupta",
		email: "vbv@boundaryml.com",
		experience: ["Founder at BoundaryML", "CV Engineer at Google", "CV Engineer at Microsoft"],
		skills: ["Rust", "C++"]
	}

	// Add this near the top of your component to debug
	const [apiKeyStatus, setApiKeyStatus] = createSignal("Checking API key...")
	const [clientSideMode, setClientSideMode] = createSignal(false)

	const fetchResume = async (text: string) => {
		// More detailed logging
		console.log(`[${clientSideMode() ? "CLIENT" : "SERVER"}] Starting fetchResume function`)
		console.log(`[${clientSideMode() ? "CLIENT" : "SERVER"}] Text input (first 50 chars):`, text.substring(0, 50) + "...")
		setApiKeyStatus(`Attempting to use API key... (${clientSideMode() ? "Client-side" : "Server-side"})`)

		try {
			console.log(`[${clientSideMode() ? "CLIENT" : "SERVER"}] Before API call to b.ExtractResume`)
			const result = await b.ExtractResume(text)
			console.log(`[${clientSideMode() ? "CLIENT" : "SERVER"}] API call successful, result:`, result)
			setApiKeyStatus(`API key working correctly (${clientSideMode() ? "Client-side" : "Server-side"})`)
			return result
		} catch (error) {
			console.error(`[${clientSideMode() ? "CLIENT" : "SERVER"}] API error during fetchResume:`, error)
			// Log more details about the error
			if (error instanceof Error) {
				console.error(`[${clientSideMode() ? "CLIENT" : "SERVER"}] Error name:`, error.name)
				console.error(`[${clientSideMode() ? "CLIENT" : "SERVER"}] Error message:`, error.message)
				console.error(`[${clientSideMode() ? "CLIENT" : "SERVER"}] Error stack:`, error.stack)
			}
			setApiKeyStatus(`API key error: ${error instanceof Error ? error.message : "Unknown error"}`)
			console.log(`[${clientSideMode() ? "CLIENT" : "SERVER"}] Falling back to mock data due to error.`)
			return mockResumeData
		}
	}

	// Resource now calls the "use server" function directly
	const [resume, { refetch }] = createResource(
		// Source signal remains the same
		() => ({ text: resumeText(), trigger: clientSideMode() }),
		async ({ text, trigger }) => {
			if (!trigger) {
				console.log("[RESOURCE] Skipping fetch because trigger is false.")
				// Return null or throw as before
			}
			console.log("[RESOURCE] Triggered. Calling extractResumeServer...")
			// Call the server function directly. SolidStart handles the RPC.
			return extractResumeServer(text)
		}
	)

	// Add immediate logging when component mounts
	console.log("Counter component initialized")

	// More detailed effect logging
	createEffect(() => {
		console.log(`[EFFECT] Resume resource state changed:`)
		console.log(`[EFFECT]   Loading:`, resume.loading)
		console.log(`[EFFECT]   Error:`, resume.error)
		// Access data safely
		try {
			const data = resume()
			console.log(`[EFFECT]   Data:`, data)
		} catch (e) {
			console.log(`[EFFECT]   Data: (Error accessing data)`, e)
		}

		if (resume.error) {
			console.error(`[EFFECT]   Error details:`, resume.error)
		}
	})

	const handleClientRefetch = () => {
		console.log("handleClientRefetch called, setting clientSideMode to true")
		setClientSideMode(true)
		console.log("Calling refetch()")
		refetch()
	}

	return (
		<div class="flex flex-col gap-6 items-center max-w-2xl mx-auto p-6">
			<h1 class="text-2xl font-bold text-gray-800">BAML Resume Extractor ("use server")</h1>

			<div class="flex gap-4">
				<button
					class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
					onClick={() => refetch()}
					disabled={resume.loading}
				>
					{resume.loading ? "Processing..." : "Refetch Resume (Server Action)"}
				</button>

				<button
					class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
					onClick={handleClientRefetch}
				>
					Refetch Resume (Client-side)
				</button>
			</div>

			<div class="w-full bg-white rounded-lg shadow-md overflow-hidden">
				<div class="p-6">
					<h2 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Resume Extraction</h2>

					<Show
						when={!resume.loading && !resume.error && resume()}
						fallback={
							<div>
								<Show when={resume.loading}>
									<div class="flex justify-center p-4">
										<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
										<p class="ml-2">Loading resume data...</p>
									</div>
								</Show>
								<Show when={resume.error}>
									<p class="text-red-500 p-4">Error: {resume.error?.message || "Unknown error"}</p>
								</Show>
								<Show when={!resume.loading && !resume.error && !resume()}>
									<p class="text-gray-500 p-4">No resume data available.</p>
								</Show>
							</div>
						}
					>
						{data => (
							<div class="space-y-4">
								<div class="bg-gray-50 p-4 rounded-md">
									<div class="flex items-center mb-2">
										<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mr-4">
											{data()
												.name.split(" ")
												.map(n => n[0])
												.join("")}
										</div>
										<div>
											<h3 class="text-lg font-semibold">{data().name}</h3>
											<p class="text-gray-600">{data().email}</p>
										</div>
									</div>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div class="bg-gray-50 p-4 rounded-md">
										<h4 class="font-semibold text-gray-700 mb-2">Experience</h4>
										<ul class="space-y-1">
											<For each={data().experience}>{exp => <li class="text-gray-600">{exp}</li>}</For>
										</ul>
									</div>

									<div class="bg-gray-50 p-4 rounded-md">
										<h4 class="font-semibold text-gray-700 mb-2">Skills</h4>
										<div class="flex flex-wrap gap-2">
											<For each={data().skills}>
												{skill => <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{skill}</span>}
											</For>
										</div>
									</div>
								</div>
							</div>
						)}
					</Show>
				</div>

				<div class="bg-gray-50 p-4 border-t">
					<div class="flex justify-between items-center">
						<div class="text-sm text-gray-500">API Status: {apiKeyStatus()}</div>
						<div class="text-xs text-gray-400">Mode: {clientSideMode() ? "Client-side" : "Server-side"}</div>
					</div>
				</div>
			</div>

			<div class="mt-4 w-full">
				<h3 class="text-sm font-semibold mb-2">Raw Resource Data:</h3>
				<pre class="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">{JSON.stringify(resume(), null, 2)}</pre>
			</div>
		</div>
	)
}
