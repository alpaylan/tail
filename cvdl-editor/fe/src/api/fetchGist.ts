"use server";

export async function fetchGist(username: string) {
	return fetch(`https://registry.jsonresume.org/${username}.json`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
}
