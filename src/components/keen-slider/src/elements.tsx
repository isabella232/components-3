import {
    Type,
    Host,
    Props,
    c,
    useRef,
    useEffect,
    useProp,
    useState,
} from "atomico";
import Keen, { KeenSliderInstance, KeenSliderOptions } from "keen-slider";
import { useProxySlot } from "@atomico/hooks/use-slot";
import style from "./keen-slider.css";
import { useResponsiveState } from "@atomico/hooks/use-responsive-state";

function component(props: Props<typeof component>): Host<{
    onCreateSlider: Event;
    next: () => void;
    prev: () => void;
}> {
    const [slider, setSlider] = useProp<KeenSliderInstance>("slider");
    const [lastInteraction, setLastInteraction] = useState<number>();
    const refRoot = useRef();
    const refSlides = useRef();
    const slotSlides = useProxySlot<HTMLElement>(refSlides);

    const slidesPerView = useResponsiveState(props.slidesPerView || "");
    const slidesSpacing = useResponsiveState(props.slidesSpacing || "");
    const slidesOrigin = useResponsiveState(props.slidesOrigin || "");

    const next = () => slider.next();

    const prev = () => slider.prev();

    useEffect(() => {
        if (!slider || !props.autoplay) return;

        if (!lastInteraction) {
            const interval = setInterval(() => next(), props.autoplayLoop);
            return () => clearInterval(interval);
        } else {
            const interval = setTimeout(
                () => setLastInteraction(0),
                props.autoplayLoop
            );
            return () => clearTimeout(interval);
        }
    }, [slider, lastInteraction, props.autoplay, props.autoplayLoop]);

    useEffect(() => {
        if (!slotSlides.length) return;

        const init: KeenSliderOptions = {
            loop: props.loop,
            drag: props.drag,
            disabled: props.disabled,
            rtl: props.rtl,
            rubberband: props.rubberband,
            initial: props.initial,
            mode: props.mode,
            vertical: props.vertical,
            slides: {
                perView:
                    slidesPerView === "auto"
                        ? slidesPerView
                        : Number(slidesPerView),
                spacing: Number(slidesSpacing),
                origin:
                    slidesOrigin === "auto" || slidesOrigin === "center"
                        ? slidesOrigin
                        : Number(slidesOrigin),
            },
        };
        // clean empty props
        for (let prop in init) {
            if (init[prop] == null) {
                delete init[prop];
            }
        }

        const slider = new Keen(refRoot.current, init);

        setSlider(slider);

        return () => slider.destroy();
    }, [slotSlides.length, slidesPerView, slidesSpacing, slidesOrigin]);

    return (
        <host
            shadowDom
            next={next}
            prev={prev}
            onclick={(event) => setLastInteraction(event.timeStamp)}
        >
            <slot ref={refSlides} name="slide"></slot>
            <slot onclick={prev} name="to-left"></slot>
            <slot onclick={next} name="to-right"></slot>
            <div class="keen-slider" ref={refRoot}>
                {slotSlides.map((element, id) => {
                    const name = `slide-${id}`;
                    element.slot = name;
                    return (
                        <div class="keen-slider__slide">
                            <slot name={name}></slot>
                        </div>
                    );
                })}
            </div>
        </host>
    );
}

component.props = {
    loop: Boolean,
    drag: Boolean,
    disabled: Boolean,
    vertical: Boolean,
    rtl: Boolean,
    rubberband: Boolean,
    autoplay: Boolean,
    autoplayLoop: {
        type: Number,
        value: 2000,
    },
    initial: Number,
    mode: {
        type: String,
        value: (): "snap" | "free" | "free-snap" => "snap",
    },
    slidesPerView: String,
    slidesSpacing: String,
    slidesOrigin: String,

    slider: {
        type: null as Type<KeenSliderInstance>,
        event: {
            type: "CreateSlider",
        },
    },
};

component.styles = style;

export const KeenSlider = c(component);


