# Enhancement TODO List

## Server Enhancements
- [x] Add basic logging to server.py for requests (method/path)
- [x] Add translate endpoint using googletrans

## HTML Enhancements
- [x] Add Font Awesome CDN for icons
- [x] Add dark mode toggle button in controls
- [x] Add buttons for numbers/symbols layout toggle, shift, undo/redo
- [x] Add word count display below editor
- [x] Wrap sections in cards for visual separation
- [x] Improve ARIA for new elements
- [x] Add language selector in controls
- [x] Add translator section with input, target select, button, output

## CSS Enhancements
- [x] Import Google Fonts (Roboto)
- [x] Add dark mode variables and .dark class
- [x] Enhance keys with gradients, shadows, animations
- [x] Improve editor styling (focus glow, resize)
- [x] Add responsive media queries
- [x] Style new buttons/icons with transitions
- [x] Add styles for translator section (.translator, .translate-controls, .translate-output)

## JS Enhancements
- [x] Integrate server autocorrect into editor
- [x] Add NUMBERS and SYMBOLS layouts, toggle button
- [x] Add shift toggle for uppercase
- [x] Implement dark mode toggle with localStorage
- [x] Add undo/redo functionality
- [x] Add real-time word count
- [x] Improve voice typing (stop button, status)
- [x] Save/load draft to/from localStorage
- [x] Update layoutKeys for multiple layouts
- [x] Add language layouts (Hindi, Kannada, Malayalam, Tamil)
- [x] Add language selector event handler
- [x] Add translate button event handler with fetch to /translate
- [x] Add DOM references for undo, redo, word count
- [x] Implement undo/redo with history array and buttons
- [x] Implement word count update on input

## Testing and Run
- [x] Run the project with python server.py
- [x] Test UI and functionality via browser
- [x] Move translator to separate page
- [x] Add clear button to translator
- [x] Update voice typing to support other languages and translate to English
- [x] Make the website look more attractive with modern design (gradients, animations, enhanced cards, footer)

## Generative AI for Complex Content
- [x] Install Python dependencies (openai)
- [x] Set up OpenAI API key (environment variable or config)
- [x] Add new endpoints in server.py for /generate/graph, /generate/equation, /generate/diagram
- [x] Update static/index.html: Add "Generated Content" section, include scripts for Chart.js, MathJax, Mermaid
- [x] Update static/styles.css: Style the new section and keys
- [x] Update static/app.js: Add new keys to layouts, event handlers for prompts and API calls
- [x] Update export endpoints to include generated content in DOCX/PDF
- [x] Test generation and rendering in browser
