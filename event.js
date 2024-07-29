/*
import dayjs from 'dayjs'
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import Swiper from 'swiper/bundle';

 */

gsap.registerPlugin(ScrollTrigger);
let mm = gsap.matchMedia();

let url = 'https://afro-charities-events.vercel.app/api/events';

const wrapper = document.querySelector('.upcoming-events-wrapper');


const getEvents = async () => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const events = data.data.events;

        if(!events || events.length > 0){
            const eventsHtml = await Promise.all(events.map(async (event) => {
                const name = event.name.text;
                const imgSrc = event.logo.original.url;
                const eventUrl = event.url;
                const startDate = dayjs(event.start.utc).format('ddd D MMM YY');
                const summary = event.summary;

                const venueName = event.venue_name;

                return `
                <div class="upcoming-event-item">
                    <div class="upcoming-event-img"><img
                            class="no-width"
                            src="${imgSrc}"
                            loading="eager"
                            alt="${name}"></div>
                    <div class="upcoming-event-content">
                      <div class="upcoming-events-loc">
                        <div class="upcoming-event-date-wrapper">
                          <div class="event-icon">
                            <div class="embed w-embed">
                              <svg width="100%" height="100%" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.04688 6V20C3.04688 20.5304 3.25759 21.0391 3.63266 21.4142C4.00773 21.7893 4.51644 22 5.04688 22H19.0469C19.5773 22 20.086 21.7893 20.4611 21.4142C20.8362 21.0391 21.0469 20.5304 21.0469 20V6C21.0469 5.46957 20.8362 4.96086 20.4611 4.58579C20.086 4.21071 19.5773 4 19.0469 4H17.0469V2H15.0469V4H9.04688V2H7.04688V4H5.04688C4.51644 4 4.00773 4.21071 3.63266 4.58579C3.25759 4.96086 3.04688 5.46957 3.04688 6ZM19.0469 20H5.04688V8H19.0469V20Z"
                                      fill="currentColor"></path>
                              </svg>
                            </div>
                          </div>
                          <div>${startDate}</div>
                        </div>
                        <div class="upcoming-event-date-wrapper">
                          <div class="event-icon">
                            <div class="embed w-embed">
                              <svg width="100%" height="100%" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.0469 14C14.2529 14 16.0469 12.206 16.0469 10C16.0469 7.794 14.2529 6 12.0469 6C9.84094 6 8.04694 7.794 8.04694 10C8.04694 12.206 9.84094 14 12.0469 14ZM12.0469 8C13.1499 8 14.0469 8.897 14.0469 10C14.0469 11.103 13.1499 12 12.0469 12C10.9439 12 10.0469 11.103 10.0469 10C10.0469 8.897 10.9439 8 12.0469 8Z"
                                      fill="currentColor"></path>
                                <path d="M11.467 21.814C11.6362 21.9349 11.839 21.9998 12.047 21.9998C12.2549 21.9998 12.4577 21.9349 12.627 21.814C12.931 21.599 20.076 16.44 20.047 10C20.047 5.589 16.458 2 12.047 2C7.63596 2 4.04696 5.589 4.04696 9.995C4.01796 16.44 11.163 21.599 11.467 21.814ZM12.047 4C15.356 4 18.047 6.691 18.047 10.005C18.068 14.443 13.659 18.428 12.047 19.735C10.436 18.427 6.02596 14.441 6.04696 10C6.04696 6.691 8.73796 4 12.047 4Z"
                                      fill="currentColor"></path>
                              </svg>
                            </div>
                          </div>
                          <div>${venueName}</div>
                        </div>
                      </div>
                      <div class="upcoming-event-details"><h3>${name}</h3></div>
                      <p>${summary}</p><a href="${eventUrl}" class="pill-btn w-inline-block" target="_blank" aria-label="${summary}" aria-describedby="Learn More aboout ${name}">
                      <div>Learn more</div>
                      <div class="pill-btn-icon">
                        <div class="embed w-embed">
                          <svg width="100%" height="100%" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.44968 9.81678L10.4494 9.81678L10.4494 0.331654H0.964245V2.33135H7.03546L0.257138 9.10968L1.67135 10.5239L8.44968 3.74556L8.44968 9.81678Z"
                                  fill="currentColor"></path>
                          </svg>
                        </div>
                      </div>
                    </a></div>
                  </div>  
            `;
            }));

            wrapper.innerHTML = eventsHtml.join('');
            setTimeout(()=>{
                new Event()
            }, 500)
        }else{
            new Event()
        }
    } catch (e) {
        console.error('error', e);
    }
};

getEvents();

class Event {
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

const slidesToShow = window.innerHeight / remToPixels(8);
const slides = document.querySelectorAll('.swiper-slide');
if(slides.length < slidesToShow){
    gsap.set('.v-content-btn-wrapper', {display: 'none'})
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


