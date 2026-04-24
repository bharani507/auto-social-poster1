import axios from "axios";

export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

    // 🔥 GET ACCESS TOKEN
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code,
        },
      }
    );

    const token = tokenRes.data.access_token;

    // 🔥 GET PAGE ID
    const pageRes = await axios.get(
      "https://graph.facebook.com/me/accounts",
      {
        params: { access_token: token },
      }
    );

    const page = pageRes.data.data[0];

    const page_id = page?.id;

    // 🔥 REDIRECT TO LOCALHOST (YOUR PLAN)
    res.redirect(
      `http://localhost:5000/?access_token=${token}&page_id=${page_id}`
    );

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
}