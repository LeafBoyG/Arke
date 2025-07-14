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
    const header = document.querySelector('.main-header');

    if (navToggle && mainNav && header) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
            // Optionally prevent body scroll when mobile nav is open
            document.body.classList.toggle('no-scroll', mainNav.classList.contains('active'));
        });

        // Close mobile nav when a link is clicked
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
        // CHANGED: Use 'let' instead of 'const' for currentPath as it might be reassigned
        let currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.main-nav ul li a');

        // Normalize paths for comparison (e.g., /index.html and / become /)
        if (currentPath === '/index.html' || currentPath === '/index.htm') {
            currentPath = '/';
        }

        navLinks.forEach(link => {
            // CHANGED: Use 'let' instead of 'const' for linkPath as it might be reassigned
            let linkPath = new URL(link.href).pathname;

            if (linkPath === '/index.html' || linkPath === '/index.htm') {
                linkPath = '/';
            }

            // For nested pages (e.g., /article/topics/roman-aqueducts.html)
            // we might want the parent category (Topics) to be active.
            const segmentsCurrent = currentPath.split('/').filter(Boolean);
            const segmentsLink = linkPath.split('/').filter(Boolean);

            // Check for exact match, or if current page is within the linked category
            if (currentPath === linkPath ||
                (segmentsCurrent.length > 0 && segmentsLink.length > 0 && segmentsCurrent[0] === 'article' && segmentsCurrent[1] === segmentsLink[0] &&
                 linkPath === `/${segmentsLink[0]}.html`)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active'); // Ensure only one is active
            }
        });
    };
    highlightNavLink(); // Call on load

    // Sticky Header Appearance Change
    if (header) {
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
                document.body.classList.add('no-scroll');
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
        const sectionsToAnimate = document.querySelectorAll('section:not(.hero-article, .hero-home), .featured-card, .grid-card, .text-block, .team-member, .info-card');
        if (sectionsToAnimate.length === 0) return; // Exit if no elements to observe

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
            if (!content) return; // Skip if no paragraph found

            // Check if content overflows. Use a temporary clone or check scrollHeight vs clientHeight.
            // A more robust check might involve creating a temporary clone of the element
            // to measure its height without maxHeight applied. For simplicity, we'll assume
            // if scrollHeight > clientHeight, it overflows, or if card has a fixed height.
            const hasMoreContent = content.scrollHeight > content.clientHeight; // Basic overflow check

            if (!hasMoreContent && !card.classList.contains('expandable-card')) { // Only add toggle if content overflows and it's not already set up
                return;
            }
            
            // Add a class to indicate it needs expansion behavior
            card.classList.add('expandable-card'); // New class to apply max-height/fade via CSS

            const readMoreBtn = document.createElement('button');
            readMoreBtn.classList.add('btn', 'btn-secondary', 'read-more-btn');
            readMoreBtn.textContent = 'Read More';
            card.appendChild(readMoreBtn);

            readMoreBtn.addEventListener('click', () => {
                card.classList.toggle('expanded'); // Toggle expanded class on the card
                if (card.classList.contains('expanded')) {
                    readMoreBtn.textContent = 'Show Less';
                    // Optional: If you want smooth height transition, set max-height to scrollHeight dynamically
                    // card.querySelector('.expandable-content-wrapper').style.maxHeight = card.querySelector('.expandable-content-wrapper').scrollHeight + 'px';
                } else {
                    readMoreBtn.textContent = 'Read More';
                    // card.querySelector('.expandable-content-wrapper').style.maxHeight = ''; // Revert to CSS defined max-height
                }
            });
        });
    };
    setupReadMoreToggles(); // Initialize read more toggles


    // Basic Client-Side Filtering (e.g., for Topics/Eras overview pages)
    const setupClientSideFilter = () => {
        const searchInput = document.querySelector('.search-filter-input');
        const gridContainer = document.querySelector('.article-list-grid, .featured-grid, .grid-items');

        if (!searchInput || !gridContainer) return;

        const cards = Array.from(gridContainer.children);

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            cards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'flex'; // Or 'block', etc., based on your card's default display
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
});