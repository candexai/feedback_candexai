# feedback_candexai

Feedback portal for CandexAI. It is meant to be served at https://feedback.candexai.co.in and reused for every future engagement or pilot.

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3010. The admin inbox is at http://localhost:3010/admin.

## Production

Point `feedback.candexai.co.in` at this app and terminate HTTPS in front of it. Then set:

- `NODE_ENV=production`
- `APP_URL=https://feedback.candexai.co.in`
- `MONGODB_URI` to the same database URL used by Synervo
- the SMTP settings already used by the main platform
- `ADMIN_PASSWORD`

In production the app sends HSTS, marks the admin cookie Secure, and does not list other submissions on any public route. MongoDB is used only from the server.

## What is stored

Each submission is stored with a `CNDX-` id, the reviewer, the company, the campaign dates, every answer, consent timestamps, and basic audit metadata. `testimonial.originalText` is the wording submitted on the form. An edited marketing version is stored separately in `testimonial.approvedText`.
