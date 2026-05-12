import axios from "axios";

import AccessContainer from "../models/AccessContainer.js";

// 🔥 LOGIN
export const login = (req, res) => {

  // 🔥 GET USER ID
  const userId = req.query.userId;

  // 🔥 GET REDIRECT PAGE
  const redirect = req.query.redirect;

  // 🔥 STORE STATE
  const stateData = JSON.stringify({
    userId,
    redirect,
  });

  // 🔥 FACEBOOK LOGIN URL
  const url =
    `https://www.facebook.com/dialog/oauth` +
    `?client_id=${process.env.APP_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
    `&scope=pages_show_list,pages_manage_posts,pages_read_engagement,instagram_content_publish` +
    `&auth_type=rerequest` +
    `&display=popup` +
    `&state=${encodeURIComponent(stateData)}`;

  res.redirect(url);
};

// 🔥 CALLBACK
export const callback = async (req, res) => {

  try {

    console.log("CALLBACK HIT");

    const code = req.query.code;

    console.log("CODE:", code);

    // 🔥 PARSE STATE
    const state = JSON.parse(req.query.state);

    console.log("STATE:", state);

    const userId = state.userId;

    const redirectPage = state.redirect;

    if (!code) {
      return res.send("No code received");
    }

    // 🔥 ACCESS TOKEN
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: process.env.APP_ID,
          client_secret: process.env.APP_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
          code,
        },
      }
    );

    console.log("TOKEN RESPONSE:", tokenRes.data);

    const accessToken = tokenRes.data.access_token;

    // 🔥 GET PAGE
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    console.log("PAGES:", pagesRes.data);

    const page = pagesRes.data.data[0];

    if (!page) {
      return res.send("No Facebook page found");
    }

    // 🔥 GET INSTAGRAM ID
    const igRes = await axios.get(
      `https://graph.facebook.com/v19.0/${page.id}`,
      {
        params: {
          fields: "instagram_business_account",
          access_token: page.access_token,
        },
      }
    );

    console.log("IG RESPONSE:", igRes.data);

    // 🔥 SAVE TO DB
    await AccessContainer.findOneAndUpdate(
      {
        userId,
        platform: "facebook",
      },
      {
        userId,
        platform: "facebook",
        pageId: page.id,
        pageName: page.name,
        pageToken: page.access_token,
        instagramId:
          igRes.data.instagram_business_account?.id || "",
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log("TOKEN SAVED");

    // 🔥 REDIRECT UI
    return res.redirect(
      `${process.env.FRONTEND_URL}?success=true`
    );

  } catch (error) {

    console.log("FULL ERROR:");

    console.log(error);

    console.log("META ERROR:");

    console.log(error.response?.data);

    console.log("MESSAGE:");

    console.log(error.message);

    return res.status(500).send("OAuth failed");
  }
};
