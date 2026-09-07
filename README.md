# Kiddie Creative School Website

This is a static school website for fees and student placement exams.

## GitHub Pages deployment

This project is ready to be hosted for free on GitHub Pages because it is a static HTML/CSS/JS website.

## Vercel deployment and hourly updates

This website is also ready for Vercel. Because it is a static site, Vercel will publish it automatically when your GitHub repository is connected.

### Exam email alerts

Exam results are sent by the Vercel function in `api/send-exam-result.js`. In Vercel, open the project settings, choose **Environment Variables**, and add:

- `RESEND_API_KEY`: an API key from Resend
- `EXAM_ALERT_EMAIL`: `emmanuelkittikaa@gmail.com`
- `RESEND_FROM_EMAIL`: a verified Resend sender, for example `Kiddie Creative School <onboarding@resend.dev>` while testing

After adding the variables, redeploy the project. The email service must be configured before exam alerts can be delivered.

### Setup steps

1. Sign in to Vercel with your account.
2. Click "Add Project".
3. Import the GitHub repository that contains this website.
4. Keep the default settings for a static site.
5. Click "Deploy".

After deployment, Vercel will create a live URL like:

https://your-vercel-username.vercel.app

### Hourly updates

To show new changes during the day:

1. Edit the files in the repository.
2. Commit the changes.
3. Push to GitHub.
4. Vercel will redeploy automatically.

Vercel normally redeploys within a few minutes after each push. It does not create new website content automatically every hour; a person must make and push the change first.

### Steps

1. Push this folder to a GitHub repository.
2. In GitHub, open the repository.
3. Go to Settings > Pages.
4. Under Source, select **GitHub Actions**.
5. Commit and push the workflow file in `.github/workflows/deploy-pages.yml`.
6. GitHub will publish the site automatically.

### Live URL

Once published, the site will be available at:

https://<your-github-username>.github.io/<your-repository-name>/

### Notes

- The project uses browser localStorage, so exam results stay on the local device.
- No backend server is required.
- This is a free GitHub Pages setup for a static site.
