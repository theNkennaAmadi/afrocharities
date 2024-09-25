/*
import {gsap} from "gsap";
import dayjs from 'dayjs'
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Swiper from 'swiper/bundle';
 */

const mmMain = gsap.matchMedia();
const mm = gsap.matchMedia();

// EventManager.js
class EventManager {
    constructor(url, wrapper) {
        this.url = url;
        this.wrapper = wrapper;
    }

    async fetchEvents() {
        try {
            const response = await fetch(this.url);
            const data = await response.json();
            return data.data.events;
        } catch (e) {
            console.error('Error fetching events:', e);
            return [];
        }
    }

    async renderEvents() {
        const events = await this.fetchEvents();
        if (events && events.length > 0) {
            const eventsHtml = events.map(this.createEventHtml).join('');
            this.wrapper.innerHTML = eventsHtml;
            setTimeout(() => new Scroller(), 1000);
        } else {
            new Scroller();
        }
    }

    createEventHtml(event) {
        const { name, logo, url, start, summary, venue_name } = event;
        const startDate = dayjs(start.utc).format('ddd D MMM YY');

        return `
            <div class="upcoming-event-item">
                <div class="upcoming-event-img">
                    <img src="${logo.original.url}" loading="eager" alt="${name.text}">
                </div>
                <div class="upcoming-event-content">
                    <div class="upcoming-events-loc">
                        <div class="upcoming-event-date-wrapper">
                            <div class="event-icon">
                                <svg width="100%" height="100%" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.04688 6V20C3.04688 20.5304 3.25759 21.0391 3.63266 21.4142C4.00773 21.7893 4.51644 22 5.04688 22H19.0469C19.5773 22 20.086 21.7893 20.4611 21.4142C20.8362 21.0391 21.0469 20.5304 21.0469 20V6C21.0469 5.46957 20.8362 4.96086 20.4611 4.58579C20.086 4.21071 19.5773 4 19.0469 4H17.0469V2H15.0469V4H9.04688V2H7.04688V4H5.04688C4.51644 4 4.00773 4.21071 3.63266 4.58579C3.25759 4.96086 3.04688 5.46957 3.04688 6ZM19.0469 20H5.04688V8H19.0469V20Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div>${startDate}</div>
                        </div>
                        <div class="upcoming-event-date-wrapper">
                            <div class="event-icon">
                                <svg width="100%" height="100%" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.0469 14C14.2529 14 16.0469 12.206 16.0469 10C16.0469 7.794 14.2529 6 12.0469 6C9.84094 6 8.04694 7.794 8.04694 10C8.04694 12.206 9.84094 14 12.0469 14ZM12.0469 8C13.1499 8 14.0469 8.897 14.0469 10C14.0469 11.103 13.1499 12 12.0469 12C10.9439 12 10.0469 11.103 10.0469 10C10.0469 8.897 10.9439 8 12.0469 8Z" fill="currentColor"/>
                                    <path d="M11.467 21.814C11.6362 21.9349 11.839 21.9998 12.047 21.9998C12.2549 21.9998 12.4577 21.9349 12.627 21.814C12.931 21.599 20.076 16.44 20.047 10C20.047 5.589 16.458 2 12.047 2C7.63596 2 4.04696 5.589 4.04696 9.995C4.01796 16.44 11.163 21.599 11.467 21.814ZM12.047 4C15.356 4 18.047 6.691 18.047 10.005C18.068 14.443 13.659 18.428 12.047 19.735C10.436 18.427 6.02596 14.441 6.04696 10C6.04696 6.691 8.73796 4 12.047 4Z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div>${venue_name}</div>
                        </div>
                    </div>
                    <div class="upcoming-event-details">
                        <h3>${name.text}</h3>
                    </div>
                    <p>${summary}</p>
                    <a href="${url}" class="pill-btn w-inline-block" target="_blank">
                        <div>RSVP Now</div>
                        <div class="pill-btn-icon">
                            <svg width="100%" height="100%" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.44968 9.81678L10.4494 9.81678L10.4494 0.331654H0.964245V2.33135H7.03546L0.257138 9.10968L1.67135 10.5239L8.44968 3.74556L8.44968 9.81678Z" fill="currentColor"/>
                            </svg>
                        </div>
                    </a>
                </div>
            </div>
        `;
    }
}

