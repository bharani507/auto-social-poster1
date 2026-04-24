export default function handler(req, res) {
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${process.env.META_REDIRECT_URI}&scope=pages_manage_posts,instagram_content_publish,pages_read_engagement`;

  res.redirect(url);
}