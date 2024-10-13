/*
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

 */

let mm = gsap.matchMedia();

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

class Scroller {
    constructor() {
        this.scrollWrapper = document.querySelector('.components-main-wrapper');
        this.scrollContainer = document.querySelector('.component-wrapper');
        this.mm = gsap.matchMedia();

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

        this.setInitialPositions();
        this.nextBtn.addEventListener('click', this.nextCard.bind(this));
        this.prevBtn.addEventListener('click', this.prevCard.bind(this));

        // Add touch event listeners for swiping
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.items.forEach( item => {
            item.addEventListener('touchstart', this.onTouchStart.bind(this), false);
             item.addEventListener('touchmove', this.onTouchMove.bind(this), false);
            item.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        })
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

window.addEventListener("load", () => {
    new Scroller();
    const momentsList = [...document.querySelectorAll('.moments-content-wrapper')];
    momentsList.forEach((list) => new MomentsList(list));
})


/*
Returns a FUNCTION that you can feed an element to get its scroll position.
- targets: selector text, element, or Array of elements
- config: an object with any of the following optional properties:
- start: defaults to "top top" but can be anything like "center center", "100px 80%", etc. Same format as "start" and "end" ScrollTrigger values.
- containerAnimation: the horizontal scrolling tween/timeline. Must have an ease of "none"/"linear".
- pinnedContainer: if you're pinning a container of the element(s), you must define it so that ScrollTrigger can make the proper accommodations.
*/
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