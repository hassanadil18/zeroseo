# Email Setup Guide - Contact Form

Your contact form is now configured to send emails using **EmailJS**. Follow these steps to make it fully functional:

## Step 1: Create a Free EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com)
2. Click **"Sign Up Free"** and create an account with your email
3. Verify your email address

## Step 2: Add an Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **"Add Service"**
3. Select your email provider:
   - **Gmail** (most common)
   - **Outlook**
   - **Yahoo**
   - Or use **EmailJS SMTP** for any email provider

4. Follow the authentication steps (you may need to generate an app password for Gmail)

5. Click **"Create"** - take note of your **Service ID** (example: `service_abc123xyz`)

## Step 3: Create an Email Template

1. Go to **Email Templates** in your dashboard
2. Click **"Create New Template"**
3. Name it something like `contact_form`
4. Replace the template content with:

```
Subject: New Contact Form Submission from {{from_name}}

From: {{from_name}} ({{from_email}})
Phone: {{phone}}
Subject: {{subject}}

Message:
{{message}}
```

5. Set the **To Email** to: `{{to_email}}`
6. Click **"Save"** - take note of your **Template ID** (example: `template_abc123xyz`)

## Step 4: Get Your Public Key

1. Go to **Account** → **API Keys**
2. Copy your **Public Key**

## Step 5: Update Your Website Code

Update these three values in `assets/js/script.js` (around line 234):

```javascript
// Initialize EmailJS
emailjs.init('YOUR_PUBLIC_KEY_HERE'); // Replace with your Public Key

// In the handleFormSubmit function, replace:
'YOUR_SERVICE_ID_HERE',    // Your Service ID
'YOUR_TEMPLATE_ID_HERE',   // Your Template ID
```

Also update the recipient email in the `formData` object:

```javascript
to_email: "zero.seo.zs.10@gmail.com"; // Replace with your actual email
```

## Example of Updated Code

```javascript
emailjs.init("abc123_public_key_xyz789");

// In handleFormSubmit function:
const response = await emailjs.send(
  "service_abc123xyz", // Your Service ID
  "template_abc123xyz", // Your Template ID
  formData,
);
```

## Step 6: Test Your Contact Form

1. Go to your website's Contact page
2. Fill out the form with test information
3. Click **"Send Message"**
4. You should receive an email within seconds!

## Troubleshooting

### "Invalid Service ID" Error

- Make sure your Service ID is correctly copied and updated in script.js
- Check that the email service is **enabled** (status should be green) in EmailJS dashboard

### "Invalid Template ID" Error

- Verify your Template ID is correctly copied and updated
- Check that the template exists and is active

### Emails Not Arriving

- Check your spam/junk folder
- Verify the email address in `to_email` is correct
- Test the template in EmailJS dashboard first

### Rate Limiting

- Free EmailJS plan: 200 emails/month (~6-7 per day)
- Upgrade if you need more volume

## Security Note

Your Public Key is safe to expose in client-side code (it's meant to be public), but consider:

- Monitoring your EmailJS dashboard for suspicious activity
- Setting rate limits in EmailJS settings
- Using re-CAPTCHA for production (optional)

## Support

For EmailJS support, visit: [emailjs.com/docs](https://www.emailjs.com/docs/)
