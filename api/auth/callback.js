import axios from "axios";

export default async function handler(req, res) {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("No code received");
    }

    try {
        // Exchange code for token
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

        const access_token = tokenRes.data.access_token;

        // Get pages
        const pagesRes = await axios.get(
            "https://graph.facebook.com/me/accounts",
            { params: { access_token } }
        );

        const pages = pagesRes.data.data;

        // Send first page (or all pages if needed)
        const page = pages[0];

        res.redirect(
            `/?access_token=${access_token}&page_id=${page.id}`
        );

    } catch (err) {
        res.status(500).json({
            error: err.response?.data || err.message,
        });
    }
}