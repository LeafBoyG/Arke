document.addEventListener('DOMContentLoaded', () => {

    // --- Global Utility Functions ---

    /**
     * Smooth scrolls to an element.
     * @param {HTMLElement} targetElement The element to scroll to.
     */
    const smoothScroll = (targetElement) => {
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - (document.querySelector('.main-header')?.offsetHeight || 0), // Adjust for sticky header
                behavior: 'smooth'
            });
        }
    };

    // --- 1. Header & Navigation Enhancements ---

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('.main-header'); // For sticky header class

    if (navToggle && mainNav && header) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
            document.body.classList.toggle('no-scroll', mainNav.classList.contains('active')); // Prevent body scroll
        });

        // Close mobile nav when a link is clicked inside it
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', false);
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Dynamic "Active" Navigation Link Highlighting
    const highlightNavLink = () => {
        let currentPath = window.location.pathname; // Changed to 'let' for reassignment
        const navLinks = document.querySelectorAll('.main-nav ul li a');

        // Normalize paths for comparison (e.g., /index.html and / become /)
        if (currentPath === '/index.html' || currentPath === '/index.htm') {
            currentPath = '/';
        }

        navLinks.forEach(link => {
            let linkPath = new URL(link.href).pathname; // Changed to 'let' for reassignment

            if (linkPath === '/index.html' || linkPath === '/index.htm') {
                linkPath = '/';
            }

            // Check for exact match OR if current page is within the linked category
            const segmentsCurrent = currentPath.split('/').filter(Boolean);
            const segmentsLink = linkPath.split('/').filter(Boolean);

            if (currentPath === linkPath) {
                link.classList.add('active');
            }
            // Logic for highlighting parent category for nested articles (e.g., /article/topics/roman-aqueducts.html highlights 'Topics')
            else if (segmentsCurrent.length > 1 && segmentsLink.length > 0 &&
                     segmentsCurrent[0] === 'article' && segmentsCurrent[1] === segmentsLink[0] &&
                     linkPath === `/${segmentsLink[0]}.html`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active'); // Ensure only one is active
            }
        });
    };
    highlightNavLink(); // Call on load

    // Sticky Header Appearance Change
    if (header) { // Ensure header exists before adding listener
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) { // After 50px scroll
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Scroll-to-Top Button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.textContent = '↑';
    scrollToTopBtn.classList.add('scroll-to-top');
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling 300px
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- 2. Content Presentation & Interactivity ---

    // Image Lightbox for Figures (Custom Simple Lightbox)
    const setupLightbox = () => {
        const figures = document.querySelectorAll('.article-content figure img');
        if (figures.length === 0) return; // Exit if no images to lightbox

        const lightboxOverlay = document.createElement('div');
        lightboxOverlay.classList.add('lightbox-overlay');
        document.body.appendChild(lightboxOverlay);

        const lightboxContent = document.createElement('div');
        lightboxContent.classList.add('lightbox-content');
        lightboxOverlay.appendChild(lightboxContent);

        const lightboxImg = document.createElement('img');
        lightboxContent.appendChild(lightboxImg);

        const closeBtn = document.createElement('span');
        closeBtn.classList.add('lightbox-close');
        closeBtn.innerHTML = '&times;'; // HTML entity for 'x'
        lightboxContent.appendChild(closeBtn);

        figures.forEach(img => {
            img.style.cursor = 'zoom-in'; // Indicate clickability
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxOverlay.classList.add('visible');
                document.body.classList.add('no-scroll'); // Prevent body scroll
            });
        });

        const closeLightbox = () => {
            lightboxOverlay.classList.remove('visible');
            document.body.classList.remove('no-scroll');
        };

        closeBtn.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', (e) => {
            // Close if clicking outside the image content
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxOverlay.classList.contains('visible')) {
                closeLightbox();
            }
        });
    };
    setupLightbox(); // Initialize lightbox

    // Scroll-Triggered Fade-In Animation for Sections (beyond Hero)
    const animateOnScroll = () => {
        // Target all sections that are not hero-article or hero-home, plus specific cards/blocks
        const sectionsToAnimate = document.querySelectorAll(
            'section:not(.hero-article, .hero-home), ' +
            '.featured-card, .grid-card, .article-list-card, ' +
            '.text-block, .team-member, .info-card'
        );

        if (sectionsToAnimate.length === 0) return;

        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.2 // Trigger when 20% of the section is visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, observerOptions);

        sectionsToAnimate.forEach(section => {
            section.classList.add('js-fade-in'); // Add base class for animation
            observer.observe(section);
        });
    };
    animateOnScroll(); // Initialize scroll animations

    // "Read More" / "Expand" Toggles for Cards
    const setupReadMoreToggles = () => {
        const expandableCards = document.querySelectorAll('.featured-card, .grid-card, .article-list-card');
        
        expandableCards.forEach(card => {
            const content = card.querySelector('p'); // The paragraph to expand
            if (!content) return; 

            // Measure if content overflows
            // Clone content to measure true scrollHeight if max-height is applied via CSS initially
            const tempDiv = document.createElement('div');
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.position = 'absolute';
            tempDiv.style.maxHeight = 'none'; // Allow to expand fully for measurement
            tempDiv.style.width = content.offsetWidth + 'px'; // Match original width
            tempDiv.innerHTML = content.innerHTML;
            document.body.appendChild(tempDiv);
            const hasMoreContent = tempDiv.scrollHeight > content.clientHeight;
            document.body.removeChild(tempDiv);


            if (!hasMoreContent) {
                card.classList.remove('expandable-card'); // Remove expandable class if not overflowing
                return;
            }
            
            card.classList.add('expandable-card'); // New class to apply max-height/fade via CSS

            // Line 99: This is where 'pBtn' was expected to be declared/used.
            // Ensure the button is created correctly.
            const readMoreBtn = document.createElement('button'); // Declare readMoreBtn with 'const'
            readMoreBtn.classList.add('btn', 'btn-secondary', 'read-more-btn');
            readMoreBtn.textContent = 'Read More';
            card.appendChild(readMoreBtn);

            readMoreBtn.addEventListener('click', () => {
                card.classList.toggle('expanded'); // Toggle expanded class on the card
                if (card.classList.contains('expanded')) {
                    readMoreBtn.textContent = 'Show Less';
                    // Optional: If you want smooth height transition, you'd set max-height dynamically here
                    // e.g., content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    readMoreBtn.textContent = 'Read More';
                    // content.style.maxHeight = ''; // Revert to CSS defined max-height
                }
            });
        });
    };
    setupReadMoreToggles(); // Initialize read more toggles


    // Basic Client-Side Filtering (e.g., for Topics/Eras overview pages)
    const setupClientSideFilter = () => {
        const searchInput = document.querySelector('.search-filter-input');
        const gridContainers = document.querySelectorAll('.article-list-grid, .featured-grid, .grid-items'); 

        if (!searchInput || gridContainers.length === 0) return;

        // Store all cards from all targeted grids
        let allCards = [];
        gridContainers.forEach(container => {
            allCards = allCards.concat(Array.from(container.children));
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            allCards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'flex'; // Ensure card's display property is set correctly
                } else {
                    card.style.display = 'none';
                }
            });
        });
    };
    setupClientSideFilter(); // Initialize filter


    // --- 3. Minor Enhancements ---

    // Dynamic Copyright Year
    const copyrightSpan = document.querySelector('.main-footer p');
    if (copyrightSpan) {
        // Find the year '2025' and replace it with the current year
        copyrightSpan.textContent = copyrightSpan.textContent.replace('2025', new Date().getFullYear());
    }

    // --- Complex Features (Conceptual - Not fully implemented here) ---
    // Interactive Timelines, more advanced search, etc., would go here.
});