// Scroller.js
class Scroller {
    constructor() {
        this.contentWrapper = document.querySelector(".content-wrapper");
        this.contentBlocks = [...document.querySelectorAll(".content-block")];
        this.contentGrids = this.contentBlocks.map(block => block.querySelector(".content-grid"));
        this.blockScrollPositions = [];
        this.init();
    }

    init() {
        this.initScroll();
        this.initResize();
        this.initClickScroll();
    }

    initResize() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        mmMain.add("(min-width: 768px)", () => {
            gsap.set('.content-block', {
                x: (index) => index > 0 ? window.innerWidth - (this.convertPixels(2) * (this.contentGrids.length - index)) : 0,
            });
        });
        ScrollTrigger.refresh();
    }

    initClickScroll() {
        this.contentBlocks.forEach((block, index) => {
            block.querySelector('.content-block-identifier').addEventListener('click', () => this.scrollToBlock(index));
        });
    }

    scrollToBlock(index) {
        if (this.blockScrollPositions && this.blockScrollPositions[index] !== undefined) {
            gsap.to(window, {
                scrollTo: this.blockScrollPositions[index],
                duration: 1,
                ease: "power2.inOut"
            });
        }
    }

    initScroll() {
        const getTotalWidth = () => {
            return this.contentBlocks.reduce((acc, block) => acc + block.offsetWidth, 0);
        };

        let timeline;
        mmMain.add("(min-width: 768px)", () => {
            timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: this.contentWrapper,
                    start: "top top",
                    end: () => `+=${getTotalWidth()}`,
                    scrub: true,
                    pin: true,
                    invalidateOnRefresh: true,
                },
            });

            this.contentBlocks.forEach((block, index) => {
                const grid = this.contentGrids[index];

                if (grid) {
                    // Add label for each block
                    timeline.add(`block${index}`);

                    const getGridWidth = () => {
                        return index === this.contentGrids.length - 1
                            ? grid.scrollWidth - window.innerWidth + window.innerWidth * 0.15
                            : grid.scrollWidth;
                    };
                    let gridProgress = { value: 0 };

                    timeline.to(
                        grid,
                        {
                            x: -getGridWidth(),
                            duration:
                                (getGridWidth() +
                                    this.convertPixels(
                                        (this.contentGrids.length - index + 1) * 1
                                    )) /
                                getTotalWidth(),
                            ease: "none",
                            onUpdate: () => {
                                gridProgress.value = gsap.getProperty(grid, "x") / -getGridWidth();
                                const totalProgress =
                                    index < this.contentGrids.length - 1
                                        ? Math.min(1, Math.max(0, gridProgress.value))
                                        : Math.min(1, Math.max(0, gridProgress.value)) * 0.85;
                                gsap.set(
                                    grid.parentElement.querySelector(".scroll-indicator"),
                                    { width: `${totalProgress * 100}%` }
                                );
                            },
                        },
                        index > 0 ? `-=${(window.innerWidth / getTotalWidth()) * 0.05}` : 0
                    );

                    if (index < this.contentBlocks.length - 1) {
                        timeline.to(
                            this.contentBlocks[index + 1],
                            {
                                x:
                                    this.convertPixels(5) +
                                    this.convertPixels((index + 1) * 2),
                                duration:
                                    (window.innerWidth - this.convertPixels(9.5)) /
                                    getTotalWidth(),
                                ease: "none",
                            },
                            `-=${
                                (window.innerWidth -
                                    this.convertPixels(
                                        (this.contentBlocks.length - index + 1) * 2
                                    )) /
                                getTotalWidth()
                            }`
                        );
                    }
                }
            });

            // Calculate scroll positions for each block after timeline is set up
            ScrollTrigger.addEventListener('refresh', () => {
                let scrollTriggerInstance = timeline.scrollTrigger;
                this.blockScrollPositions = this.contentBlocks.map((block, index) => {
                    let label = `block${index}`;
                    let labelTime = timeline.labels[label];
                    let scrollPosition =
                        scrollTriggerInstance.start +
                        (labelTime / timeline.duration()) *
                        (scrollTriggerInstance.end - scrollTriggerInstance.start);
                    return scrollPosition;
                });
            });

            // Ensure ScrollTrigger calculations are up to date
            ScrollTrigger.refresh();
        });
    }

    convertPixels(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
}


