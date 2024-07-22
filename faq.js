/*
import {gsap} from "gsap";
 */
const faqs = [...document.querySelectorAll(".sp-faq-content")];
const ans = [...document.querySelectorAll(".sp-faq-answer")];
const accordion = [...document.querySelectorAll(".accordion-vertical")];

let tl1 = gsap.timeline();
faqs.map((faq) => {
    faq.addEventListener("click", (e) => {
        let answer = faq.querySelector(".sp-faq-answer");
        let accord = faq.querySelector(".sp-faq-accordion svg");
        if (!faq.classList.contains("active")) {
            tl1.to(answer, {
                height: "auto"
            });
            tl1.to(
                accord,
                {
                    rotateZ: 180
                },
                "<"
            );
            faq.classList.add("active");
        } else {
            tl1.to(answer, {
                height: 0
            });
            tl1.to(
                accord,
                {
                    rotateZ: 0
                },
                "<"
            );
            faq.classList.remove("active");
        }
    });
});

