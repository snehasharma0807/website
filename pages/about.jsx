import React from 'react';
import GradientBanner from '../components/gradientBanner';
import MissionSection from '../components/about/missionSection';
import OurValues from '../components/about/ourValues';
import Head from '../components/head';
import Team from '../components/about/team';
import fetchContent from '../utils/fetchContent';

function AboutPage({ members, alumni, values, execBoard }) {
  return (
    <div>
      <Head title="About Us" />
      <GradientBanner
        title="We believe in using tech for good."
        subHeadline="Hack4Impact believes in technology’s huge potential to empower activists and humanitarians to create lasting and impactful social change. We work to foster the wider adoption of software as a tool for social good."
        arrow
      />
      <MissionSection />
      <OurValues content={values} />
      <Team members={members} alumni={alumni} execBoard={execBoard} />
    </div>
  );
}

export default AboutPage;

export async function getStaticProps() {
  const data = await fetchContent(`
  fragment profile on PennMemberProfile{
    name
    title
    image {
      url
    }
    linkedIn
    classOf
    urlSlug
  }

  {
    pennWebsiteLayout(id: "${process.env.LAYOUT_ENTRY_ID}") {
      chapterValuesCollection {
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
      execBoardCollection {
        items {
          ...profile
        }
      }
      membersCollection {
        items {
          ...profile
        }
      }
      alumniCollection {
        items {
          ...profile
        }
      }
    }
  }
  `);

  const layout = data?.pennWebsiteLayout;
  return {
    props: {
      values:   layout?.chapterValuesCollection?.items ?? [],
      members:  layout?.membersCollection?.items ?? [],
      alumni:   layout?.alumniCollection?.items ?? [],
      execBoard: layout?.execBoardCollection?.items ?? [],
    },
  };
}
