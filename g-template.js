
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
        this.checkAnchorOnLoad();
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

    // Function to scroll to a specific section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId).previousElementSibling;
        const mainSection = document.getElementById(sectionId);
        if (section) {
            const scrollContainer = document.querySelector('.component-wrapper');
            const sectionOffset = section.offsetLeft - section.offsetWidth + window.innerWidth;
            if(window.innerWidth < 768){
                gsap.to(window, {
                    scrollTo: mainSection.getBoundingClientRect().top - 64,
                    duration: 1
                })
            }else{
                gsap.to(window, {
                    scrollTo: sectionOffset,
                    duration: 1,
                    ease: "power2.out"
                })
            }

            // Update the scroll indicator
            const scrollWidth = scrollContainer.scrollWidth;
            const progress = (sectionOffset / (scrollWidth - window.innerWidth)) * 100;
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



// Example usage
new Archive();