// MomentsList.js
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

// MarqueeManager.js
class MarqueeManager {
    constructor() {
        this.marquee1 = document.querySelector('.home-intro-cc-list.is-1');
        this.marquee2 = document.querySelector('.home-intro-cc-list.is-2');
        this.modalItems = [...document.querySelectorAll('.home-modal-item')];
        this.modalWrapper = document.querySelector('.home-modal-wrapper');
        this.modalCloseWrapper = document.querySelector('.home-modal-close-wrapper');
        this.isModalOpen = false;
        this.loop1 = null;
        this.loop2 = null;

        this.init();
    }

    init() {
        this.setupMediaQueries();
        this.addEventListeners();
    }

    setupMediaQueries() {
        mm.add("(min-width: 768px)", () => {
            window.addEventListener('load', () => {
                this.loop1 = this.setupVerticalLoop(this.marquee1);
                this.loop2 = this.setupVerticalLoop(this.marquee2, true);
            });
            return () => {
                this.loop1?.kill();
                this.loop2?.kill();
            };
        });

        mm.add("(max-width: 767px)", () => {
            this.loop1 = this.setupHorizontalLoop(this.marquee1);
            this.loop2 = this.setupHorizontalLoop(this.marquee2, true);
            return () => {
                this.loop1?.kill();
                this.loop2?.kill();
            };
        });
    }

    addEventListeners() {
        this.modalCloseWrapper.addEventListener('click', this.handleModalClose.bind(this));
    }

    setupVerticalLoop(marquee, reverse = false) {
        const items = [...marquee.querySelectorAll('.home-intro-cc-item')];
        const loop = verticalLoop(items, {
            paused: false,
            repeat: -1,
            speed: 0.5,
            reversed: reverse
        });

        this.setupMarqueeListeners(marquee, loop);
        return loop;
    }

    setupHorizontalLoop(marquee, reverse = false) {
        const items = [...marquee.querySelectorAll('.home-intro-cc-item')];
        const loop = horizontalLoop(items, {
            paused: false,
            repeat: -1,
            speed: 0.4,
            reversed: reverse
        });

        this.setupMarqueeListeners(marquee, loop);
        return loop;
    }

    setupMarqueeListeners(marquee, loop) {
        marquee.addEventListener('click', (e) => this.handleMarqueeItemClick(e, loop));
        marquee.addEventListener('mouseover', () => this.pauseMarquee(loop));
        marquee.addEventListener('mouseout', () => this.resumeMarquee(loop));
    }

    handleMarqueeItemClick(e, loop) {
        const clickedItem = e.target.closest('.home-intro-cc-item');
        if (!clickedItem) return;

        this.isModalOpen = true;

        // Stop the marquee
        this.loop1.pause();
        this.loop2.pause();

        // Disable scrolling
        document.body.style.overflow = 'hidden';

        // Show modal wrapper
        gsap.set(this.modalWrapper, { display: 'flex' });

        // Get data-slug and show corresponding modal item
        const slug = clickedItem.getAttribute('data-slug');
        const correspondingModalItem = this.modalItems.find(item => item.getAttribute('data-slug') === slug);
        if (correspondingModalItem) {
            gsap.to(correspondingModalItem, { opacity: 1, duration: 0.3 });
        }
    }

    handleModalClose() {
        this.isModalOpen = false;

        // Hide all modal items
        gsap.to(this.modalItems, { opacity: 0, duration: 0.3 });

        // Hide modal wrapper
        gsap.set(this.modalWrapper, { display: 'none' });

        // Re-enable scrolling
        document.body.style.overflow = '';

        // Resume both marquees
        this.loop1.resume();
        this.loop2.resume();
    }

    pauseMarquee(marqueeLoop) {
        if (!this.isModalOpen) {
            marqueeLoop.pause();
        }
    }

