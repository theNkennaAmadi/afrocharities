/*
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Swiper from "swiper";

 */


class ArchiveManager {
    constructor() {
        this.mx = gsap.matchMedia();
        this.scroller = null;
        this.swiper = null;
        this.slidesToShow = window.innerHeight / this.remToPixels(8);
        this.slides = document.querySelectorAll('.swiper-slide');
        this.momentsList = [...document.querySelectorAll('.moments-content-wrapper')];
        this.archiveItems = document.querySelectorAll('.archival-process-item');

        this.init();
    }

    init() {
        gsap.registerPlugin(ScrollTrigger);
        this.initSwiper();
        this.initScroller();
        this.initMomentsList();
        this.initArchiveItems();
    }

    initSwiper() {
        if (this.slides.length < this.slidesToShow) {
            gsap.set('.v-content-btn-wrapper', { display: 'none' });
        }

        this.swiper = new Swiper('.swiper', {
            direction: 'vertical',
            loop: true,
            autoHeight: true,
            slidesPerGroup: 1,
            slidesPerGroupAuto: true,
            slidesPerView: "auto",
            navigation: {
                nextEl: '.v-content-btn.next',
                prevEl: '.v-content-btn.prev',
            },
        });
    }

    initScroller() {
        window.setTimeout(() => {
            this.scroller = new Scroller();
        }, 1000);
    }

    initMomentsList() {
        this.momentsList.forEach((list) => new MomentsList(list));
    }

    initArchiveItems() {
        this.archiveItems.forEach((item) => {
            let isExpanded = false;
            item.addEventListener('click', () => this.toggleArchiveItem(item, isExpanded));
        });
    }

    toggleArchiveItem(item, isExpanded) {
        const content = item.querySelector('.archive-process-content');
        const otherContents = Array.from(this.archiveItems)
            .filter(otherItem => otherItem !== item)
            .map(otherItem => otherItem.querySelector('.archive-process-content'));

        if (isExpanded) {
            this.collapseArchiveItem(content);
        } else {
            this.expandArchiveItem(content, otherContents);
        }

        isExpanded = !isExpanded;
    }

    collapseArchiveItem(content) {
        this.mx.add('(min-width:768px)', () => {
            gsap.to(content, {
                width: '0rem',
                duration: 0.5,
                ease: "power2.out",
                immediateRender: false,
                onComplete: () => this.updateScroll()
            });
        });

        this.mx.add('(max-width:767px)', () => {
            gsap.to(content, {
                height: '0rem',
                duration: 0.5,
                ease: "power2.out",
                immediateRender: false,
                onComplete: () => this.updateScroll()
            });
        });
    }

    expandArchiveItem(content, otherContents) {
        this.mx.add('(min-width:768px)', () => {
            gsap.to(otherContents, {
                width: '0rem',
                duration: 0.5,
                ease: "power2.out",
                immediateRender: false,
            });

            gsap.to(content, {
                width: '36rem',
                duration: 1,
                ease: "power2.out",
                immediateRender: false,
                onComplete: () => this.updateScroll()
            });
        });

        this.mx.add('(max-width:767px)', () => {
            gsap.to(otherContents, {
                height: '0rem',
                duration: 0.5,
                ease: "power2.out",
                immediateRender: false,
            });

            gsap.to(content, {
                height: 'auto',
                duration: 1,
                ease: "power2.out",
                immediateRender: false,
                onComplete: () => this.updateScroll()
            });
        });
    }

    updateScroll() {
        if (this.scroller) {
            setTimeout(() => this.scroller.updateScroll(), 50);
        }
    }

    remToPixels(rem) {
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return rem * rootFontSize;
    }
}

class Scroller {
    constructor() {
        this.mm = gsap.matchMedia();
        this.scrollWrapper = document.querySelector('.components-main-wrapper');
        this.scrollContainer = document.querySelector('.component-wrapper');
        this.init();
    }

    init() {
        this.initHorScroll();
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
        this.checkAnchorOnLoad();
    }

    updateScroll() {
        ScrollTrigger.refresh();
    }

    getScrollAmount() {
        this.scrollWidth = this.scrollContainer.scrollWidth;
        return -(this.scrollWidth - window.innerWidth);
    }

    initHorScroll() {
        this.mm.add('(min-width:768px)', () => {
            gsap.to(this.scrollContainer, {
                x: () => this.getScrollAmount(),
                duration: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: this.scrollWrapper,
                    pin: true,
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${this.getScrollAmount() * -1}`,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress * 100;
                        gsap.to('.scroll-indicator', { width: `${progress}%` });
                    }
                }
            });
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId).previousElementSibling;
        const mainSection = document.getElementById(sectionId);
        if (section) {
            const sectionOffset = section.offsetLeft - section.offsetWidth + window.innerWidth;
            if (window.innerWidth < 768) {
                gsap.to(window, {
                    scrollTo: mainSection.getBoundingClientRect().top - 64,
                    duration: 1
                });
            } else {
                gsap.to(window, {
                    scrollTo: sectionOffset,
                    duration: 1,
                    ease: "power2.out"
                });
            }

            const scrollWidth = this.scrollContainer.scrollWidth;
            const progress = (sectionOffset / (scrollWidth - window.innerWidth)) * 100;
            gsap.to('.scroll-indicator', { width: `${progress}%`, duration: 1 });
        }
    }

    checkAnchorOnLoad() {
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            this.scrollToSection(sectionId);
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

// Initialize the ArchiveManager
window.addEventListener('load', () => {
    new ArchiveManager();
});