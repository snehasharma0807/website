import React from 'react';
import Faq from '../../components/faq';
import GradientBanner from '../../components/gradientBanner';
import ServicesDetail from '../../components/apply/nonprofit/servicesDetail';
import Quote from '../../components/quote';
import ApplicationProcess from '../../components/apply/applicationProcess';
import Head from '../../components/head';
import ActionButton from '../../components/actionButton';
import fetchContent from '../../utils/fetchContent';

function Students({
  applicationLink,
  openRolesLink,
  description,
  timelineCollection,
  testimonialsCollection,
  faqsCollection,
}) {
  return (
    <>
      <Head title="H4I Apply | Students" />
      <GradientBanner
        title={'Students'}
        subHeadline={
          'Hack4Impact isn’t just for nonprofits. Our work provides us a unique opportunity to learn and develop technical skills. Education is at the core of Hack4Impact’s mission, and we work hard to create an environment where we are always learning from our work — and from each other.'
        }>
        {applicationLink && <ActionButton link={applicationLink}>Apply Now</ActionButton>}
        {openRolesLink && (
          <ActionButton white link={openRolesLink}>
            View Open Positions
          </ActionButton>
        )}
      </GradientBanner>
      <ServicesDetail title="Interested in joining Hack4Impact?" content={description} />
      {testimonialsCollection.items.map(({ author, quote }) => (
        <Quote key={author} quote={quote} source={author} />
      ))}
      {timelineCollection?.items?.length > 0 && (
        <ApplicationProcess steps={timelineCollection.items} />
      )}
      {faqsCollection?.items?.length > 0 && <Faq questions={faqsCollection.items} />}
    </>
  );
}

export default Students;

export async function getStaticProps() {
  const data = await fetchContent(`
  {
    pennWebsiteLayout(id: "${process.env.LAYOUT_ENTRY_ID}") {
      studentApplication {
        applicationLink
        openRolesLink
        description {
          json
        }
        timelineCollection {
          items {
            header
            body {
              json
            }
            image {
              url
              description
            }
          }
        }
        testimonialsCollection {
          items {
            author
            quote {
              json
            }
          }
        }
        faqsCollection {
          items {
            question
            answer {
              json
            }
          }
        }
      }
    }
  }
  `);

  return {
    props: data?.pennWebsiteLayout?.studentApplication ?? {},
  };
}
