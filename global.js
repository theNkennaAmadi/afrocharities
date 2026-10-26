/*
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger'

 */

gsap.registerPlugin(ScrollTrigger)
gsap.config({nullTargetWarn: false});




window.addEventListener('load', () => {
    const lottie = Webflow.require('lottie').lottie;

    // Look the menu lottie up on demand: it may not be registered yet when 'load' fires
    function getMenuAnimation() {
        const menuLottie = document.querySelector('.menu-lottie');
        const animations = lottie.getRegisteredAnimations();
        return animations.find(anim => menuLottie && menuLottie.contains(anim.wrapper)) || animations[0];
    }

    function playMenuAnimation(isOpen) {
        const menuAnimation = getMenuAnimation();
        if (!menuAnimation) return;
        const play = () => isOpen ? menuAnimation.playSegments([80, 0], true) : menuAnimation.playSegments([30, 80], true);
        if (menuAnimation.isLoaded) {
            play();
        } else {
            menuAnimation.addEventListener('DOMLoaded', play);
        }
    }

    let mm2 = gsap.matchMedia();

    class Nav{
        constructor(header) {
            this.header = header;
            this.navMenuBtn = this.header.querySelector('.nav-menu-btn');
            this.navList = this.header.querySelector('.nav-list');
            this.nav = this.header.querySelector('.nav');
            this.navLinks = [...this.navList.querySelectorAll('a')];
            this.navListItems = [...this.header.querySelectorAll('.nav-list-item')];
            this.navSubLinks = [...this.header.querySelectorAll('.nav-list-sub-link')];
            this.navHiddenContentWrapper = [...this.header.querySelectorAll('.h-c')];
            this.navExplorerLinks = [...this.header.querySelectorAll('.explorer-link')]
            this.navExplorerSubLinks = [...this.header.querySelectorAll('.explorer-sub-link')]
            this.init();
        }
        init(){
            this.showNav();
            this.setupLinkHoverEffect(this.navListItems);
            this.setupLinkHoverEffect(this.navSubLinks);
            this.setupLinkHoverEffect(this.navExplorerLinks);
            this.setupLinkHoverEffect(this.navExplorerSubLinks);
        }

        setupLinkHoverEffect(linkItems) {
            linkItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    gsap.to(linkItems.filter(link => link !== item), {
                        opacity: 0.5,
                        duration: 0.3
                    });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(linkItems, {
                        opacity: 1,
                        duration: 0.3
                    });
                });
            });
        }

        showNav(){
            this.navOpen = false;
            this.tlShowNav = gsap.timeline({paused: true});
            this.hiddenContent = this.navHiddenContentWrapper.map((content) => content.querySelector('*'));
            mm2.add('(min-width:768px)', ()=>{this.tlShowNav.to(this.nav, {borderRight: '2px solid currentColor', ease:"expo.out", duration: 0.2})})
            this.tlShowNav.to(this.navList, {clipPath: 'inset(0% 0% 0% 0%)', display: 'grid',ease:"expo.out", duration: 1})
                .to(this.navMenuBtn.querySelector('.menu-text:nth-of-type(1)'), {opacity:0}, "<")
                .to(this.navMenuBtn.querySelector('.menu-text:nth-of-type(2)'), {opacity:1}, "<")
                .from(this.hiddenContent, {yPercent: 110, stagger: {amount: 0.6}}, "<0.5")
                .from('.embed.arrow', {yPercent: 150, duration:0.6},"<0.2")

            this.navMenuBtn.addEventListener('click', () => {
                this.navOpen ? this.tlShowNav.reverse() : this.tlShowNav.play();
                playMenuAnimation(this.navOpen);
                this.navOpen = !this.navOpen;
            })

            this.navLinks.forEach((link) => {
                link.addEventListener('click', () => {
                    this.navOpen ? this.tlShowNav.reverse() : this.tlShowNav.play();
                    playMenuAnimation(this.navOpen);
                    this.navOpen = !this.navOpen;
                });
            });

        }
    }

    if (document.querySelector('.header')) {
        new Nav(document.querySelector('.header'));
    }

    function initImageReveal() {
        const images = document.querySelectorAll('img');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    gsap.to(img.parentElement, {
                        opacity: 1,
                        scale: 1,
                        duration: 2,
                        ease: 'power2.out'
                    });
                    observer.unobserve(img);
                }
            });
        }, observerOptions);

        images.forEach(img => {
            gsap.set(img.parentElement, { opacity: 0, scale: 0.94 });
            observer.observe(img);
        });
    }

    initImageReveal();

    // Keep the copyright year current (e.g. "© 2024 Afro Charities" -> "© 2026 Afro Charities")
    function updateCopyrightYear() {
        const year = new Date().getFullYear();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.textContent.includes('©')) {
                node.textContent = node.textContent.replace(/©\s*\d{4}/, `© ${year}`);
            }
        }
    }

    updateCopyrightYear();

    // Newsletter forms -> Mailchimp audience "Afro Charities, Inc." (replaces the retired Webflow Logic flow).
    // Webflow still handles the submit (stores the submission and shows its success message);
    // this sends the same email to Mailchimp's embedded-form endpoint via JSONP.
    const MAILCHIMP_URL = 'https://afrocharities.us19.list-manage.com/subscribe/post-json?u=6abac7a61f20a9ff7f32670c4&id=c9842ee253';

    function subscribeToMailchimp(email) {
        const callbackName = `mcCallback_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const script = document.createElement('script');
        window[callbackName] = (response) => {
            if (response.result !== 'success') {
                console.warn('Mailchimp:', response.msg);
            }
            delete window[callbackName];
            script.remove();
        };
        script.src = `${MAILCHIMP_URL}&EMAIL=${encodeURIComponent(email)}&c=${callbackName}`;
        document.body.appendChild(script);
    }

    function initNewsletterForms() {
        const forms = document.querySelectorAll('#wf-form-nav-newsletter, #wf-form-Newsletter-Form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                const emailInput = form.querySelector('input[type="email"]');
                if (emailInput && emailInput.value.trim()) {
                    subscribeToMailchimp(emailInput.value.trim());
                }
            });
        });
    }

    initNewsletterForms();

    // Site pop-up: content comes from the active "Site Pop-ups" CMS item, rendered by a collection list in the
    // navbar component as a hidden [data-ac-popup] element whose attributes are bound to the item's fields.
    const POPUP_CSS = `
        .ac-popup{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px}
        .ac-popup[hidden]{display:none}
        .ac-popup__backdrop{position:absolute;inset:0;background:rgba(39,39,39,.55);animation:ac-popup-fade .35s ease both}
        .ac-popup__panel{position:relative;width:min(880px,100%);max-height:calc(100vh - 48px);overflow:auto;display:grid;grid-template-columns:1fr 1.1fr;background:var(--cinnabar,#f44d33);color:var(--beige,#f9f3e4);border:2px solid var(--beige,#f9f3e4);outline:2px solid var(--cinnabar,#f44d33);animation:ac-popup-rise .5s cubic-bezier(.16,1,.3,1) both}
        .ac-popup__panel.is-text-only{grid-template-columns:1fr;width:min(620px,100%)}
        .ac-popup__media{position:relative;margin:0;border-right:2px solid var(--beige,#f9f3e4);min-height:100%;background:#c9b9a0}
        .ac-popup__media img{display:block;width:100%;height:100%;object-fit:cover}
        .ac-popup__caption{position:absolute;left:0;right:0;bottom:0;display:flex;gap:10px;align-items:baseline;padding:10px 14px;background:linear-gradient(to top,rgba(39,39,39,.75),transparent);font:400 12px/1.35 "Worksans Variablefont Wght",sans-serif}
        .ac-popup__caption b{font:600 14px/1 Vtctatsuro,sans-serif}
        .ac-popup__body{display:flex;flex-direction:column;gap:18px;padding:64px 40px 40px}
        .ac-popup__eyebrow{font:italic 400 24px/1.1 Instrumentserif,serif;margin:0}
        .ac-popup__title{font:700 clamp(40px,5.2vw,64px)/.9 Vtctatsuro,sans-serif;text-transform:uppercase;margin:0;color:inherit}
        .ac-popup__text{font:400 16px/1.5 "Worksans Variablefont Wght",sans-serif;margin:0;max-width:44ch;color:inherit}
        .ac-popup__meta{display:grid;gap:6px;margin:0;padding:14px 0 0;border-top:1px solid rgba(249,243,228,.45);font:600 15px/1.2 Vtctatsuro,sans-serif;text-transform:uppercase;letter-spacing:.02em}
        .ac-popup__meta div{display:flex;gap:10px}
        .ac-popup__meta dt{opacity:.7;min-width:64px}
        .ac-popup__meta dd{margin:0}
        .ac-popup__actions{display:flex;flex-wrap:wrap;align-items:center;gap:18px;margin-top:6px}
        .ac-popup__cta{display:inline-flex;align-items:center;gap:10px;font:600 17px/1 Vtctatsuro,sans-serif;text-transform:uppercase;letter-spacing:.02em;text-decoration:none;color:var(--cinnabar,#f44d33);background:var(--beige,#f9f3e4);border:2px solid var(--beige,#f9f3e4);border-radius:999px;padding:11px 18px 10px 22px;transition:background .2s,color .2s}
        .ac-popup__cta svg{width:11px;height:11px;transition:transform .25s}
        .ac-popup__cta:hover{background:transparent;color:var(--beige,#f9f3e4)}
        .ac-popup__cta:hover svg{transform:translate(2px,-2px)}
        .ac-popup__later{font:400 14px/1 "Worksans Variablefont Wght",sans-serif;color:inherit;background:none;border:0;padding:4px 0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
        .ac-popup__close{position:absolute;top:14px;right:16px;z-index:2;display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:0;color:inherit;cursor:pointer;padding:6px;font:600 13px/1 Vtctatsuro,sans-serif;text-transform:uppercase}
        .ac-popup__close svg{width:20px;height:20px}
        .ac-popup__panel :focus-visible{outline:2px solid var(--beige,#f9f3e4);outline-offset:3px}
        .ac-popup__cta:focus-visible{outline-color:var(--black-alt,#272727)}
        @keyframes ac-popup-fade{from{opacity:0}}
        @keyframes ac-popup-rise{from{opacity:0;transform:translateY(24px) scale(.98)}}
        @media (max-width:767px){
            .ac-popup{padding:0;align-items:end}
            .ac-popup__panel,.ac-popup__panel.is-text-only{grid-template-columns:1fr;width:100%;max-height:92vh;border-width:2px 0 0;outline:0}
            .ac-popup__media{border-right:0;border-bottom:2px solid var(--beige,#f9f3e4);height:190px}
            .ac-popup__body{padding:28px 22px 30px;gap:14px}
            .ac-popup__eyebrow{font-size:20px}
            .ac-popup__title{font-size:40px}
            .ac-popup__text{font-size:15px}
            .ac-popup__close{top:10px;right:10px;background:var(--cinnabar,#f44d33);border-radius:999px}
        }
        @media (prefers-reduced-motion:reduce){.ac-popup__backdrop,.ac-popup__panel{animation:none}}
    `;
    const POPUP_DELAY = 1500;
    const POPUP_DEFAULT_MAX_VIEWS = 3;

    function readPopupViews(key) {
        try {
            return parseInt(localStorage.getItem(key), 10) || 0;
        } catch (e) {
            return 0;
        }
    }

    function writePopupViews(key, views) {
        try {
            localStorage.setItem(key, String(views));
        } catch (e) {
            // Storage blocked (private mode etc.): the pop-up still works, it just can't cap views.
        }
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function buildPopup(data) {
        const popup = el('div', 'ac-popup');
        popup.hidden = true;
        popup.appendChild(el('div', 'ac-popup__backdrop')).setAttribute('data-popup-close', '');

        const panel = popup.appendChild(el('div', 'ac-popup__panel'));
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-labelledby', 'ac-popup-title');

        const close = panel.appendChild(el('button', 'ac-popup__close'));
        close.type = 'button';
        close.setAttribute('data-popup-close', '');
        close.setAttribute('aria-label', 'Close announcement');
        close.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 3l14 14M17 3L3 17"/></svg><span aria-hidden="true">Close</span>';

        if (data.image) {
            const figure = panel.appendChild(el('figure', 'ac-popup__media'));
            const img = figure.appendChild(el('img'));
            img.src = data.image;
            img.alt = data.imageCaption || '';
            if (data.imageYear || data.imageCaption) {
                const caption = figure.appendChild(el('figcaption', 'ac-popup__caption'));
                if (data.imageYear) caption.appendChild(el('b', '', data.imageYear));
                if (data.imageCaption) caption.appendChild(el('span', '', data.imageCaption));
            }
        } else {
            panel.classList.add('is-text-only');
        }

        const body = panel.appendChild(el('div', 'ac-popup__body'));
        if (data.eyebrow) body.appendChild(el('p', 'ac-popup__eyebrow', data.eyebrow));
        body.appendChild(el('h2', 'ac-popup__title', data.headline)).id = 'ac-popup-title';
        if (data.text) body.appendChild(el('p', 'ac-popup__text', data.text));

        // Details: one "Label: Value" per line
        const details = (data.details || '').split('\n').map(line => line.trim()).filter(Boolean);
        if (details.length) {
            const meta = body.appendChild(el('dl', 'ac-popup__meta'));
            details.forEach(line => {
                const [label, ...rest] = line.split(':');
                const row = meta.appendChild(el('div'));
                row.appendChild(el('dt', '', rest.length ? label.trim() : ''));
                row.appendChild(el('dd', '', rest.length ? rest.join(':').trim() : line));
            });
        }

        const actions = body.appendChild(el('div', 'ac-popup__actions'));
        const cta = actions.appendChild(el('a', 'ac-popup__cta'));
        cta.href = data.buttonLink;
        cta.appendChild(el('span', '', data.buttonLabel || 'Learn more'));
        cta.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 11 11" fill="none" aria-hidden="true"><path d="M8.45 9.82h2V.33H.96v2h6.07L.26 9.11l1.41 1.41 6.78-6.78v6.08Z" fill="currentColor"/></svg>');
        if (/^https?:\/\//.test(data.buttonLink) && !data.buttonLink.includes(location.hostname)) {
            cta.target = '_blank';
            cta.rel = 'noopener';
        }
        const later = actions.appendChild(el('button', 'ac-popup__later', 'Maybe later'));
        later.type = 'button';
        later.setAttribute('data-popup-close', '');

        return {popup, panel, cta};
    }

    // Webflow components can't hold CMS collection lists, so the active pop-up is rendered on the internal
    // /site-popup page (noindex) and fetched from there. Cached per visitor for a few minutes.
    const POPUP_DATA_URL = '/site-popup';
    const POPUP_CACHE_KEY = 'acPopupData';
    const POPUP_CACHE_MS = 10 * 60 * 1000;

    function readPopupSource(root) {
        const source = root.querySelector('[data-ac-popup]');
        if (!source) return null;
        const data = {...source.dataset};
        // The Image field can't be bound to an attribute, so it comes from a hidden image inside the data element
        const sourceImg = source.querySelector('[data-ac-popup-image]');
        const imgSrc = sourceImg && !sourceImg.classList.contains('w-dyn-bind-empty') ? sourceImg.getAttribute('src') : '';
        data.image = imgSrc && !imgSrc.includes('placeholder') ? imgSrc : '';
        return data;
    }

    async function loadPopupData() {
        try {
            const cached = JSON.parse(sessionStorage.getItem(POPUP_CACHE_KEY) || 'null');
            if (cached && Date.now() - cached.time < POPUP_CACHE_MS) return cached.data;
        } catch (e) {
            // No session storage: fall through and fetch
        }
        const response = await fetch(POPUP_DATA_URL, {credentials: 'same-origin'});
        if (!response.ok) return null;
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const data = readPopupSource(doc);
        try {
            sessionStorage.setItem(POPUP_CACHE_KEY, JSON.stringify({time: Date.now(), data}));
        } catch (e) {
            // Ignore: caching is only an optimisation
        }
        return data;
    }

    async function initSitePopup() {
        if (location.pathname.startsWith(POPUP_DATA_URL)) return;
        let data;
        try {
            data = await loadPopupData();
        } catch (e) {
            return;
        }
        if (!data || !data.headline || !data.buttonLink || !data.slug) return;

        // Shown at most once per visit (session), and on at most Max Views separate visits per browser
        const maxViews = parseInt(data.maxViews, 10) > 0 ? parseInt(data.maxViews, 10) : POPUP_DEFAULT_MAX_VIEWS;
        const storageKey = `acPopupViews:${data.slug}`;
        const visitKey = `acPopupSeenThisVisit:${data.slug}`;
        if (readPopupViews(storageKey) >= maxViews) return;
        try {
            if (sessionStorage.getItem(visitKey)) return;
        } catch (e) {
            // No session storage: fall back to the per-browser cap only
        }

        if (!document.getElementById('ac-popup-styles')) {
            const style = el('style');
            style.id = 'ac-popup-styles';
            style.textContent = POPUP_CSS;
            document.head.appendChild(style);
        }

        const {popup, panel, cta} = buildPopup(data);
        document.body.appendChild(popup);
        let lastFocus = null;

        const focusables = () => [...panel.querySelectorAll('a[href], button:not([disabled])')];

        function closePopup() {
            if (popup.hidden) return;
            popup.hidden = true;
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKeydown);
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        function onKeydown(e) {
            if (e.key === 'Escape') {
                closePopup();
            } else if (e.key === 'Tab') {
                const items = focusables();
                const first = items[0];
                const last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        function openPopup() {
            // Don't interrupt someone who already has the menu or another overlay open
            if (document.body.style.overflow === 'hidden') return;
            writePopupViews(storageKey, readPopupViews(storageKey) + 1);
            try {
                sessionStorage.setItem(visitKey, '1');
            } catch (e) {
                // Ignore: only affects the once-per-visit rule
            }
            lastFocus = document.activeElement;
            popup.hidden = false;
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', onKeydown);
            focusables()[0].focus();
        }

        popup.addEventListener('click', e => {
            if (e.target.closest('[data-popup-close]')) closePopup();
        });
        // Acting on the pop-up counts as done: don't show it to this visitor again
        cta.addEventListener('click', () => {
            writePopupViews(storageKey, maxViews);
            closePopup();
        });

        setTimeout(openPopup, POPUP_DELAY);
    }

    initSitePopup();




    //Disable right click
    document.addEventListener('contextmenu', event => event.preventDefault());

    gsap.to('.component-wrapper', {opacity: 1, duration: 1.5, delay: 0.6})

    const upNextLink = document.querySelector('.up-next-cta');
    if (!upNextLink){
        return
    }
    const tlUpNext = gsap.timeline({paused: true});
    tlUpNext.to(upNextLink.querySelector('.icon-2'), {x: '0rem', y: '0rem', duration: 0.5})
        .to(upNextLink.querySelector('.icon-1'), {x: '1rem', y: '1rem', duration: 0.5}, "<")


    upNextLink.addEventListener('mouseenter', () => {
        tlUpNext.play();
    });
    upNextLink.addEventListener('mouseleave', () => {
        tlUpNext.reverse();
    });



});





