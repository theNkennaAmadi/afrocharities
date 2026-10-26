/*
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger'

 */

gsap.registerPlugin(ScrollTrigger)
gsap.config({nullTargetWarn: false});

// Events: managed in the Webflow CMS ("Event Recaps" collection) and rendered on the internal /events-data page
// (replaces the old Eventbrite feed). Defined at top level so the page scripts (main.js, event.js, program.js)
// can use it from their DOMContentLoaded/load handlers.
window.AfroEvents = (() => {
    const DATA_URL = '/events-data';
    const CACHE_KEY = 'acEventsData';
    const CACHE_MS = 10 * 60 * 1000;

    const ICON_DATE = '<svg width="100%" height="100%" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.04688 6V20C3.04688 20.5304 3.25759 21.0391 3.63266 21.4142C4.00773 21.7893 4.51644 22 5.04688 22H19.0469C19.5773 22 20.086 21.7893 20.4611 21.4142C20.8362 21.0391 21.0469 20.5304 21.0469 20V6C21.0469 5.46957 20.8362 4.96086 20.4611 4.58579C20.086 4.21071 19.5773 4 19.0469 4H17.0469V2H15.0469V4H9.04688V2H7.04688V4H5.04688C4.51644 4 4.00773 4.21071 3.63266 4.58579C3.25759 4.96086 3.04688 5.46957 3.04688 6ZM19.0469 20H5.04688V8H19.0469V20Z" fill="currentColor"/></svg>';
    const ICON_PLACE = '<svg width="100%" height="100%" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0469 14C14.2529 14 16.0469 12.206 16.0469 10C16.0469 7.794 14.2529 6 12.0469 6C9.84094 6 8.04694 7.794 8.04694 10C8.04694 12.206 9.84094 14 12.0469 14ZM12.0469 8C13.1499 8 14.0469 8.897 14.0469 10C14.0469 11.103 13.1499 12 12.0469 12C10.9439 12 10.0469 11.103 10.0469 10C10.0469 8.897 10.9439 8 12.0469 8Z" fill="currentColor"/><path d="M11.467 21.814C11.6362 21.9349 11.839 21.9998 12.047 21.9998C12.2549 21.9998 12.4577 21.9349 12.627 21.814C12.931 21.599 20.076 16.44 20.047 10C20.047 5.589 16.458 2 12.047 2C7.63596 2 4.04696 5.589 4.04696 9.995C4.01796 16.44 11.163 21.599 11.467 21.814ZM12.047 4C15.356 4 18.047 6.691 18.047 10.005C18.068 14.443 13.659 18.428 12.047 19.735C10.436 18.427 6.02596 14.441 6.04696 10C6.04696 6.691 8.73796 4 12.047 4Z" fill="currentColor"/></svg>';
    const ICON_ARROW = '<svg width="100%" height="100%" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.44968 9.81678L10.4494 9.81678L10.4494 0.331654H0.964245V2.33135H7.03546L0.257138 9.10968L1.67135 10.5239L8.44968 3.74556L8.44968 9.81678Z" fill="currentColor"/></svg>';

    const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));

    function parse(doc) {
        return [...doc.querySelectorAll('[data-ac-event]')].map(el => {
            const d = el.dataset;
            const img = el.querySelector('[data-ac-event-image]');
            const imgSrc = img && !img.classList.contains('w-dyn-bind-empty') ? img.getAttribute('src') : '';
            const flag = el.querySelector('[data-ac-event-has-recap]');
            return {
                slug: d.slug,
                name: d.name,
                date: d.date, // e.g. "September 23, 2020"
                time: d.time,
                venue: d.venue,
                host: d.host,
                summary: d.summary,
                link: d.link,
                buttonLabel: d.buttonLabel,
                image: imgSrc && !imgSrc.includes('placeholder') ? imgSrc : '',
                hasRecap: !!flag && !flag.classList.contains('w-condition-invisible'),
                programSlug: d.programSlug,
                programName: d.programName,
            };
        }).filter(ev => ev.slug && ev.name && !isNaN(new Date(ev.date)));
    }

    async function load() {
        try {
            const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            if (cached && Date.now() - cached.time < CACHE_MS) return cached.events;
        } catch (e) {
            // No session storage: fetch below
        }
        try {
            const response = await fetch(DATA_URL, {credentials: 'same-origin'});
            if (!response.ok) return [];
            const events = parse(new DOMParser().parseFromString(await response.text(), 'text/html'));
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({time: Date.now(), events}));
            } catch (e) {
                // Ignore: caching is only an optimisation
            }
            return events;
        } catch (e) {
            console.error('Error loading events:', e);
            return [];
        }
    }

    // An event counts as upcoming through the end of its day, then moves to the archive automatically
    function isUpcoming(ev) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(ev.date) >= today;
    }

    const upcoming = events => events.filter(isUpcoming).sort((a, b) => new Date(a.date) - new Date(b.date));

    function formatDate(ev) {
        const day = dayjs(new Date(ev.date)).format('ddd D MMM YY');
        return ev.time ? `${day} · ${ev.time}` : day;
    }

    function cardHtml(ev) {
        const name = escapeHtml(ev.name);
        const label = escapeHtml(ev.buttonLabel || 'RSVP Now');
        const link = ev.link ? escapeHtml(ev.link) : (ev.hasRecap ? `/event-recaps/${escapeHtml(ev.slug)}` : '');
        return `
            <div class="upcoming-event-item">
                ${ev.image ? `<div class="upcoming-event-img"><img class="no-width" src="${escapeHtml(ev.image)}" loading="eager" alt="${name}"></div>` : ''}
                <div class="upcoming-event-content">
                    <div class="upcoming-events-loc">
                        <div class="upcoming-event-date-wrapper">
                            <div class="event-icon"><div class="embed w-embed">${ICON_DATE}</div></div>
                            <div>${escapeHtml(formatDate(ev))}</div>
                        </div>
                        ${ev.venue ? `
                        <div class="upcoming-event-date-wrapper">
                            <div class="event-icon"><div class="embed w-embed">${ICON_PLACE}</div></div>
                            <div>${escapeHtml(ev.venue)}</div>
                        </div>` : ''}
                    </div>
                    ${ev.programSlug && ev.programName ? `<a class="ac-event-program" href="/programs/${escapeHtml(ev.programSlug)}">Part of ${escapeHtml(ev.programName)} →</a>` : ''}
                    <div class="upcoming-event-details"><h3>${name}</h3></div>
                    ${ev.host ? `<p class="upcoming-event-host">Hosted by ${escapeHtml(ev.host)}</p>` : ''}
                    ${ev.summary ? `<p>${escapeHtml(ev.summary)}</p>` : ''}
                    ${link ? `
                    <a href="${link}" class="pill-btn w-inline-block"${ev.link ? ' target="_blank" rel="noopener"' : ''} aria-label="${label}: ${name}">
                        <div>${label}</div>
                        <div class="pill-btn-icon"><div class="embed w-embed">${ICON_ARROW}</div></div>
                    </a>` : ''}
                </div>
            </div>
        `;
    }

    const STYLES = `
        .ac-event-program{display:inline-block;margin:0 0 6px;font:600 13px/1.2 Vtctatsuro,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:inherit;text-decoration:underline;text-underline-offset:3px}
        .ac-program-empty{margin:0 0 32px;opacity:.75}
        .ac-program-past{list-style:none;padding:0;margin:0 0 32px;border-top:1px solid currentColor}
        .ac-program-past li{display:grid;grid-template-columns:9rem minmax(0,1fr) auto;gap:16px;align-items:baseline;padding:14px 0;border-bottom:1px solid currentColor}
        .ac-program-past .ac-past-date{font:600 14px/1.2 Vtctatsuro,sans-serif;text-transform:uppercase}
        .ac-program-past .ac-past-name{font:400 20px/1.2 Vtctatsuro,sans-serif;text-transform:uppercase}
        .ac-program-past a{font:600 14px/1.2 Vtctatsuro,sans-serif;text-transform:uppercase;color:inherit;white-space:nowrap}
        [data-program-events="upcoming"]{margin-bottom:32px}
        [data-program-events] .ac-event-program{display:none}
        [data-program-events-section] .program-archive-content{width:min(100%,42.2vw);margin:0 auto}
        [data-program-events-heading]{font-size:clamp(32px,3.4vw,52px);line-height:1;margin:0 0 24px}
        @media (max-width:767px){[data-program-events-section] .program-archive-content{width:100%}}
        @media (max-width:767px){.ac-program-past li{grid-template-columns:minmax(0,1fr)}}
    `;

    function injectStyles() {
        if (document.getElementById('ac-events-styles')) return;
        const style = document.createElement('style');
        style.id = 'ac-events-styles';
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    // Fill an "upcoming events" wrapper. Leaves the existing "no events" content in place when there are none.
    async function renderUpcoming(wrapper) {
        if (!wrapper) return [];
        injectStyles();
        const events = upcoming(await load());
        if (events.length) wrapper.innerHTML = events.map(cardHtml).join('');
        return events;
    }

    // Events page archive (Webflow list of the same collection): hide events that haven't happened yet,
    // and point past events without a recap at their ticket/info link. Run before the archive Swiper starts.
    async function filterArchive() {
        const items = [...document.querySelectorAll('.v-content-item')];
        if (!items.length) return;
        const bySlug = new Map((await load()).map(ev => [ev.slug, ev]));
        items.forEach(item => {
            const link = item.querySelector('a[href*="/event-recaps/"]');
            const slug = link && link.getAttribute('href').split('/event-recaps/')[1].replace(/[/?#].*$/, '');
            const ev = bySlug.get(slug);
            if (!ev) return;
            if (isUpcoming(ev)) {
                item.remove();
            } else if (!ev.hasRecap) {
                if (ev.link) {
                    link.href = ev.link;
                    link.target = '_blank';
                    link.rel = 'noopener';
                } else {
                    link.remove();
                }
            }
        });
    }

    // Program pages (/programs/<slug>): list the events linked to this program via the event's "Program" field
    async function renderProgramPage() {
        const match = location.pathname.match(/^\/programs\/([^/]+)\/?$/);
        const upcomingWrap = document.querySelector('[data-program-events="upcoming"]');
        const pastWrap = document.querySelector('[data-program-events="past"]');
        if (!match || !upcomingWrap) return;
        injectStyles();
        const events = (await load()).filter(ev => ev.programSlug === match[1]);
        const next = upcoming(events);
        const past = events.filter(ev => !isUpcoming(ev)).sort((a, b) => new Date(b.date) - new Date(a.date));

        upcomingWrap.innerHTML = next.length
            ? next.map(cardHtml).join('')
            : '<p class="ac-program-empty">No upcoming events right now. Subscribe to our newsletter to hear about the next one.</p>';

        if (pastWrap) {
            const pastHeading = document.querySelector('[data-program-events-heading="past"]');
            if (past.length) {
                pastWrap.innerHTML = `<ul class="ac-program-past">${past.map(ev => {
                    const link = ev.hasRecap ? `/event-recaps/${escapeHtml(ev.slug)}` : (ev.link ? escapeHtml(ev.link) : '');
                    const external = !ev.hasRecap && ev.link ? ' target="_blank" rel="noopener"' : '';
                    return `<li>
                        <span class="ac-past-date">${escapeHtml(dayjs(new Date(ev.date)).format('D MMM YYYY'))}</span>
                        <span class="ac-past-name">${escapeHtml(ev.name)}</span>
                        ${link ? `<a href="${link}"${external}>${ev.hasRecap ? 'Recap' : 'Details'} →</a>` : '<span></span>'}
                    </li>`;
                }).join('')}</ul>`;
            } else {
                pastWrap.remove();
                if (pastHeading) pastHeading.remove();
            }
        }
    }

    // Programs page: add a button on each program linking to its own page
    function addProgramPageButtons() {
        document.querySelectorAll('.btns-link-wrapper[data-program-slug]').forEach(row => {
            const slug = row.getAttribute('data-program-slug');
            if (!slug || row.querySelector('.ac-program-page-btn')) return;
            row.insertAdjacentHTML('afterbegin', `
                <a href="/programs/${escapeHtml(slug)}" class="pill-btn w-inline-block ac-program-page-btn">
                    <div>Explore the Program</div>
                    <div class="pill-btn-icon"><div class="embed w-embed">${ICON_ARROW}</div></div>
                </a>`);
        });
    }

    return {load, upcoming, cardHtml, renderUpcoming, filterArchive, renderProgramPage, addProgramPageButtons};
})();




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

    // Some pages (FAQ, event/program templates) use an alternate header with no slide-out menu
    const navHeader = document.querySelector('.header');
    if (navHeader && navHeader.querySelector('.nav-list') && navHeader.querySelector('.nav-menu-btn')) {
        try {
            new Nav(navHeader);
        } catch (e) {
            // Never let the menu stop the rest of the site scripts (pop-up, newsletter, etc.)
            console.error('Nav init failed:', e);
        }
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
        .ac-popup__panel{position:relative;width:min(880px,100%);max-height:calc(100vh - 48px);overflow:auto;display:grid;grid-template-columns:1fr 1.1fr;background:var(--ac-popup-bg,#f44d33);color:var(--ac-popup-fg,#f9f3e4);border:2px solid var(--ac-popup-fg,#f9f3e4);outline:2px solid var(--ac-popup-bg,#f44d33);animation:ac-popup-rise .5s cubic-bezier(.16,1,.3,1) both}
        .ac-popup__panel.is-text-only{grid-template-columns:1fr;width:min(620px,100%)}
        .ac-popup__media{position:relative;margin:0;border-right:2px solid var(--ac-popup-fg,#f9f3e4);min-height:100%;background:#c9b9a0}
        .ac-popup__media img{display:block;width:100%;height:100%;object-fit:cover}
        .ac-popup__caption{position:absolute;left:0;right:0;bottom:0;display:flex;gap:10px;align-items:baseline;padding:10px 14px;background:linear-gradient(to top,rgba(39,39,39,.75),transparent);font:400 12px/1.35 "Worksans Variablefont Wght",sans-serif}
        .ac-popup__caption b{font:600 14px/1 Vtctatsuro,sans-serif}
        .ac-popup__body{display:flex;flex-direction:column;gap:18px;padding:64px 40px 40px}
        .ac-popup__eyebrow{font:italic 400 24px/1.1 Instrumentserif,serif;margin:0}
        .ac-popup__title{font:700 clamp(40px,5.2vw,64px)/.9 Vtctatsuro,sans-serif;text-transform:uppercase;margin:0;color:inherit}
        .ac-popup__text{font:400 16px/1.5 "Worksans Variablefont Wght",sans-serif;margin:0;max-width:44ch;color:inherit}
        .ac-popup__meta{display:grid;gap:6px;margin:0;padding:14px 0 0;border-top:1px solid color-mix(in srgb,var(--ac-popup-fg,#f9f3e4) 45%,transparent);font:600 15px/1.2 Vtctatsuro,sans-serif;text-transform:uppercase;letter-spacing:.02em}
        .ac-popup__meta div{display:flex;gap:10px}
        .ac-popup__meta dt{opacity:.7;min-width:64px}
        .ac-popup__meta dd{margin:0}
        .ac-popup__actions{display:flex;flex-wrap:wrap;align-items:center;gap:18px;margin-top:6px}
        .ac-popup__cta{display:inline-flex;align-items:center;gap:10px;font:600 17px/1 Vtctatsuro,sans-serif;text-transform:uppercase;letter-spacing:.02em;text-decoration:none;color:var(--ac-popup-bg,#f44d33);background:var(--ac-popup-fg,#f9f3e4);border:2px solid var(--ac-popup-fg,#f9f3e4);border-radius:999px;padding:11px 18px 10px 22px;transition:background .2s,color .2s}
        .ac-popup__cta svg{width:11px;height:11px;transition:transform .25s}
        .ac-popup__cta:hover{background:transparent;color:var(--ac-popup-fg,#f9f3e4)}
        .ac-popup__cta:hover svg{transform:translate(2px,-2px)}
        .ac-popup__later{font:400 14px/1 "Worksans Variablefont Wght",sans-serif;color:inherit;background:none;border:0;padding:4px 0;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
        .ac-popup__close{position:absolute;top:14px;right:16px;z-index:2;display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:0;color:inherit;cursor:pointer;padding:6px;font:600 13px/1 Vtctatsuro,sans-serif;text-transform:uppercase}
        .ac-popup__close svg{width:20px;height:20px}
        .ac-popup__panel :focus-visible{outline:2px solid var(--ac-popup-fg,#f9f3e4);outline-offset:3px}
        .ac-popup__cta:focus-visible{outline-color:var(--black-alt,#272727)}
        @keyframes ac-popup-fade{from{opacity:0}}
        @keyframes ac-popup-rise{from{opacity:0;transform:translateY(24px) scale(.98)}}
        @media (max-width:767px){
            .ac-popup{padding:0;align-items:end}
            .ac-popup__panel,.ac-popup__panel.is-text-only{grid-template-columns:1fr;width:100%;max-height:92vh;border-width:2px 0 0;outline:0}
            .ac-popup__media{border-right:0;border-bottom:2px solid var(--ac-popup-fg,#f9f3e4);height:190px}
            .ac-popup__body{padding:28px 22px 30px;gap:14px}
            .ac-popup__eyebrow{font-size:20px}
            .ac-popup__title{font-size:40px}
            .ac-popup__text{font-size:15px}
            .ac-popup__close{top:10px;right:10px;background:var(--ac-popup-bg,#f44d33);border-radius:999px}
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

    // Match the pop-up to the page's own colour (each page sets its nav colour: cinnabar, guava, violet, blue, pine).
    // Very light navs (e.g. the white FAQ header) keep the default cinnabar so the pop-up still stands out.
    function applyPageColours(popup) {
        const nav = document.querySelector('.header .nav') || document.querySelector('.nav');
        if (!nav) return;
        const style = getComputedStyle(nav);
        const rgb = (style.backgroundColor.match(/[\d.]+/g) || []).map(Number);
        if (rgb.length < 3 || (rgb.length === 4 && rgb[3] === 0)) return;
        const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
        if (luminance > 0.75) return;
        popup.style.setProperty('--ac-popup-bg', style.backgroundColor);
        popup.style.setProperty('--ac-popup-fg', style.color);
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
        applyPageColours(popup);
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

    window.AfroEvents.renderProgramPage();
    window.AfroEvents.addProgramPageButtons();




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





