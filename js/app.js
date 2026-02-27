/**
 * ==========================================
 * EDEE STUDIO — MAIN APPLICATION
 * Author: Idrissa Sarr
 * ==========================================
 */

const EdeeApp = (() => {
    'use strict';

    // ============ DOM CACHE ============
    const DOM = {};
    const cacheDom = () => {
        DOM.loader = document.getElementById('loader');
        DOM.loaderPercent = document.getElementById('loaderPercent');
        DOM.cursor = document.getElementById('cursor');
        DOM.nav = document.getElementById('nav');
        DOM.hamburger = document.getElementById('hamburger');
        DOM.mobileMenu = document.getElementById('mobileMenu');
        DOM.backToTop = document.getElementById('backToTop');
        DOM.lightbox = document.getElementById('lightbox');
        DOM.lightboxImg = document.getElementById('lightboxImg');
        DOM.contactForm = document.getElementById('contactForm');
        DOM.galleryScroll = document.getElementById('galleryScroll');
        DOM.portfolioGrid = document.getElementById('portfolioGrid');
        DOM.toast = document.getElementById('toast');
    };

    // ============ LOADER ============
    const initLoader = () => {
        if (!DOM.loader) return;
        let percent = 0;
        const interval = setInterval(() => {
            percent += Math.floor(Math.random() * 8) + 3;
            if (percent >= 100) {
                percent = 100;
                clearInterval(interval);
                setTimeout(() => {
                    DOM.loader.classList.add('hidden');
                    document.body.style.overflow = '';
                }, 400);
            }
            if (DOM.loaderPercent) {
                DOM.loaderPercent.textContent = percent + '%';
            }
        }, 70);
    };

    // ============ CUSTOM CURSOR ============
    const initCursor = () => {
        if (!DOM.cursor || window.innerWidth <= 768) return;

        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animate = () => {
            cursorX += (mouseX - cursorX) * 0.12;
            cursorY += (mouseY - cursorY) * 0.12;
            DOM.cursor.style.left = cursorX + 'px';
            DOM.cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animate);
        };
        animate();

        const hoverTargets = document.querySelectorAll(
            'a, button, .portfolio-item, .gallery-card, .service-row, .testimonial-card, .social-link, .filter-btn'
        );
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => DOM.cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => DOM.cursor.classList.remove('hover'));
        });
    };

    // ============ NAVIGATION ============
    const initNav = () => {
        // Scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;

            if (DOM.nav) {
                DOM.nav.classList.toggle('scrolled', scrollY > 50);
            }
            if (DOM.backToTop) {
                DOM.backToTop.classList.toggle('visible', scrollY > 600);
            }

            lastScroll = scrollY;
        }, { passive: true });

        // Hamburger
        if (DOM.hamburger && DOM.mobileMenu) {
            DOM.hamburger.addEventListener('click', toggleMobileMenu);
        }

        // Active link
        highlightActiveLink();

        // Back to top
        if (DOM.backToTop) {
            DOM.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    };

    const toggleMobileMenu = () => {
        DOM.hamburger.classList.toggle('active');
        DOM.mobileMenu.classList.toggle('active');
        document.body.style.overflow = DOM.mobileMenu.classList.contains('active') ? 'hidden' : '';
    };

    const closeMobileMenu = () => {
        if (DOM.hamburger) DOM.hamburger.classList.remove('active');
        if (DOM.mobileMenu) DOM.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    };

    const highlightActiveLink = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    };

    // ============ SCROLL REVEAL ============
    const initReveal = () => {
        const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        if (targets.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        targets.forEach(el => observer.observe(el));
    };

    // ============ COUNTER ANIMATION ============
    const initCounters = () => {
        const counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    };

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = Math.floor(target * eased) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    // ============ PORTFOLIO FILTER ============
    const initPortfolioFilter = () => {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const items = document.querySelectorAll('.portfolio-item');
        if (filterBtns.length === 0 || items.length === 0) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;

                items.forEach((item, i) => {
                    const cat = item.dataset.category;
                    const show = filter === 'all' || cat === filter;

                    if (show) {
                        item.style.display = '';
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            item.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, i * 60);
                    } else {
                        item.style.transition = 'all 0.3s ease';
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.95)';
                        setTimeout(() => { item.style.display = 'none'; }, 300);
                    }
                });
            });
        });
    };

    // ============ GALLERY DRAG ============
    const initGalleryDrag = () => {
        const el = DOM.galleryScroll;
        if (!el) return;

        let isDown = false, startX, scrollLeft;

        el.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        });
        el.addEventListener('mouseleave', () => { isDown = false; });
        el.addEventListener('mouseup', () => { isDown = false; });
        el.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            el.scrollLeft = scrollLeft - (x - startX) * 2;
        });
    };

    // ============ LIGHTBOX ============
    const initLightbox = () => {
        if (!DOM.lightbox) return;

        document.querySelectorAll('[data-lightbox]').forEach(el => {
            el.addEventListener('click', () => {
                const src = el.dataset.lightbox;
                if (src) {
                    DOM.lightboxImg.src = src;
                    DOM.lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        DOM.lightbox.addEventListener('click', (e) => {
            if (e.target === DOM.lightbox || e.target.classList.contains('lightbox-close')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    };

    const closeLightbox = () => {
        if (!DOM.lightbox) return;
        DOM.lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { if (DOM.lightboxImg) DOM.lightboxImg.src = ''; }, 500);
    };

    // ============ CONTACT FORM ============
    const initContactForm = () => {
        const form = DOM.contactForm;
        if (!form) return;

        // Real-time validation
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    validateField(field);
                }
            });
        });

        form.addEventListener('submit', handleFormSubmit);
    };

    const validateField = (field) => {
        const name = field.name;
        const value = field.value;
        const errorEl = field.parentElement.querySelector('.form-error');
        let result;

        switch (name) {
            case 'name':
                result = EdeeSecurity.validators.name(value);
                break;
            case 'email':
                result = EdeeSecurity.validators.email(value);
                break;
            case 'phone':
                result = EdeeSecurity.validators.phone(value);
                break;
            case 'message':
                result = EdeeSecurity.validators.message(value);
                break;
            case 'service':
            case 'budget':
                result = EdeeSecurity.validators.select(value);
                break;
            default:
                result = { valid: true };
        }

        if (!result.valid) {
            field.classList.add('error');
            if (errorEl) {
                errorEl.textContent = result.msg;
                errorEl.classList.add('visible');
            }
        } else {
            field.classList.remove('error');
            if (errorEl) {
                errorEl.textContent = '';
                errorEl.classList.remove('visible');
            }
        }

        return result;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const form = e.target;

        // 1. Honeypot check
        if (!EdeeSecurity.checkHoneypot(form)) {
            showToast('Soumission invalide.', 'error');
            return;
        }

        // 2. Timing check
        if (!EdeeSecurity.timingCheck.isValid()) {
            showToast('Veuillez prendre votre temps pour remplir le formulaire.', 'error');
            return;
        }

        // 3. Rate limit check
        if (!EdeeSecurity.rateLimiter.canSubmit()) {
            const wait = EdeeSecurity.rateLimiter.getResetTime();
            showToast(`Trop de tentatives. Réessayez dans ${wait}s.`, 'error');
            return;
        }

        // 4. Validate all fields
        let allValid = true;
        const formData = {};

        form.querySelectorAll('input:not(.hp-field input), textarea, select').forEach(field => {
            if (field.name && field.name !== 'website_url' && field.name !== '_csrf') {
                const result = validateField(field);
                if (!result.valid && field.hasAttribute('required')) {
                    allValid = false;
                } else if (result.valid) {
                    formData[field.name] = result.value || field.value;
                }
            }
        });

        if (!allValid) {
            showToast('Veuillez corriger les erreurs du formulaire.', 'error');
            return;
        }

        // 5. Spam check
        if (EdeeSecurity.isSpam(formData.message || '')) {
            showToast('Votre message a été détecté comme spam.', 'error');
            return;
        }

        // 6. Submit
        const submitBtn = form.querySelector('.form-submit');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Envoi en cours...';

        // Simulate API call (replace with real endpoint)
        setTimeout(() => {
            EdeeSecurity.rateLimiter.recordSubmission();
            submitBtn.innerHTML = '✓ Message envoyé !';
            submitBtn.style.background = 'var(--success)';
            submitBtn.style.color = 'var(--white)';
            showToast('Message envoyé avec succès ! Réponse sous 24h.', 'success');
            form.reset();
            EdeeSecurity.timingCheck.start();

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
            }, 3000);
        }, 1500);
    };

    // ============ TOAST NOTIFICATION ============
    const showToast = (message, type = 'success') => {
        let toast = DOM.toast;
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
            DOM.toast = toast;
        }

        const icon = type === 'success' ? '✓' : '⚠';
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${icon}</span> ${EdeeSecurity.sanitize(message)}`;

        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 4000);
    };

    // ============ SMOOTH SCROLL ============
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    closeMobileMenu();
                    const offset = 80;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    };

    // ============ PARALLAX ============
    const initParallax = () => {
        const hero = document.querySelector('.hero-content');
        if (!hero) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                hero.style.transform = `translateY(${scrolled * 0.3}px)`;
                hero.style.opacity = 1 - scrolled / 800;
            }
        }, { passive: true });
    };

    // ============ LAZY LOAD IMAGES ============
    const initLazyLoad = () => {
        const images = document.querySelectorAll('img[data-src]');
        if (images.length === 0) return;

        const imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.addEventListener('load', () => {
                        img.style.opacity = '1';
                    });
                    imgObserver.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });

        images.forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s';
            imgObserver.observe(img);
        });
    };

    // ============ MOBILE MENU LINKS ============
    const initMobileMenuLinks = () => {
        if (DOM.mobileMenu) {
            DOM.mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }
    };

    // ============ INITIALIZE ============
    const init = () => {
        cacheDom();
        initLoader();
        initCursor();
        initNav();
        initReveal();
        initCounters();
        initPortfolioFilter();
        initGalleryDrag();
        initLightbox();
        initContactForm();
        initSmoothScroll();
        initParallax();
        initLazyLoad();
        initMobileMenuLinks();
    };

    // Public
    return { init, showToast, closeMobileMenu };
})();

document.addEventListener('DOMContentLoaded', EdeeApp.init);