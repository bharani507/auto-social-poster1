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
    `&scope=pages_manage_posts,pages_read_engagement,instagram_content_publish` +
    `&state=${encodeURIComponent(stateData)}`;

  res.redirect(url);
};

// 🔥 CALLBACK
export const callback = async (req, res) => {

  try {

    // 🔥 FACEBOOK CODE
    const code = req.query.code;

    // 🔥 GET STATE
    const state = JSON.parse(req.query.state);

    // 🔥 GET USER ID
    const userId = state.userId;

    // 🔥 GET REDIRECT PAGE
    const redirectPage = state.redirect;

    if (!code) {
      return res.send("No code received");
    }

    console.log("USER ID:", userId);

    // 🔥 GET ACCESS TOKEN
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

    const accessToken = tokenRes.data.access_token;

    console.log("ACCESS TOKEN:", accessToken);

    // 🔥 GET FACEBOOK PAGE
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    const page = pagesRes.data.data[0];

    if (!page) {
      return res.send("No Facebook page found");
    }

    console.log("PAGE:", page);

    // 🔥 GET INSTAGRAM BUSINESS ACCOUNT
    const igRes = await axios.get(
      `https://graph.facebook.com/v19.0/${page.id}`,
      {
        params: {
          fields: "instagram_business_account",
          access_token: page.access_token,
        },
      }
    );

    const instagramId =
      igRes.data.instagram_business_account?.id || "";

    console.log("INSTAGRAM ID:", instagramId);

    // 🔥 SAVE USER TOKEN
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
        instagramId,
    },
    {
        upsert: true,
        new: true,
    }
    );

    console.log("TOKEN SAVED");

    // 🔥 REDIRECT TO FRONTEND UI
    return res.redirect(
      `${process.env.FRONTEND_URL}${redirectPage}?success=true`
    );

  } catch (error) {

    console.log(error.response?.data || error.message);

    return res.status(500).send("OAuth failed");
  }
};

// 🔥 GET PAGE TOKEN
export const getPageToken = async (userId) => {

  const tokenData = await AccessContainer.findOne({
    userId,
    platform: "facebook",
    });

  return tokenData.pageToken;
};

// 🔥 GET PAGE ID
export const getPageId = async (userId) => {

    const tokenData = await AccessContainer.findOne({
        userId,
        platform: "facebook",
        });

  return tokenData.pageId;
};

// 🔥 GET INSTAGRAM ID
export const getInstagramId = async (userId) => {

  const tokenData = await AccessContainer.findOne({
    userId,
    platform: "facebook",
    });

  return tokenData.instagramId;
};