/*
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {gsap} from "gsap";
import Swiper from "swiper";

 */
let mm = gsap.matchMedia();

gsap.registerPlugin(ScrollTrigger);

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


    getScrollAmount(){
        this.scrollWidth = this.scrollContainer.scrollWidth;
        return - (this.scrollWidth - window.innerWidth);
    }

    initHorScroll() {
        mm.add('(min-width:768px)', ()=>{
            gsap.to(this.scrollContainer, {
                x: this.getScrollAmount(),
                scrollTrigger: {
                    trigger: this.scrollWrapper,
                    pin: true,
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${this.getScrollAmount() *-1}`,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress * 100;
                        gsap.to('.scroll-indicator', {width: `${progress}%`} )
                    }
                }
            });
        })
    }
}


window.setTimeout(() => {
    new Scroller();
}, 1000);


class MomentsList {
    constructor(list) {
        this.list = list;
        this.items = list.querySelectorAll('.moments-item');
        this.itemDetails = list.querySelectorAll('.moments-details-item');
        this.prevBtn = list.querySelector('.h-content-btn.prev');
        this.nextBtn = list.querySelector('.h-content-btn.next');
        this.currentIndex = 0;


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
                duration: 0.2,
                zIndex: 5
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
                    duration: 0.5,
                    zIndex: 1
                });
                tl.fromTo(this.itemDetails[this.currentIndex], {
                    autoAlpha: 0.5,
                    z:'10rem',
                    yPercent: 100,
                    duration: 0.5,
                    zIndex: 1
                }, {
                    autoAlpha: 1,
                    z:'0rem',
                    yPercent: 0,
                    duration: 0.5,
                    zIndex: 5
                }, "<");
            }else{
                tl.to(this.itemDetails[index], {
                    visibility: 'hidden',
                    z:'10rem',
                    yPercent: 100,
                    duration: 0.3,
                    zIndex: 1,
                });
                tl.fromTo(this.itemDetails[this.currentIndex], {
                    autoAlpha: 0.5,
                    z:'-20rem',
                    yPercent: 100,
                    duration: 0.5,
                    zIndex: 1
                }, {
                    autoAlpha: 1,
                    z:'0rem',
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
}

const momentsList = [...document.querySelectorAll('.moments-content-wrapper')];
momentsList.forEach((list) => new MomentsList(list));

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


