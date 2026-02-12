# AI Role Reimaginer - Deployment Guide

## Folder Structure
```
role-reimaginer.html      ← The tool (drop into your site folder)
netlify/
  functions/
    analyze.js            ← API proxy (keeps your key safe)
```

## Setup Steps

### 1. Add your API key in Netlify
- Go to Netlify → Site settings → Environment variables
- Add: `ANTHROPIC_API_KEY` = your Anthropic API key

### 2. Drop into your existing site
- Copy `role-reimaginer.html` into your site's root folder
- Copy the `netlify/` folder into your site's root folder
- Drag the whole folder to Netlify Drop (or push to your repo)

### 3. Link from homepage
Add a card on your homepage linking to `/role-reimaginer`

### 4. Wire up email capture (optional)
The email form currently just shows a success message. To actually capture emails:
- Option A: Add a fetch() call to your email provider's API (ConvertKit, Mailchimp, etc.)
- Option B: Send to a Google Sheet via a Netlify function
- Option C: Just check Netlify Forms (add netlify attribute to the form)

## How It Works
1. User enters a job title
2. Frontend calls `/.netlify/functions/analyze` with the role
3. Serverless function calls Anthropic API with your key (never exposed to browser)
4. Results render in the browser

## The tool falls back to sample Marketing Manager data if the API call fails, so it always demos well.
