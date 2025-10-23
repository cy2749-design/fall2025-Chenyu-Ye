# Slow Letter - Multi-page Website

## Option Chosen

I chose **Option A (Multi-page)** because:
- Clear structure with each feature as separate pages
- Easy for beginners to understand and maintain
- Traditional website architecture that's easy to extend
- Single responsibility per page reduces complexity

## Pages/Sections

1. **index.html** - Letter Records page
   - Shows list of all letters with search functionality
   - Displays letter status (Sent, Received, Draft, Revoked)

2. **letter.html** - Letter Detail page
   - Shows individual letter content and recipient info
   - Displays delivery schedule and full letter text

3. **write.html** - Write Letter page
   - Form to create new letters
   - Recipient input, content editor, delivery delay options

4. **settings.html** - Settings page
   - Account management and user preferences
   - Email notifications and general settings

## Navigation

- **Top navigation bar** on every page:
  - Letters → index.html
  - New Letter → write.html  
  - Settings → settings.html
- **Page links** using `<a>` tags for navigation
- **Breadcrumb navigation** on detail pages

## Anticipated Challenges

- **Full page reloads** on navigation (no SPA benefits)
- **No styling** - pages look basic without CSS
- **No interactivity** - limited without JavaScript
- **No data persistence** - form data doesn't save
- **Code repetition** - navigation repeated on each page

Note: the account info in settings.html is example data, not real.

Still learning HTML basics, so I kept it simple :)
