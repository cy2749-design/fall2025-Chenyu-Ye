# Slow Letter - A Mindful Communication Tool

A mindful communication tool for emotional reflection in relationships. Slow Letter helps people express their feelings in writing, then take time to reflect before deciding whether to send. This deliberate pause encourages calmer, more thoughtful communication with loved ones.

## Option Chosen

I chose **Option A (Multi-page)** because:
- Clear structure with each feature as separate pages
- Easy for beginners to understand and maintain
- Traditional website architecture that's easy to extend
- Single responsibility per page reduces complexity

## Pages/Sections

1. **index.html - Letters in Waiting**
   - Shows list of all letters with search functionality
   - Displays letter status (Draft, Scheduled, Sent, Cancelled)
   - Dynamic JS-generated section for waiting letters

2. **letter.html - Letter Detail**
   - Shows individual letter content and recipient info
   - Displays delivery schedule and full emotional letter text
   - Captures the reflective, healing nature of the message

3. **write.html - Write What You Feel**
   - Form to create new letters with emotional expression
   - Recipient input, content editor, delivery delay options
   - Encourages slow, thoughtful writing with "Express yourself. Take your time. Decide later."

4. **settings.html - Reflection Settings**
   - Letter Box ID and Profile management
   - Reflection Reminders (gentle notifications to review drafts)
   - Personal Notes, Letter History, Privacy options

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

Still learning HTML basics, so I kept it simple :)

## Mockups
- (WIP) https://figma.com/file/your-mockup  
  If not available: No mockups yet – will add next week

## Week 8 Update
- Key changes: Added `script.js`; data array with 5+ emotional letter items; dynamic DOM creation with `forEach`; injected into `#content-container` on `index.html`.
- Refocused project concept to align with emotional reflection and delayed communication. Changed from email-like functionality to a mindful tool for expressing feelings in relationships.
- Challenges: First run didn't render because I used a wrong container id once / almost forgot to include the script, fixed after `console.log`. Rewriting all content to reflect emotional healing focus was time-consuming but important.
- Questions:
  1. Should I split data and rendering into separate files later?
  2. Is it okay to keep using simple `<div>` blocks for items (no semantic tags)?
- Next week goals: add basic styling with calming colors and expand emotional data fields (sentiment tags, reflection notes).

## How it works (JS)
Data array → loop with `forEach` → `createElement` for each part → set `textContent`/attributes → `appendChild` into `#content-container`.

## Note
This week I intentionally kept a few beginner-style quirks (e.g., mixed `let`/`var`, a `console.log`, a misspelled class like `cardd`). They do not break functionality.


