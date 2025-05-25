'use client'
import './embla.css'

import React, {
	ComponentPropsWithRef,
	useCallback,
	useEffect,
	useState
} from 'react'
import { EmblaCarouselType } from 'embla-carousel'

type UsePrevNextButtonsType = {
	prevBtnDisabled: boolean
	nextBtnDisabled: boolean
	onPrevButtonClick: () => void
	onNextButtonClick: () => void
}

export const usePrevNextButtons = (
	emblaApi: EmblaCarouselType | undefined,
	onButtonClick?: (emblaApi: EmblaCarouselType) => void
): UsePrevNextButtonsType => {
	const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
	const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

	const onPrevButtonClick = useCallback(() => {
		if (!emblaApi) return
		emblaApi.scrollPrev()
		if (onButtonClick) onButtonClick(emblaApi)
	}, [emblaApi, onButtonClick])

	const onNextButtonClick = useCallback(() => {
		if (!emblaApi) return
		emblaApi.scrollNext()
		if (onButtonClick) onButtonClick(emblaApi)
	}, [emblaApi, onButtonClick])

	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setPrevBtnDisabled(!emblaApi.canScrollPrev())
		setNextBtnDisabled(!emblaApi.canScrollNext())
	}, [])

	useEffect(() => {
		if (!emblaApi) return

		onSelect(emblaApi)
		emblaApi.on('reInit', onSelect).on('select', onSelect)
	}, [emblaApi, onSelect])

	return {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick
	}
}

type PropType = ComponentPropsWithRef<'button'>

export const PrevButton: React.FC<PropType> = (props) => {
	const { children, ...restProps } = props

	return (
		<button
			className="embla__button embla__button--prev"
			type="button"
			{...restProps}
		>
			<img
				src={'/assets/icons/arrow-left-banner-icon.svg'}
				alt='DiepLeHouse'
				className='w-[18px] h-[18px] sm:h-[24px] sm:w-[24px]'
			/>
			{children}
		</button>
	)
}

export const NextButton: React.FC<PropType> = (props) => {
	const { children, ...restProps } = props

	return (
		<button
			className="embla__button embla__button--next"
			type="button"
			{...restProps}
		>
			<img
				src={'/assets/icons/arrow-right-banner-icon.svg'}
				alt='DiepLeHouse'
				className='w-[18px] h-[18px] sm:h-[24px] sm:w-[24px]'
			/>
			{children}
		</button>
	)
}
