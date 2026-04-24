import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { access_token, message, page_id, image_url, video_url } = req.body;

    try {
        // ================= GET PAGE =================
        const pageRes = await axios.get(
            "https://graph.facebook.com/me/accounts",
            { params: { access_token } }
        );

        const page = pageRes.data.data.find(p => p.id === page_id);

        if (!page) {
            return res.status(400).json({ error: "Page not found" });
        }

        const page_access_token = page.access_token;

        let fbPost;
        let igPost = null;

        console.log("Incoming:", { message, image_url, video_url });

        // ================= FACEBOOK =================

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

            let attempts = 3;

            while (attempts > 0) {
                try {
                    fbPost = await axios.post(
                        `https://graph.facebook.com/${page_id}/photos`,
                        {
                            url: image_url,
                            caption: message,
                            access_token: page_access_token,
                        }
                    );
                    break;

                } catch (err) {
                    const errorData = err.response?.data;

                    if (
                        errorData?.error?.code === 9007 ||
                        errorData?.error?.error_subcode === 2207027
                    ) {
                        await new Promise(res => setTimeout(res, 2000));
                        attempts--;
                    } else {
                        throw err;
                    }
                }
            }

            if (!fbPost) {
                throw new Error("Image upload failed after retries");
            }
        }

        // VIDEO
        else if (video_url) {
            console.log("Posting VIDEO");

            await new Promise(res => setTimeout(res, 2000));

            let attempts = 3;

            while (attempts > 0) {
                try {
                    fbPost = await axios.post(
                        `https://graph.facebook.com/${page_id}/videos`,
                        {
                            file_url: video_url,
                            description: message,
                            access_token: page_access_token,
                        }
                    );
                    break;

                } catch (err) {
                    console.log("Video retry error:", err.response?.data);
                    await new Promise(res => setTimeout(res, 3000));
                    attempts--;
                }
            }

            if (!fbPost) {
                throw new Error("Video upload failed after retries");
            }
        }

        // ================= INSTAGRAM =================

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

        // IG IMAGE
        if (ig_id && image_url && image_url.trim() !== "") {
            console.log("Posting IG IMAGE");

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

            const creation_id = container.data.id;

            await new Promise(res => setTimeout(res, 3000));

            let attempts = 3;

            while (attempts > 0) {
                try {
                    igPost = await axios.post(
                        `https://graph.facebook.com/${ig_id}/media_publish`,
                        null,
                        {
                            params: {
                                creation_id,
                                access_token: page_access_token,
                            },
                        }
                    );
                    break;

                } catch (err) {
                    console.log("IG image retry:", err.response?.data);
                    await new Promise(res => setTimeout(res, 3000));
                    attempts--;
                }
            }
        }

        // IG VIDEO
        else if (ig_id && video_url && video_url.trim() !== "") {
            console.log("Posting IG VIDEO");

            const container = await axios.post(
                `https://graph.facebook.com/${ig_id}/media`,
                null,
                {
                    params: {
                        media_type: "VIDEO",
                        video_url,
                        caption: message,
                        access_token: page_access_token,
                    },
                }
            );

            const creation_id = container.data.id;

            await new Promise(res => setTimeout(res, 5000));

            let attempts = 5;

            while (attempts > 0) {
                try {
                    igPost = await axios.post(
                        `https://graph.facebook.com/${ig_id}/media_publish`,
                        null,
                        {
                            params: {
                                creation_id,
                                access_token: page_access_token,
                            },
                        }
                    );
                    break;

                } catch (err) {
                    console.log("IG video retry:", err.response?.data);
                    await new Promise(res => setTimeout(res, 4000));
                    attempts--;
                }
            }
        }

        // ================= FINAL RESPONSE =================

        if (ig_id && (image_url || video_url) && !igPost) {
            console.log("Instagram post failed after retries");
        }

        console.log("Final FB:", fbPost?.data);
        console.log("Final IG:", igPost?.data);

        return res.json({
            facebook: fbPost ? fbPost.data : "Facebook post failed",
            instagram: igPost?.data || "No IG linked",
        });

    } catch (err) {
        return res.status(500).json({
            error: err.response?.data || err.message,
        });
    }
}