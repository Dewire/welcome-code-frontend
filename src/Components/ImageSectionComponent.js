import React from 'react';
import Slider from 'react-slick';
import placeholderImage from '../Images/Placeholders/villaomr.png';

const ImageSectionComponent = ({ municipality, section, divider }) => {
  const sliderSettings = {
    infinite: true,
    slidesToShow: 1,
    speed: 500,
    dots: true,
    arrows: false,
  };
  return (
    <div key={section.index} className="slider-wrapper image-section-wrapper">
      <Slider {...sliderSettings}>
        {
          section.carouselUrls.sort((u1, u2) => u1.index - u2.index).map(data =>
            (<div
              key={data.index}
              className="bg-image-section"
              style={{ backgroundImage: `url(${data.url || placeholderImage})` }}
              aria-label={`${municipality} ${data.index}`}
            />))
        }
      </Slider>
      { divider &&
        <hr className="divider" />
      }
    </div>
  );
};

export default ImageSectionComponent;