    resumeMarquee(marqueeLoop) {
        if (!this.isModalOpen) {
            marqueeLoop.resume();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const eventManager = new EventManager('https://afro-charities-events.vercel.app/api/events', document.querySelector('.upcoming-events-wrapper'));
    eventManager.renderEvents();

    const momentsLists = [...document.querySelectorAll('.moments-content-wrapper')];
    momentsLists.forEach(list => new MomentsList(list));

   new MarqueeManager();
});
/*
This helper function makes a group of elements animate along the y-axis in a seamless, responsive loop.

Features:
 - Uses yPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
 - When each item animates up or down enough, it will loop back to the other side
 - Optionally pass in a config object with values like draggable: true, center: true, speed (default: 1, which travels at roughly 100 pixels per second), paused (boolean), repeat, reversed, and paddingBottom.
 - The returned timeline will have the following methods added to it:
   - next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
   - previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
   - toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
   - current() - returns the current index (if an animation is in-progress, it reflects the final index)
   - times - an Array of the times on the timeline where each element hits the "starting" spot.
   - elements - an Array of the elements that are being controlled by the timeline
 */
function verticalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let onChange = config.onChange,
        lastIndex = 0,
        tl = gsap.timeline({repeat: config.repeat, onUpdate: onChange && function() {
                let i = tl.closestIndex()
                if (lastIndex !== i) {
                    lastIndex = i;
                    onChange(items[i], i);
                }
            }, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
        length = items.length,
        startY = items[0].offsetTop,
        times = [],
        heights = [],
        spaceBefore = [],
        yPercents = [],
        curIndex = 0,
        center = config.center,
        clone = obj => {
            let result = {}, p;
            for (p in obj) {
                result[p] = obj[p];
            }
            return result;
        },
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
        timeOffset = 0,
        container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
        totalHeight,
        getTotalHeight = () => items[length-1].offsetTop + yPercents[length-1] / 100 * heights[length-1] - startY + spaceBefore[0] + items[length-1].offsetHeight * gsap.getProperty(items[length-1], "scaleY") + (parseFloat(config.paddingBottom) || 0),
        populateHeights = () => {
            let b1 = container.getBoundingClientRect(), b2;
            items.forEach((el, i) => {
                heights[i] = parseFloat(gsap.getProperty(el, "height", "px"));
                yPercents[i] = snap(parseFloat(gsap.getProperty(el, "y", "px")) / heights[i] * 100 + gsap.getProperty(el, "yPercent"));
                b2 = el.getBoundingClientRect();
                spaceBefore[i] = b2.top - (i ? b1.bottom : b1.top);
                b1 = b2;
            });
            gsap.set(items, { // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
                yPercent: i => yPercents[i]
            });
            totalHeight = getTotalHeight();
        },
        timeWrap,
        populateOffsets = () => {
            timeOffset = center ? tl.duration() * (container.offsetWidth / 2) / totalHeight : 0;
            center && times.forEach((t, i) => {
                times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * heights[i] / 2 / totalHeight - timeOffset);
            });
        },
        getClosest = (values, value, wrap) => {
            let i = values.length,
                closest = 1e10,
                index = 0, d;
            while (i--) {
                d = Math.abs(values[i] - value);
                if (d > wrap / 2) {
                    d = wrap - d;
                }
                if (d < closest) {
                    closest = d;
                    index = i;
                }
            }
            return index;
        },
        populateTimeline = () => {
            let i, item, curY, distanceToStart, distanceToLoop;
            tl.clear();
            for (i = 0; i < length; i++) {
                item = items[i];
                curY = yPercents[i] / 100 * heights[i];
                distanceToStart = item.offsetTop + curY - startY + spaceBefore[0];
                distanceToLoop = distanceToStart + heights[i] * gsap.getProperty(item, "scaleY");
                tl.to(item, {yPercent: snap((curY - distanceToLoop) / heights[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
                    .fromTo(item, {yPercent: snap((curY - distanceToLoop + totalHeight) / heights[i] * 100)}, {yPercent: yPercents[i], duration: (curY - distanceToLoop + totalHeight - curY) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
                    .add("label" + i, distanceToStart / pixelsPerSecond);
                times[i] = distanceToStart / pixelsPerSecond;
            }
            timeWrap = gsap.utils.wrap(0, tl.duration());
        },
        refresh = (deep) => {
            let progress = tl.progress();
            tl.progress(0, true);
            populateHeights();
            deep && populateTimeline();
            populateOffsets();
            deep && tl.draggable ? tl.time(times[curIndex], true) : tl.progress(progress, true);
        },
        proxy;
    gsap.set(items, {y: 0});
    populateHeights();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", () => refresh(true));
    function toIndex(index, vars) {
        vars = clone(vars);
        (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); // always go in the shortest direction
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (time > tl.time() !== index > curIndex) { // if we're wrapping the timeline's playhead, make the proper adjustments
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        if (vars.revolutions) {
            time += tl.duration() * Math.round(vars.revolutions);
            delete vars.revolutions;
        }
        if (time < 0 || time > tl.duration()) {
            vars.modifiers = {time: timeWrap};
        }
        curIndex = newIndex;
        vars.overwrite = true;
        gsap.killTweensOf(proxy);
        return tl.tweenTo(time, vars);
    }
    tl.elements = items;
    tl.next = vars => toIndex(curIndex+1, vars);
    tl.previous = vars => toIndex(curIndex-1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = setCurrent => {
        let index = getClosest(times, tl.time(), tl.duration());
        setCurrent && (curIndex = index);
        return index;
    };
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
    }
    if (config.draggable && typeof(Draggable) === "function") {
        proxy = document.createElement("div")
        let wrap = gsap.utils.wrap(0, 1),
            ratio, startProgress, draggable, dragSnap,
            align = () => tl.progress(wrap(startProgress + (draggable.startY - draggable.y) * ratio)),
            syncIndex = () => tl.closestIndex(true);
        typeof(InertiaPlugin) === "undefined" && console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");
        draggable = Draggable.create(proxy, {
            trigger: items[0].parentNode,
            type: "y",
            onPressInit() {
                gsap.killTweensOf(tl);
                startProgress = tl.progress();
                refresh();
                ratio = 1 / totalHeight;
                gsap.set(proxy, {y: startProgress / -ratio})
            },
            onDrag: align,
            onThrowUpdate: align,
            inertia: true,
            snap: value => {
                let time = -(value * ratio) * tl.duration(),
                    wrappedTime = timeWrap(time),
                    snapTime = times[getClosest(times, wrappedTime, tl.duration())],
                    dif = snapTime - wrappedTime;
                Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration());
                return (time + dif) / tl.duration() / -ratio;
            },
            onRelease: syncIndex,
            onThrowComplete: syncIndex
        })[0];
        tl.draggable = draggable;
    }
    tl.closestIndex(true);
    onChange && onChange(items[curIndex], curIndex);
    return tl;
}


function horizontalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
        length = items.length,
        startX = items[0].offsetLeft,
        times = [],
        widths = [],
        xPercents = [],
        curIndex = 0,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
        totalWidth, curX, distanceToStart, distanceToLoop, item, i;
    gsap.set(items, { // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
        xPercent: (i, el) => {
            let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
            xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / w * 100 + gsap.getProperty(el, "xPercent"));
            return xPercents[i];
        }
    });
    gsap.set(items, {x: 0});
    totalWidth = items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0);
    for (i = 0; i < length; i++) {
        item = items[i];
        curX = xPercents[i] / 100 * widths[i];
        distanceToStart = item.offsetLeft + curX - startX;
        distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
        tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
            .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
    }
    function toIndex(index, vars) {
        vars = vars || {};
        (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); // always go in the shortest direction
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (time > tl.time() !== index > curIndex) { // if we're wrapping the timeline's playhead, make the proper adjustments
            vars.modifiers = {time: gsap.utils.wrap(0, tl.duration())};
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        curIndex = newIndex;
        vars.overwrite = true;
        return tl.tweenTo(time, vars);
    }
    tl.next = vars => toIndex(curIndex+1, vars);
    tl.previous = vars => toIndex(curIndex-1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
    }
    return tl;
}
