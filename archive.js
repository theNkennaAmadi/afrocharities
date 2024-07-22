/*
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {gsap} from "gsap";
import Swiper from "swiper";

 */
let mm = gsap.matchMedia();
let mx = gsap.matchMedia();

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.normalizeScroll(true);

const slidesToShow = window.innerHeight / remToPixels(4);
const slides = document.querySelectorAll('.swiper-slide');
if(slides.length < slidesToShow){
    gsap.set('.v-content-btn', {opacity: 0})
}


const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'vertical',
    loop: true,
    autoHeight: true,
    slidesPerView: "auto",
    // Navigation arrows
    navigation: {
        nextEl: '.v-content-btn.next',
        prevEl: '.v-content-btn.prev',
    },

});

function remToPixels(rem) {
    // Get the root font size
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    // Convert rem to pixels
    return rem * rootFontSize;
}

class Scroller {
    constructor() {
        this.scrollWrapper = document.querySelector('.components-main-wrapper');
        this.scrollContainer = document.querySelector('.component-wrapper');
        this.init();
    }

    init() {
        //this.calculateScrollValues();
        this.initHorScroll();

        // Listen for resize events
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
    }

    updateScroll() {
        ScrollTrigger.refresh()
    }

    getScrollAmount(){
        this.scrollWidth = this.scrollContainer.scrollWidth;
        return - (this.scrollWidth - window.innerWidth);
    }

    initHorScroll() {
        mm.add('(min-width:768px)', () => {
            this.scrollTrigger = ScrollTrigger.create({
                animation: gsap.to(this.scrollContainer, {
                    x: () => this.getScrollAmount(),
                    duration: 1,
                    ease: "none"
                }),
                trigger: this.scrollWrapper,
                pin: true,
                scrub: 1,
                start: 'top top',
                end: () => `+=${this.getScrollAmount() * -1}`,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const progress = self.progress * 100;
                    gsap.to('.scroll-indicator', {width: `${progress}%`} )
                }
            });
        });
    }
}

let scroller;

window.setTimeout(() => {
    scroller = new Scroller();
}, 1000);



class MomentsList {
    constructor(list) {
        this.list = list;
        this.items = list.querySelectorAll('.moments-item');
        this.itemDetails = list.querySelectorAll('.moments-details-item');
        this.prevBtn = list.querySelector('.h-content-btn.prev');
        this.nextBtn = list.querySelector('.h-content-btn.next');
        this.currentIndex = 0;

        gsap.set(this.itemDetails, {opacity: 0, visibility: 'hidden'})

        //console.log(this.nextBtn)

        this.setInitialPositions();
        this.nextBtn.addEventListener('click', this.nextCard.bind(this));
        this.prevBtn.addEventListener('click', this.prevCard.bind(this));
    }

    setInitialPositions() {
        this.items.forEach((item, index) => {
            let rotation = 0;
            if (index !== 0) {
                rotation = (index % 2 === 0) ? 5 : -5;
            }
            gsap.set(item, {
                rotation: rotation,
                zIndex: this.items.length - index,
            });
            gsap.to(this.itemDetails[this.currentIndex], {
                autoAlpha: 1,
                duration: 0.2
            });
        });
    }

    updateCards(type) {
        this.items.forEach((item, index) => {
            let offset = (index - this.currentIndex + this.items.length) % this.items.length;
            let rotation = 0;
            if (offset !== 0) {
                rotation = (offset % 2 === 0) ? 5 : -5;
            }
            gsap.to(item, {
                rotation: rotation,
                zIndex: this.items.length - offset,
                duration: 0.5,
                ease: "power2.out"
            });
            let tl = gsap.timeline();
            if(type === 'next') {
                tl.to(this.itemDetails[index], {
                    visibility: 'hidden',
                    z:'-20rem',
                    yPercent: 50,
                    duration: 0.5
                });
                tl.fromTo(this.itemDetails[this.currentIndex], {
                    autoAlpha: 0.5,
                    z:'10rem',
                    yPercent: 100,
                    duration: 0.5
                }, {
                    autoAlpha: 1,
                    z:'0rem',
                    yPercent: 0,
                    duration: 0.5
                }, "<");
            }else{
                tl.to(this.itemDetails[index], {
                    visibility: 'hidden',
                    z:'10rem',
                    yPercent: 100,
                    duration: 0.3
                });
                tl.fromTo(this.itemDetails[this.currentIndex], {
                    autoAlpha: 0.5,
                    z:'-20rem',
                    yPercent: 100,
                    duration: 0.5
                }, {
                    autoAlpha: 1,
                    z:'0rem',
                    yPercent: 0,
                    duration: 0.5
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
}

const momentsList = [...document.querySelectorAll('.moments-content-wrapper')];
momentsList.forEach((list) => new MomentsList(list));


const archiveItems = document.querySelectorAll('.archival-process-item');

archiveItems.forEach((item, index) => {
    let isExpanded = false;

    item.addEventListener('click', () => {
        const content = item.querySelector('.archive-process-content');
        const otherContents = Array.from(archiveItems)
            .filter(otherItem => otherItem !== item)
            .map(otherItem => otherItem.querySelector('.archive-process-content'));

        if (isExpanded) {
            // If already expanded, close this item
            mx.add('(min-width:768px)', () => {
                gsap.to(content, {
                    width: '0rem',
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                       // if (scroller) scroller.updateScroll()
                    }
                });
            })

            mx.add('(max-width:767px)', () => {
                gsap.to(content, {
                    height: '0rem',
                    duration: 0.5,
                    ease: "power2.out",
                });
            })

            isExpanded = false;
        } else {
            mx.add('(min-width:768px)', () => {
                // Close all other items
                gsap.to(otherContents, {
                    width: '0rem',
                    duration: 0.5,
                    ease: "power2.out"
                });

                // Open this item
                gsap.to(content, {
                    width: '36rem',
                    duration: 1,
                    ease: "power2.out",
                    onComplete: () => {
                       // if (scroller) scroller.updateScroll()
                    }
                });
            })
            mx.add('(max-width:767px)', () => {
                // Close all other items
                gsap.to(otherContents, {
                    height: '0rem',
                    duration: 0.5,
                    ease: "power2.out"
                });

                // Open this item
                gsap.to(content, {
                    height: 'auto',
                    duration: 1,
                    ease: "power2.out",
                });
            })

            isExpanded = true;
        }
    });
});


