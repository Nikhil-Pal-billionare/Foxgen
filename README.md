# Foxgen

## Launch Waitlist & Early Payment

This project includes a launch-phase waitlist and early payment flow:

- Landing page collects: email (required), WhatsApp (optional), role (optional)
- Waitlist stored in Supabase (`public.waitlist`)
- Early payment via Razorpay Checkout
- Admin page to list users: `/admin/waitlist`

### Environment Variables

Add these to your environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `LAUNCH_EARLY_PRICE_INR` (amount in paisa, default `49900`)
- `LAUNCH_CURRENCY` (default `INR`)
- `ADMIN_EMAILS` (comma-separated admin emails, e.g. `you@domain.com, admin@domain.com`)

### Database Migration

Run the migration to create the waitlist table:

```
supabase db push
```

Or apply SQL manually from `supabase/migrations/12_waitlist.sql`.

### Development

```
npm install
npm run dev
```

Visit `/` for the landing page, `/admin/waitlist` for admin listing.

### Notes

- Public signup is disabled in launch phase; `/sign-up` points users to the waitlist.
- After successful payment, the user is marked `paid` and can be granted access.