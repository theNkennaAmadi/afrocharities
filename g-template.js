
class Archive {
    constructor() {
        this.nextLinksContainer = document.querySelectorAll('.next-link');
        this.links = Array.from(this.nextLinksContainer).map(link => link.getAttribute('href'));
        this.nextLink = document.querySelector('.nav-prog-btn.next')
        this.prevLink = document.querySelector('.nav-prog-btn.prev')
        this.navProBtn =[...document.querySelectorAll('.nav-prog-btn')]
        this.init();
    }

    init(){
        this.setUpNextPrev();
        this.navigationAnimation();
    }

    findAdjacentLinks(url, links) {
        const index = links.indexOf(url);

        if (index === -1) {
            return { previous: null, next: null };
        }

        const previous = index === 0 ? links[links.length - 1] : links[index - 1];
        const next = index === links.length - 1 ? links[0] : links[index + 1];

        return { previous, next };
    }

    setUpNextPrev(){
        const result = this.findAdjacentLinks(window.location.pathname, this.links);
        this.nextLink.href = result.next
        this.prevLink.href = result.previous
    }

    navigationAnimation(){
        this.navProBtn.forEach(btn => {
            const tlNavigation = gsap.timeline({paused: true});
            tlNavigation.to(btn.querySelector('.icon-2'), {x: '0rem', y: '0rem', duration: 0.5})
                .to(btn.querySelector('.icon-1'), {x: '1rem', y: '1rem', duration: 0.5}, "<")
                .to(this.navProBtn.filter(link => link !== btn), {opacity: 0.5, duration: 0.3}, "<")


            btn.addEventListener('mouseenter', () => {
                tlNavigation.play();
            });
            btn.addEventListener('mouseleave', () => {
                tlNavigation.reverse();
            });
        });
    }
}



// Example usage
new Archive();
