import axios from "axios";

import AccessContainer from "../models/AccessContainer.js";

import connectDB from "../config/db.js";

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
    `&scope=pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,business_management` +
    `&auth_type=rerequest` +
    `&display=popup` +
    `&state=${encodeURIComponent(stateData)}`;

  res.redirect(url);
};

// 🔥 CALLBACK
export const callback = async (req, res) => {

  try {
    await connectDB();

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

    console.log("TOKEN RESPONSE:", tokenRes.data);

    const accessToken = tokenRes.data.access_token;

    // 🔥 GET FACEBOOK PAGES
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    console.log(
      "PAGES FULL RESPONSE:",
      JSON.stringify(pagesRes.data, null, 2)
    );

    const page = pagesRes.data.data[0];

    if (!page) {
      return res.send("No Facebook page found");
    }

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

    console.log("IG RESPONSE:", igRes.data);

    // 🔥 CHECK EXISTING PAGE
    const existingPage = await AccessContainer.findOne({
      userId,
      pageId: page.id,
      platform: "facebook",
    });

    // 🔥 IF PAGE EXISTS → UPDATE
    if (existingPage) {

      existingPage.pageName = page.name;

      existingPage.pageToken = page.access_token;

      existingPage.instagramId =
        igRes.data.instagram_business_account?.id || "";

      try {

        await existingPage.save();

        console.log("PAGE UPDATED");

      } catch (mongoError) {

        console.log("SAVE ERROR:");

        console.log(mongoError);

        throw mongoError;
      }

    } else {

      // 🔥 INSERT NEW PAGE
      try {

        await AccessContainer.create({

          userId,

          platform: "facebook",

          pageId: page.id,

          pageName: page.name,

          pageToken: page.access_token,

          instagramId:
            igRes.data.instagram_business_account?.id || "",

        });

        console.log("NEW PAGE INSERTED");

      } catch (mongoError) {

        console.log("CREATE ERROR:");

        console.log(mongoError);

        throw mongoError;
      }
    }

    console.log("TOKEN SAVED");

    // 🔥 REDIRECT UI
    return res.redirect(
      `${process.env.FRONTEND_URL}?success=true`
    );

  } catch (error) {

    console.log("========== FULL ERROR ==========");

    console.log(error);

    console.log("========== RESPONSE DATA ==========");

    console.log(error.response?.data);

    console.log("========== MESSAGE ==========");

    console.log(error.message);

    console.log("========== STACK ==========");

    console.log(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
      metaError: error.response?.data || null,
    });
  }
};
