import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { access_token, message, page_id, image_url, video_url } = req.body;

    try {
        // Get pages
        const pageRes = await axios.get(
            "https://graph.facebook.com/me/accounts",
            { params: { access_token } }
        );

        const page = pageRes.data.data.find(p => p.id === page_id);

        if (!page) {
            return res.status(400).json({ error: "Page not found" });
        }

        const page_access_token = page.access_token;

        // 🔥 🔥 PASTE HERE (EXACTLY HERE)

        let fbPost;

        console.log("Incoming:", { message, image_url, video_url });

        // TEXT
        if (!image_url && !video_url) {
            console.log("Posting TEXT");

            fbPost = await axios.post(
                `https://graph.facebook.com/${page_id}/feed`,
                null,
                {
                    params: {
                        message,
                        access_token: page_access_token,
                    },
                }
            );
        }

        // IMAGE
        else if (image_url) {
            console.log("Posting IMAGE");

            fbPost = await axios.post(
                `https://graph.facebook.com/${page_id}/photos`,
                {
                    url: image_url,
                    caption: message,
                    access_token: page_access_token,
                }
            );
        }

        // VIDEO
        else if (video_url) {
            console.log("Posting VIDEO");

            fbPost = await axios.post(
                `https://graph.facebook.com/${page_id}/videos`,
                null,
                {
                    params: {
                        file_url: video_url,
                        description: message,
                        access_token: page_access_token,
                    },
                }
            );
        }

        // Get Instagram account
        const igRes = await axios.get(
            `https://graph.facebook.com/${page_id}`,
            {
                params: {
                    fields: "instagram_business_account",
                    access_token: page_access_token,
                },
            }
        );

        const ig_id = igRes.data.instagram_business_account?.id;

        let igPost = null;

        if (ig_id && image_url) {
            // Create media
            const container = await axios.post(
                `https://graph.facebook.com/${ig_id}/media`,
                null,
                {
                    params: {
                        image_url,
                        caption: message,
                        access_token: page_access_token,
                    },
                }
            );

            // Publish media
            igPost = await axios.post(
                `https://graph.facebook.com/${ig_id}/media_publish`,
                null,
                {
                    params: {
                        creation_id: container.data.id,
                        access_token: page_access_token,
                    },
                }
            );
        }

        res.json({
            facebook: fbPost.data,
            instagram: igPost?.data || "No IG linked",
        });

    } catch (err) {
        res.status(500).json({
            error: err.response?.data || err.message,
        });
    }
}
