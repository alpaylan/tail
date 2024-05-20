"use server";

export async function fetchGist(username: string) {

  return fetch(`https://api.github.com/users/${username}/gists?per_page=100`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      },
    })
    .then(response => response.json())
    .then(data => {
      // look for resume.json
      console.log('data', data)
      console.log(data.map((gist: any) => gist.files))
      const resume = data.find((gist: any) => gist.files['resume.json'])
      if (resume) {
        return fetch(resume.files['resume.json'].raw_url)
          .then(response => response.json())
          .then(data => {
            console.log('data', data)
            return data;
          })
      }

    })
    .catch((error) => {
      console.error('Error:', error);
    }
    )
}

export async function fetchGistById(id: string) {
  return fetch(`https://api.github.com/gists/${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      },
    })
    .then(response => response.json())
    .then(data => {
      const file = Object.values(data.files)[0] as any;
      if (file) {
        return fetch(file.raw_url)
          .then(response => response.json())
          .then(data => {
            console.log('data', data)
            return data;
          })
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    }
    )
}

