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

        this.checkAnchorOnLoad();
    }


    getScrollAmount(){
        this.scrollWidth = this.scrollContainer.scrollWidth;
        return - (this.scrollWidth - window.innerWidth);
    }

    initHorScroll() {
        mm.add('(min-width:768px)', ()=>{
            this.scrollTriggerInstance = gsap.to(this.scrollContainer, {
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
                        console.log(progress)
                        gsap.to('.scroll-indicator', {width: `${progress}%`} )
                    }
                }
            });
        })
    }

    // Function to scroll to a specific section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId).previousElementSibling;
        const mainSection = document.getElementById(sectionId);
        let getPosition = getScrollLookup("[h-section]", {
            containerAnimation: this.scrollTriggerInstance,
            start: "left left",
        });
        if (section) {
            const scrollContainer = document.querySelector('.component-wrapper');
            const sectionOffset = section.offsetLeft - section.offsetWidth + window.innerWidth;
            //console.log(getPosition(`#${sectionId}`) - mainSection.offsetWidth)
            //console.log(section.offsetLeft - ((window.innerWidth*0.10)*2))

            const scrollWidth = scrollContainer.scrollWidth;
            const progress = (sectionOffset / (scrollWidth - window.innerWidth)) * 100;
            const amount = (scrollWidth-window.innerWidth - (mainSection.offsetWidth))*(progress/100)
            if(window.innerWidth < 768){
                gsap.to(window, {
                    scrollTo: mainSection.getBoundingClientRect().top - 64,
                    duration: 1
                })
            }else{
                gsap.to(window, {
                    scrollTo: amount,
                    duration: 1,
                    ease: "power2.out"
                })
            }

            // Update the scroll indicator

            console.log(progress, this.getScrollAmount(), this.getScrollAmount()*(progress/100))
            gsap.to('.scroll-indicator', {width: `${progress}%`, duration: 1});
        }
    }

    // Function to check for anchor links on page load
    checkAnchorOnLoad() {
        if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            this.scrollToSection(sectionId);
        }
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

        // Add touch event listeners for swiping
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.list.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.list.addEventListener('touchmove', this.onTouchMove.bind(this), false);
        this.list.addEventListener('touchend', this.onTouchEnd.bind(this), false);
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

    // New touch event handlers
    onTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }

    onTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
    }

    onTouchEnd() {
        if (this.touchStartX - this.touchEndX > 50) {
            // Swipe left, go to next card
            this.nextCard();
        } else if (this.touchEndX - this.touchStartX > 50) {
            // Swipe right, go to previous card
            this.prevCard();
        }
        // Reset values
        this.touchStartX = 0;
        this.touchEndX = 0;
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

function getScrollLookup(
    targets,
    { start, pinnedContainer, containerAnimation }
) {
    let triggers = gsap.utils.toArray(targets).map((el) =>
            ScrollTrigger.create({
                trigger: el,
                start: start || "top top",
                pinnedContainer: pinnedContainer,
                refreshPriority: -10,
                containerAnimation: containerAnimation,
            })
        ),
        st = containerAnimation && containerAnimation.scrollTrigger;
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

