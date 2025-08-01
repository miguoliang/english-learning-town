// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="game-overview.html"><strong aria-hidden="true">1.</strong> Game Overview</a></li><li class="chapter-item expanded "><a href="game-design/index.html"><strong aria-hidden="true">2.</strong> Game Design</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="game-design/concept.html"><strong aria-hidden="true">2.1.</strong> Core Concept</a></li><li class="chapter-item expanded "><a href="game-design/mechanics.html"><strong aria-hidden="true">2.2.</strong> Gameplay Mechanics</a></li><li class="chapter-item expanded "><a href="game-design/characters.html"><strong aria-hidden="true">2.3.</strong> Character System</a></li><li class="chapter-item expanded "><a href="game-design/learning.html"><strong aria-hidden="true">2.4.</strong> Learning System</a></li><li class="chapter-item expanded "><a href="game-design/exploration.html"><strong aria-hidden="true">2.5.</strong> Town Exploration</a></li></ol></li><li class="chapter-item expanded "><a href="technical/index.html"><strong aria-hidden="true">3.</strong> Technical Architecture</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="technical/overview.html"><strong aria-hidden="true">3.1.</strong> System Overview</a></li><li class="chapter-item expanded "><a href="technical/backend.html"><strong aria-hidden="true">3.2.</strong> Backend API</a></li><li class="chapter-item expanded "><a href="technical/client.html"><strong aria-hidden="true">3.3.</strong> Godot Client</a></li><li class="chapter-item expanded "><a href="technical/database.html"><strong aria-hidden="true">3.4.</strong> Database Schema</a></li></ol></li><li class="chapter-item expanded "><a href="development/index.html"><strong aria-hidden="true">4.</strong> Development Guide</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="development/setup.html"><strong aria-hidden="true">4.1.</strong> Getting Started</a></li><li class="chapter-item expanded "><a href="development/structure.html"><strong aria-hidden="true">4.2.</strong> Project Structure</a></li><li class="chapter-item expanded "><a href="development/build.html"><strong aria-hidden="true">4.3.</strong> Building &amp; Running</a></li></ol></li><li class="chapter-item expanded "><a href="api/index.html"><strong aria-hidden="true">5.</strong> API Reference</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="api/players.html"><strong aria-hidden="true">5.1.</strong> Player Endpoints</a></li><li class="chapter-item expanded "><a href="api/questions.html"><strong aria-hidden="true">5.2.</strong> Question Endpoints</a></li><li class="chapter-item expanded "><a href="api/interactions.html"><strong aria-hidden="true">5.3.</strong> Interaction Endpoints</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
