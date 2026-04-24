import axios from "axios";

export const login = (req, res) => {
  try {
    const appId = process.env.META_APP_ID;
    const redirect = process.env.META_REDIRECT_URI;

    console.log("APP_ID:", appId);
    console.log("REDIRECT:", redirect);

    if (!appId || !redirect) {
      return res.status(500).send("❌ ENV vars missing: META_APP_ID or META_REDIRECT_URI not set in Vercel dashboard");
    }

    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirect)}&scope=pages_manage_posts,instagram_content_publish,pages_read_engagement`;

    return res.redirect(url);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Login failed");
  }
};

export const callback = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("❌ No code received from Facebook");
    }

    // ✅ TIMEOUT ADDED HERE (call #1 — exchange code for token)
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code,
        },
        timeout: 8000, // ← 8 second timeout
      }
    );

    const userToken = tokenRes.data.access_token;

    // ✅ TIMEOUT ADDED HERE (call #2 — fetch pages)
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: { access_token: userToken },
        timeout: 8000, // ← 8 second timeout
      }
    );

    if (!pagesRes.data.data || pagesRes.data.data.length === 0) {
      return res.send("❌ No Facebook pages found. Make sure your account manages at least one Facebook Page.");
    }

    const pageId = pagesRes.data.data[0].id;
    const pageToken = pagesRes.data.data[0].access_token;

    console.log("✅ Page ID:", pageId);
    console.log("✅ Page Token:", pageToken);

    return res.redirect(`/?login=success&pageId=${pageId}`);

  } catch (err) {
    console.error("CALLBACK ERROR:", err.response?.data || err.message);
    const errMsg = err.response?.data?.error?.message || err.message;
    return res.status(500).send(`❌ Error in callback: ${errMsg}`);
  }
};

export const getPageId = () => process.env.PAGE_ID || "";
export const getPageToken = () => process.env.PAGE_TOKEN || "";