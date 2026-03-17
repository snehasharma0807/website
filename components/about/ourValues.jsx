import React, { useState } from 'react';
import {
  Container,
  Row,
  Card,
  CardBody,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
} from 'reactstrap';
import Section from '../section';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

function renderBody(body) {
  if (!body || !body.json) return '';
  const raw = body.json;
  if (typeof raw === 'string') return `<p>${raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')}</p>`;
  if (raw && raw.nodeType) return documentToHtmlString(raw);
  return '';
}

const OurValues = ({ content }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const items = content && content.length > 0 ? content : [];

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = (newIndex) => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  if (items.length === 0) {
    return null;
  }

  const slides = items.map(({ header, body }, idx) => (
    <CarouselItem
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
      key={header || idx}
    >
      <Container>
        <Row className="justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <Card>
              <CardBody style={{ minHeight: '200px', padding: '1.5rem' }}>
                <h4 className="text-title">{header}</h4>
                <div
                  style={{ paddingLeft: '5px', paddingRight: '15px' }}
                  dangerouslySetInnerHTML={{ __html: renderBody(body) }}
                />
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </CarouselItem>
  ));

  return (
    <Section darkgrey>
      <Container>
        <Row>
          <div className="text-center project-detail-title">
            <h2>Our Values</h2>
          </div>
        </Row>
        <Carousel
          activeIndex={activeIndex}
          next={next}
          previous={previous}
          ride="carousel"
          interval={6000}
          keyboard
          pause="hover"
        >
          <CarouselIndicators
            items={items}
            activeIndex={activeIndex}
            onClickHandler={goToIndex}
          />
          {slides}
          <CarouselControl
            direction="prev"
            directionText="Previous"
            onClickHandler={previous}
          />
          <CarouselControl
            direction="next"
            directionText="Next"
            onClickHandler={next}
          />
        </Carousel>
      </Container>
    </Section>
  );
};

export default OurValues;
