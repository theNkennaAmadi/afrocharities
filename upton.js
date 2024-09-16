/*
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {gsap} from "gsap";

 */
gsap.registerPlugin(ScrollTrigger);
class UptonManager {
    constructor() {
        this.mm = gsap.matchMedia();
        this.mx = gsap.matchMedia();
        this.namesWrappers = Array.from(document.querySelectorAll('.names-wrapper'));
        this.scroller = null;
        this.completedCount = 0;
        this.archiveItems = document.querySelectorAll('.archival-process-item');
        this.init();
    }

    init() {
        this.addEventListeners();
        this.initArchiveItems();
    }

    addEventListeners() {
        document.addEventListener('htmx:afterRequest', this.handleAfterRequest.bind(this));
    }

    handleAfterRequest(evt) {
        this.completedCount++;
        if (this.completedCount === this.namesWrappers.length) {
            this.removeAll().then(() => {
                setTimeout(() => {
                    this.activate();
                    this.formatCurrency();
                }, 1800);
            });
        }
    }

    removeAll() {
        return new Promise((resolve) => {
            const removals = this.namesWrappers.map(wrapper => {
                return new Promise((innerResolve) => {
                    if(wrapper.querySelector('.w-dyn-empty')){
                        wrapper.closest('.archival-process-item').remove();
                    }
                    innerResolve();
                });
            });

            Promise.all(removals).then(() => {
                resolve();
                this.updateArchiveProcessNumbers();
            });
        });
    }

    updateArchiveProcessNumbers() {
        document.querySelectorAll('.archive-process-num').forEach((num, index) => {
            num.textContent = String(index + 1).padStart(2, '0');
        });
    }

    activate() {
        this.scroller = new Scroller(this.mm);
        const momentsList = [...document.querySelectorAll('.moments-content-wrapper')];
        momentsList.forEach((list) => new MomentsList(list));
    }

    formatCurrency() {
        const numElements = document.querySelectorAll('.d-num');
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        numElements.forEach(element => {
            const number = parseFloat(element.textContent);
            if (!isNaN(number)) {
                element.textContent = formatter.format(number);
            }
        });
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
                width: '100%',
                duration: 0.5,
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
                duration: 0.5,
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
}

class Scroller {
    constructor(mm) {
        this.mm = mm;
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
            const scrollContainer = document.querySelector('.component-wrapper');
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

            const scrollWidth = scrollContainer.scrollWidth;
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

// Initialize the CommunityManager
let uptonManager;
window.addEventListener('load', () => {
   uptonManager = new UptonManager();
});



