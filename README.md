# theforum
A simple forum written in JavaScript, with no browser-side JS required

# Why another forum?
This one's a bit special. It's entirely written using node.js,
required no JS in the browser, and therefore supports browsers with 
noscript. It's also very easy to set up, so anyonr can make a 
simple platform for friends etc.

All pages are server-side-rendered, similarly to how PHP works,
just that this is JavaScript instead.

# The goal
- Simple
- <500sloc (we have 236 at the moment)
- Entries sorted by newest
- Very large amount of sub-threads supported
  (current limiting factor is stack overflow errors, this will be
  fixed.)
- Easy setup
- Anonymous
- No JS on browser-side required
- Usable on Text-Based browsers like lynx
