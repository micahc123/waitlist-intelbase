# intelbase OS - Instagram Carousel

A standalone, self-contained promotional Instagram carousel for **intelbase OS**, the AI operating system that runs your front office autonomously.

## What this is

`carousel.html` renders **8 Instagram carousel slides** stacked vertically. It is pure HTML and inline CSS (Plus Jakarta Sans loaded via Google Fonts link). There is no build step and no JavaScript framework. Just open the file in a browser.

## Slide dimensions

Every slide is a `<div class="slide" id="slide-N">` sized **exactly 1080x1080 px** with `overflow:hidden` and `position:relative`, which is the native Instagram square format. A small grey caption above each slide (for example "Slide 1 / 8 - Hook") is only a review label and is not part of the slide itself.

## The 8 slides

1. **Hook** - "Your website is losing leads while you sleep."
2. **Problem** - "Slow replies. Missed enquiries. Follow-ups that never happen."
3. **Reveal** - "Meet intelbase OS. An AI that runs your entire front office. Autonomously."
4. **Concierge** - "It answers every visitor in seconds. Day or night."
5. **Qualify + Book** - "It qualifies every lead and books the call for you."
6. **Growth** - Nurtures follow-ups, reactivates dormant leads, runs your ads.
7. **One Dashboard** - "You watch it all work on one dashboard." (faux dashboard panel)
8. **CTA** - "Ready to let it run your front office? Book a free call. Only 6 spots open." + `@intelbase`

## Exporting to PNG

Each slide can be exported as a 1080x1080 PNG by screenshotting its container element by id (`#slide-1` through `#slide-8`). A controller/automation tool renders the page and captures each `#slide-N` element bounding box individually. Because each container is exactly 1080x1080, the resulting PNGs are ready to upload directly to Instagram.

The review captions above each slide are intentionally outside the `.slide` containers, so element-level screenshots of `#slide-N` will not include them.
