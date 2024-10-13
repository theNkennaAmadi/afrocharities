/*
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {gsap} from "gsap";
import Swiper from "swiper";

 */
// Initialize the CommunityManager
gsap.registerPlugin(ScrollTrigger);

class CommunityManager {
    constructor() {
        this.mm = gsap.matchMedia();
        this.scroller = null;
        this.swiper = null;
        this.momentsList = [];

        this.init();
    }

    init() {
        this.initScroller();
        this.initMomentsList();
        this.initSwiper();
    }

    initScroller() {
        this.scroller = new Scroller(this.mm);
    }

    initMomentsList() {
        const momentsListElements = [...document.querySelectorAll('.moments-content-wrapper')];
        this.momentsList = momentsListElements.map(list => new MomentsList(list));
    }

    initSwiper() {
        const slidesToShow = window.innerHeight / this.remToPixels(4);
        const slides = document.querySelectorAll('.swiper-slide');
        if (slides.length < slidesToShow) {
            gsap.set('.v-content-btn', { opacity: 0 });
        }

        this.swiper = new Swiper('.swiper', {
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

class Scroller {
    constructor(mm) {
        this.scrollWrapper = document.querySelector('.components-main-wrapper');
        this.scrollContainer = document.querySelector('.component-wrapper');
        this.mm = mm

        this.init();
    }

    init() {
        this.calculateScrollValues();
        this.initHorScroll();

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
        return - (this.scrollWidth - window.innerWidth);
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
            const totalScrollDistance = this.scrollWidth - window.innerWidth;

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
}

class MomentsList {
    constructor(list) {
        this.list = list;
        this.items = list.querySelectorAll('.moments-item');
        this.itemDetails = list.querySelectorAll('.moments-details-item');
        this.prevBtn = list.querySelector('.h-content-btn.prev');
        this.nextBtn = list.querySelector('.h-content-btn.next');
        this.currentIndex = 0;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.init();
    }

    init() {
        this.setInitialPositions();
        this.addEventListeners();
    }

    setInitialPositions() {
        this.items.forEach((item, index) => {
            let rotation = index !== 0 ? (index % 2 === 0 ? 5 : -5) : 0;
            gsap.set(item, {
                rotation: rotation,
                zIndex: this.items.length - index,
            });
            gsap.to(this.itemDetails[this.currentIndex], {
                autoAlpha: 1,
                duration: 0.2,
                zIndex: 5
            });
        });
    }

    addEventListeners() {
        this.nextBtn.addEventListener('click', this.nextCard.bind(this));
        this.prevBtn.addEventListener('click', this.prevCard.bind(this));
        this.list.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.list.addEventListener('touchmove', this.onTouchMove.bind(this), false);
        this.list.addEventListener('touchend', this.onTouchEnd.bind(this), false);
    }

    updateCards(type) {
        this.items.forEach((item, index) => {
            let offset = (index - this.currentIndex + this.items.length) % this.items.length;
            let rotation = offset !== 0 ? (offset % 2 === 0 ? 5 : -5) : 0;
            gsap.to(item, {
                rotation: rotation,
                zIndex: this.items.length - offset,
                duration: 0.5,
                ease: "power2.out"
            });
            let tl = gsap.timeline();
            if (type === 'next') {
                tl.to(this.itemDetails[index], {
                    visibility: 'hidden',
                    z: '-20rem',
                    yPercent: 50,
                    duration: 0.5,
                    zIndex: 1
                });
                tl.fromTo(this.itemDetails[this.currentIndex], {
                    autoAlpha: 0.5,
                    z: '10rem',
                    yPercent: 100,
                    duration: 0.5,
                    zIndex: 1
                }, {
                    autoAlpha: 1,
                    z: '0rem',
                    yPercent: 0,
                    duration: 0.5,
                    zIndex: 5
                }, "<");
            } else {
                tl.to(this.itemDetails[index], {
                    visibility: 'hidden',
                    z: '10rem',
                    yPercent: 100,
                    duration: 0.3,
                    zIndex: 1,
                });
                tl.fromTo(this.itemDetails[this.currentIndex], {
                    autoAlpha: 0.5,
                    z: '-20rem',
                    yPercent: 100,
                    duration: 0.5,
                    zIndex: 1
                }, {
                    autoAlpha: 1,
                    z: '0rem',
                    yPercent: 0,
                    duration: 0.5,
                    zIndex: 5
                }, "<");
            }
        });
    }

    nextCard() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.updateCards('next');
    }

    prevCard() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.updateCards('prev');
    }

    onTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    onTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
    }

    onTouchEnd() {
        if (this.touchStartX - this.touchEndX > 50) {
            this.nextCard();
        } else if (this.touchEndX - this.touchStartX > 50) {
            this.prevCard();
        }
        this.touchStartX = 0;
        this.touchEndX = 0;
    }
}

let communityManager;
window.addEventListener('load', () => {
    communityManager = new CommunityManager();
});