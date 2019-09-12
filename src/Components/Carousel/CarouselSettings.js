import React from 'react';
import { PrevArrow, NextArrow } from './CarouselArrows';

const responsiveSettings = (areasToRender, selectedArea) => {
  const slidesToShow = areasToRender && areasToRender.length < 2
    ? areasToRender.length : 2;

  const infinite = areasToRender.length > 2;
  const slidesToScroll = selectedArea ? 0 : 2;
  const variableWidth = slidesToShow === 1;

  return [{
    breakpoint: 640,
    settings: {
      infinite,
      slidesToShow,
      variableWidth,
      slidesToScroll,
    },
  }];
};

const carouselSettings = (areasToRender, selectedArea, applicationText) => {
  const slidesToShow = areasToRender && areasToRender.length < 4
    ? areasToRender.length : 4;

  const infinite = areasToRender.length > 4;
  const slidesToScroll = selectedArea ? 0 : 4;
  const variableWidth = slidesToShow < 4;

  return {
    infinite,
    speed: 500,
    slidesToShow,
    accessibility: true,
    slidesToScroll,
    swipe: !selectedArea,
    initialSlide: 0,
    variableWidth,
    nextArrow: <NextArrow label={applicationText.next} selectedArea={selectedArea} />,
    prevArrow: <PrevArrow label={applicationText.prev} selectedArea={selectedArea} />,
    responsive: responsiveSettings(areasToRender, selectedArea),
  };
};

export default carouselSettings;
