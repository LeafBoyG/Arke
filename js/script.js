document.addEventListener('DOMContentLoaded', () => {

    // --- Global Utility Functions ---
    const smoothScroll = (targetElement) => {
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - (document.querySelector('.main-header')?.offsetHeight || 0),
                behavior: 'smooth'
            });
        }
    };

    // --- 1. Header & Navigation Enhancements ---

    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('.main-header');

    if (navToggle && mainNav && header) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', mainNav.classList.contains('active'));
            document.body.classList.toggle('no-scroll', mainNav.classList.contains('active'));
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', false);
                document.body.classList.remove('no-scroll');
            });
        });
    }

    const highlightNavLink = () => {
        let currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.main-nav ul li a');

        if (currentPath === '/index.html' || currentPath === '/index.htm') {
            currentPath = '/';
        }

        navLinks.forEach(link => {
            let linkPath = new URL(link.href).pathname;

            if (linkPath === '/index.html' || linkPath === '/index.htm') {
                linkPath = '/';
            }

            const segmentsCurrent = currentPath.split('/').filter(Boolean);
            const segmentsLink = linkPath.split('/').filter(Boolean);

            if (currentPath === linkPath) {
                link.classList.add('active');
            } else if (segmentsCurrent.length > 1 && segmentsLink.length > 0 &&
                segmentsCurrent[0] === 'article' && segmentsCurrent[1] === segmentsLink[0] &&
                linkPath === `/${segmentsLink[0]}.html`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    highlightNavLink();

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.textContent = '↑';
    scrollToTopBtn.classList.add('scroll-to-top');
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        scrollToTopBtn.classList.toggle('show', window.scrollY > 300);
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- 2. Content Presentation & Interactivity ---

    const setupLightbox = () => {
        const figures = document.querySelectorAll('.article-content figure img');
        if (!figures.length) return;

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
        closeBtn.innerHTML = '&times;';
        lightboxContent.appendChild(closeBtn);

        figures.forEach(img => {
            img.style.cursor = 'zoom-in';
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
        lightboxOverlay.addEventListener('click', e => {
            if (e.target === lightboxOverlay) closeLightbox();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && lightboxOverlay.classList.contains('visible')) closeLightbox();
        });
    };
    setupLightbox();

    const animateOnScroll = () => {
        const sectionsToAnimate = document.querySelectorAll(
            'section:not(.hero-article, .hero-home), ' +
            '.featured-card, .grid-card, .article-list-card, ' +
            '.text-block, .team-member, .info-card'
        );
        if (!sectionsToAnimate.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.01 });

        sectionsToAnimate.forEach(section => {
            section.classList.add('js-fade-in');
            observer.observe(section);
        });
    };
    animateOnScroll();

    const setupReadMoreToggles = () => {
        const expandableCards = document.querySelectorAll('.featured-card, .grid-card, .article-list-card');

        expandableCards.forEach(card => {
            if (card.querySelector('.btn') && !card.classList.contains('expandable-override')) {
                card.classList.remove('expandable-card');
                return;
            }

            const content = card.querySelector('p');
            if (!content) return;

            const tempDiv = document.createElement('div');
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.position = 'absolute';
            tempDiv.style.maxHeight = 'none';
            tempDiv.style.width = content.offsetWidth + 'px';
            tempDiv.innerHTML = content.innerHTML;
            document.body.appendChild(tempDiv);

            const hasMoreContent = tempDiv.scrollHeight > content.clientHeight;
            document.body.removeChild(tempDiv);

            if (!hasMoreContent) {
                card.classList.remove('expandable-card');
                return;
            }

            card.classList.add('expandable-card');

            const readMoreBtn = document.createElement('button');
            readMoreBtn.classList.add('btn', 'btn-secondary', 'read-more-btn');
            readMoreBtn.textContent = 'Read More';
            card.appendChild(readMoreBtn);

            readMoreBtn.addEventListener('click', () => {
                card.classList.toggle('expanded');
                readMoreBtn.textContent = card.classList.contains('expanded') ? 'Show Less' : 'Read More';
            });
        });
    };
    setupReadMoreToggles();

    const setupClientSideFilter = () => {
        const searchInput = document.querySelector('.search-filter-input');
        const gridContainers = document.querySelectorAll('.article-list-grid, .featured-grid, .grid-items');

        if (!searchInput || !gridContainers.length) return;

        let allCards = [];
        gridContainers.forEach(container => {
            allCards = allCards.concat(Array.from(container.children));
        });

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            allCards.forEach(card => {
                card.style.display = card.textContent.toLowerCase().includes(searchTerm) ? 'flex' : 'none';
            });
        });
    };
    setupClientSideFilter();

    // --- 3. Minor Enhancements ---

    const copyrightSpan = document.querySelector('.main-footer p');
    if (copyrightSpan) {
        copyrightSpan.textContent = copyrightSpan.textContent.replace('2025', new Date().getFullYear());
    }


 const setupYearRollbackAnimation = () => {
        const animationContainer = document.querySelector('.animation-container');
        const rollingYearSpan = document.getElementById('rolling-year');

        if (!animationContainer || !rollingYearSpan) return;

        const targetYear = parseInt(animationContainer.dataset.targetYear, 10);
        if (isNaN(targetYear)) return;

        const startYear = new Date().getFullYear();
        const startStr = Math.abs(startYear).toString();
        const targetStr = Math.abs(targetYear).toString();
        const isBCE = targetYear < 0;

        const totalDigits = Math.max(startStr.length, targetStr.length);
        const animationDuration = 5000;
        const digitSlots = [];

        rollingYearSpan.innerHTML = ''; // clear

        // Create slots
        for (let i = 0; i < totalDigits; i++) {
            const slot = document.createElement('div');
            slot.className = 'digit-slot';

            const strip = document.createElement('div');
            strip.className = 'digit-strip';

            for (let d = 0; d <= 9; d++) {
                const span = document.createElement('span');
                span.textContent = d;
                strip.appendChild(span);
            }

            slot.appendChild(strip);
            rollingYearSpan.appendChild(slot);
            digitSlots.push({ slot, strip });
        }

        // Add BCE label if needed
        if (isBCE) {
            const bceSpan = document.createElement('span');
            bceSpan.className = 'bce-label';
            bceSpan.textContent = ' BCE';
            rollingYearSpan.appendChild(bceSpan);
        }

        let isAnimating = false;

        const animateSlotToDigit = (strip, targetDigit, delay, steps = 15) => {
            const digitHeight = strip.children[0].offsetHeight;
            let current = 0;
            let step = 0;

            const intervalTime = animationDuration / steps;

            setTimeout(() => {
                const interval = setInterval(() => {
                    step++;
                    current = (current + 1) % 10;
                    strip.style.transform = `translateY(-${digitHeight * current}px)`;

                    if (step >= steps) {
                        clearInterval(interval);
                        strip.style.transform = `translateY(-${digitHeight * targetDigit}px)`;
                    }
                }, intervalTime);
            }, delay);
        };

        const animateDigits = () => {
            if (isAnimating) return;
            isAnimating = true;

            const paddedStart = startStr.padStart(totalDigits, '0');
            const paddedTarget = targetStr.padStart(totalDigits, '0');

            digitSlots.forEach(({ strip }, i) => {
                const targetDigit = parseInt(paddedTarget[i], 10);
                const delay = i * 300;
                animateSlotToDigit(strip, targetDigit, delay);
            });

            // Reset flag after total duration
            setTimeout(() => {
                isAnimating = false;
            }, animationDuration + totalDigits * 300);
        };

        const isElementInViewport = (el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateDigits();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(animationContainer);

            if (isElementInViewport(animationContainer)) {
                animateDigits();
            }
        } else {
            animateDigits(); // fallback
        }
    };

    setupYearRollbackAnimation();
});