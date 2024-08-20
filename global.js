/*
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger'

 */

gsap.registerPlugin(ScrollTrigger)
gsap.config({nullTargetWarn: false});


window.addEventListener('load', () => {
    const lottie = Webflow.require('lottie').lottie;
    const animations = lottie.getRegisteredAnimations();
    const menuAnimation = animations[0];

    let mm2 = gsap.matchMedia();

    class Nav{
        constructor(header) {
            this.header = header;
            this.navMenuBtn = this.header.querySelector('.nav-menu-btn');
            this.navList = this.header.querySelector('.nav-list');
            this.nav = this.header.querySelector('.nav');
            this.navLinks = [...this.navList.querySelectorAll('a')];
            this.navListItems = [...this.header.querySelectorAll('.nav-list-item')];
            this.navSubLinks = [...this.header.querySelectorAll('.nav-list-sub-link')];
            this.navHiddenContentWrapper = [...this.header.querySelectorAll('.h-c')];
            this.navExplorerLinks = [...this.header.querySelectorAll('.explorer-link')]
            this.navExplorerSubLinks = [...this.header.querySelectorAll('.explorer-sub-link')]
            this.init();
        }
        init(){
            this.showNav();
            this.setupLinkHoverEffect(this.navListItems);
            this.setupLinkHoverEffect(this.navSubLinks);
            this.setupLinkHoverEffect(this.navExplorerLinks);
            this.setupLinkHoverEffect(this.navExplorerSubLinks);
        }

        setupLinkHoverEffect(linkItems) {
            linkItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    gsap.to(linkItems.filter(link => link !== item), {
                        opacity: 0.5,
                        duration: 0.3
                    });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(linkItems, {
                        opacity: 1,
                        duration: 0.3
                    });
                });
            });
        }

        showNav(){
            this.navOpen = false;
            this.tlShowNav = gsap.timeline({paused: true});
            this.hiddenContent = this.navHiddenContentWrapper.map((content) => content.querySelector('*'));
            mm2.add('(min-width:768px)', ()=>{this.tlShowNav.to(this.nav, {borderRight: '2px solid currentColor', ease:"expo.out", duration: 0.2})})
            this.tlShowNav.to(this.navList, {clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',ease:"expo.out", duration: 1})
                .to(this.navMenuBtn.querySelector('.menu-text:nth-of-type(1)'), {opacity:0}, "<")
                .to(this.navMenuBtn.querySelector('.menu-text:nth-of-type(2)'), {opacity:1}, "<")
                .from(this.hiddenContent, {yPercent: 110, stagger: {amount: 0.6}}, "<0.5")
                .from('.embed.arrow', {yPercent: 150, duration:0.6},"<0.2")

            this.navMenuBtn.addEventListener('click', () => {
                if(document.querySelector('.menu-lottie')){
                    this.navOpen ? this.tlShowNav.reverse() : this.tlShowNav.play();
                    if (menuAnimation.isLoaded) {
                        this.navOpen? menuAnimation.playSegments([80, 0], true) : menuAnimation.playSegments([30, 80], true);
                    }else{
                        menuAnimation.addEventListener('DOMLoaded', ()=>{
                            this.navOpen? menuAnimation.playSegments([80, 0], true) : menuAnimation.playSegments([30, 80], true);
                        })
                    }
                    this.navOpen = !this.navOpen;
                }
            })

            this.navLinks.forEach((link) => {
                link.addEventListener('click', () => {
                    this.navOpen ? this.tlShowNav.reverse() : this.tlShowNav.play();
                    this.navOpen? menuAnimation.playSegments([80, 0], true) : menuAnimation.playSegments([30, 80], true);
                    this.navOpen = !this.navOpen;
                });
            });

        }
    }

    new Nav(document.querySelector('.header'));

    function initImageReveal() {
        const images = document.querySelectorAll('img');
        console.log(images);

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    gsap.to(img.parentElement, {
                        opacity: 1,
                        scale: 1,
                        duration: 2,
                        ease: 'power2.out'
                    });
                    observer.unobserve(img);
                }
            });
        }, observerOptions);

        images.forEach(img => {
            gsap.set(img.parentElement, { opacity: 0, scale: 0.94 });
            observer.observe(img);
        });
    }

    initImageReveal();




    //Disable right click
    document.addEventListener('contextmenu', event => event.preventDefault());

    gsap.to('.component-wrapper', {opacity: 1, duration: 1.5, delay: 0.3})

    const upNextLink = document.querySelector('.up-next-cta');
    if (!upNextLink){
        return
    }
    const tlUpNext = gsap.timeline({paused: true});
    tlUpNext.to(upNextLink.querySelector('.icon-2'), {x: '0rem', y: '0rem', duration: 0.5})
        .to(upNextLink.querySelector('.icon-1'), {x: '1rem', y: '1rem', duration: 0.5}, "<")


    upNextLink.addEventListener('mouseenter', () => {
        tlUpNext.play();
    });
    upNextLink.addEventListener('mouseleave', () => {
        tlUpNext.reverse();
    });



});



