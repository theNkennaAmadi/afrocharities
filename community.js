/*
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {gsap} from "gsap";
import Swiper from "swiper";

 */
// Initialize the CommunityManager
let communityManager;

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

    getScrollLookup(targets, { start, pinnedContainer, containerAnimation }) {
        let triggers = gsap.utils.toArray(targets).map((el) =>
            ScrollTrigger.create({
                trigger: el,
                start: start || "top top",
                pinnedContainer: pinnedContainer,
                refreshPriority: -10,
                containerAnimation: containerAnimation,
            })
        );
        let st = containerAnimation && containerAnimation.scrollTrigger;
        return (target) => {
            let t = gsap.utils.toArray(target)[0],
                i = triggers.length;
            while (i-- && triggers[i].trigger !== t) {}
            if (i < 0) {
                return console.warn("target not found", target);
            }
            return containerAnimation
                ? st.start +
                (triggers[i].start / containerAnimation.duration()) *
                (st.end - st.start)
                : triggers[i].start;
        };
    }
}

class Scroller {
    constructor(mm) {
        this.mm = mm;
        this.scrollWrapper = document.querySelector('.components-main-wrapper');
        this.scrollContainer = document.querySelector('.component-wrapper');
        this.scrollTriggerInstance = null;
        this.init();
    }

    init() {
        this.initHorScroll();
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
        this.checkAnchorOnLoad();
    }

    getScrollAmount() {
        this.scrollWidth = this.scrollContainer.scrollWidth;
        return -(this.scrollWidth - window.innerWidth);
    }

    initHorScroll() {
        this.mm.add('(min-width:768px)', () => {
            this.scrollTriggerInstance = gsap.to(this.scrollContainer, {
                x: this.getScrollAmount(),
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
        let getPosition = communityManager.getScrollLookup("[h-section]", {
            containerAnimation: this.scrollTriggerInstance,
            start: "left left",
        });
        if (section) {
            const scrollContainer = document.querySelector('.component-wrapper');
            const sectionOffset = section.offsetLeft - section.offsetWidth + window.innerWidth;
            const scrollWidth = scrollContainer.scrollWidth;
            const progress = (sectionOffset / (scrollWidth - window.innerWidth)) * 100;
            const amount = (scrollWidth - window.innerWidth - mainSection.offsetWidth) * (progress / 100);
            if (window.innerWidth < 768) {
                gsap.to(window, {
                    scrollTo: mainSection.getBoundingClientRect().top - 64,
                    duration: 1
                });
            } else {
                gsap.to(window, {
                    scrollTo: amount,
                    duration: 1,
                    ease: "power2.out"
                });
            }
           // console.log(progress, this.getScrollAmount(), this.getScrollAmount() * (progress / 100));
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


window.addEventListener('load', () => {
    communityManager = new CommunityManager();
});