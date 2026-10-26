/*
import dayjs from 'dayjs'
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Swiper from 'swiper/bundle';

 */

gsap.registerPlugin(ScrollTrigger);
class ProgramManager {
    constructor() {
        this.mm = gsap.matchMedia();
        this.wrapper = document.querySelector('.upcoming-events-wrapper');
        this.scrollWrapper = document.querySelector('.components-main-wrapper');
        this.scrollContainer = document.querySelector('.component-wrapper');
        this.swiper = null;
        this.init();
    }

    async init() {
        await this.getEvents();
        this.initScrollTrigger();
        this.initSwiper();
        this.addEventListeners();
        this.checkAnchorOnLoad();
    }

    // Upcoming events come from the Webflow CMS via window.AfroEvents (global.js), replacing the Eventbrite feed
    async getEvents() {
        if (!window.AfroEvents) return;
        try {
            await window.AfroEvents.renderUpcoming(this.wrapper);
        } catch (e) {
            console.error('Error loading events:', e);
        }
    }

    getScrollAmount() {
        const scrollWidth = this.scrollContainer.scrollWidth;
        return -(scrollWidth - window.innerWidth);
    }

    initScrollTrigger() {
        this.mm.add('(min-width:768px)', () => {
            gsap.to(this.scrollContainer, {
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

    initSwiper() {
        const slidesToShow = window.innerHeight / this.remToPixels(4);
        const slides = document.querySelectorAll('.swiper-slide');
        if (slides.length < slidesToShow) {
            gsap.set('.v-content-btn-wrapper', { display: 'none' });
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

    addEventListeners() {
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
    }
}

// Initialize the ProgramManager
window.addEventListener('load', () =>{
    new ProgramManager();
})