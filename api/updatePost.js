export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { password, post } = req.body;
  
  // Simple "authentication". We don't want anyone doing this.
  if (password !== 'magicwand') {
    return res.status(401).json({ error: 'Unauthorized. Incorrect password.' });
  }
  
  const token = process.env.GITHUB_TOKEN; // configured in Vercel project settings
  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured on Vercel.' });
  }

  const owner = 'amit-srivatsa';
  const repo = 'linkedin-dashboard';
  const path = 'src/data/posts.json';

  try {
    // 1. Get the current file (we need the SHA to overwrite it)
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Serverless-Function'
      }
    });

    if (!getRes.ok) {
      const error = await getRes.json();
      throw new Error(`GitHub GET failed: ${error.message}`);
    }

    const fileData = await getRes.json();
    const contents = Buffer.from(fileData.content, 'base64').toString('utf8');
    const posts = JSON.parse(contents);

    // 2. Modify the specific post
    const index = posts.findIndex(p => p.id === post.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post not found in data file.' });
    }

    // Merge new post data
    posts[index] = { ...posts[index], ...post };

    // 3. Write it back to GitHub
    const newContent = Buffer.from(JSON.stringify(posts, null, 2) + '\n', 'utf8').toString('base64');

    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify({
        message: `🤖 content update: ${post.id}`,
        content: newContent,
        sha: fileData.sha,
        branch: 'main'
      })
    });

    if (!putRes.ok) {
      const putError = await putRes.json();
      throw new Error(`GitHub PUT failed: ${putError.message}`);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
