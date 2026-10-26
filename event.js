/*
import dayjs from 'dayjs'
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Swiper from 'swiper/bundle';

 */

/*
import {ScrollTrigger} from "gsap/ScrollTrigger";
import gsap from "gsap";

 */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

class EventManager {
    constructor() {
        this.wrapper = document.querySelector('.upcoming-events-wrapper');
        this.scrollWrapper = document.querySelector('.components-main-wrapper');
        this.scrollContainer = document.querySelector('.component-wrapper');
        this.scrollTriggerInstance = null;
        this.mm = gsap.matchMedia();

        this.init().then(()=>{
            this.initScrollTrigger();
            this.initSwiper();
            this.checkAnchorOnLoad();
            this.setupAnchorLinkListeners();
        })
    }

    async init() {
        await this.getEvents();
    }

    setupAnchorLinkListeners() {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href*="#"]');
            if (anchor) {
                e.preventDefault();
                const fullHref = anchor.getAttribute('href');
                const [pathname, hash] = fullHref.split('#');
                const currentPathname = window.location.pathname;
                const currentHash = window.location.hash.slice(1);

                if (pathname === currentPathname && hash === currentHash) {
                    // If we're on the same page and section, just reload
                    window.location.reload();
                } else if (pathname === currentPathname) {
                    // If we're on the same page but different section, scroll to it
                    this.scrollToSection(hash);
                } else {
                    // If it's a different page, navigate to it
                    window.location.href = fullHref;
                }
            }
        });
    }

    // Upcoming events come from the Webflow CMS via window.AfroEvents (global.js), replacing the Eventbrite feed
    async getEvents() {
        if (!window.AfroEvents) return;
        try {
            await window.AfroEvents.renderUpcoming(this.wrapper);
            await window.AfroEvents.filterArchive();
        } catch (e) {
            console.error('Error loading events:', e);
        }
    }

    initScrollTrigger() {
        window.setTimeout(() => {
            this.calculateScrollValues()
            this.initHorScroll()
        }, 100);

        // Listen for resize events
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
            this.calculateScrollValues(); // Recalculate scroll values on resize
        });

        // Check for anchor links after initializing horizontal scroll
        this.checkAnchorOnLoad();

        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href*="#"]');
            if (anchor) {
                e.preventDefault();
                const fullHref = anchor.getAttribute('href');
                const [pathname, hash] = fullHref.split('#');
                const currentPathname = window.location.pathname;
                const currentHash = window.location.hash.slice(1);

                if (pathname === currentPathname && hash === currentHash) {
                    // If we're on the same page and section, just reload
                    window.location.reload();
                } else if (pathname === currentPathname) {
                    // If we're on the same page but different section, scroll to it
                    this.scrollToSection(hash);
                } else {
                    // If it's a different page, navigate to it
                    window.location.href = fullHref;
                }
            }
        });

    }

    calculateScrollValues() {
        this.scrollWidth = this.scrollContainer.scrollWidth;
    }


    getScrollAmount() {
        return - (this.scrollContainer.scrollWidth - window.innerWidth);
    }

    initHorScroll() {
        this.mm.add('(min-width:768px)', () => {
            this.scrollTriggerInstance = gsap.to(this.scrollContainer, {
                x: () => this.getScrollAmount(),
                ease: "none",
                scrollTrigger: {
                    trigger: this.scrollWrapper,
                    pin: true,
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${-this.getScrollAmount()}`,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress * 100;
                        gsap.to('.scroll-indicator', { width: `${progress}%` });
                    }
                }
            });
        });
    }

    // Function to scroll to a specific section
    scrollToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            const sectionRect = targetSection.getBoundingClientRect();
            const containerRect = this.scrollContainer.getBoundingClientRect();
            const targetX = -(sectionRect.left - containerRect.left);


            // Calculate the total scrollable distance
            const totalScrollDistance = this.scrollContainer.scrollWidth - window.innerWidth;


            // Calculate the progress (0 to 1) based on the targetX
            const progress = targetX / this.getScrollAmount();


            // Calculate the corresponding scroll position
            const targetScrollPosition = progress * totalScrollDistance;

            // Animate the window's scroll position
            gsap.to(window, {
                scrollTo: targetScrollPosition,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => {
                    // Update the URL with the new hash
                    history.pushState(null, null, `#${sectionId}`);
                    // Refresh ScrollTrigger to ensure everything is in sync
                    ScrollTrigger.refresh();
                }
            });
        }
    }

    // Function to check for anchor links on page load
    checkAnchorOnLoad() {
        if (window.innerWidth > 768) {
            if (window.location.hash) {
                const sectionId = window.location.hash.substring(1);
                this.scrollToSection(sectionId);
            }
        }
    }

    initSwiper() {
        const slidesToShow = window.innerHeight / this.remToPixels(8);
        const slides = document.querySelectorAll('.swiper-slide');
        if (slides.length < slidesToShow) {
            gsap.set('.v-content-btn-wrapper', { display: 'none' });
        }

        new Swiper('.swiper', {
            direction: 'vertical',
            loop: true,
            autoHeight: true,
            slidesPerView: "auto",
            navigation: {
                nextEl: '.v-content-btn.next',
                prevEl: '.v-content-btn.prev',
            },
        });
    }

    remToPixels(rem) {
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return rem * rootFontSize;
    }

}

window.addEventListener('load', () => {
    new EventManager();
})