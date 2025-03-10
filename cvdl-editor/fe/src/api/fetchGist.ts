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

export async function fetchGistById(id: string) {
	return fetch(`https://api.github.com/gists/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			const file = Object.values(data.files)[0] as any;
			if (file) {
				return fetch(file.raw_url)
					.then((response) => response.json())
					.then((data) => {
						console.log("data", data);
						return data;
					});
			}
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}
