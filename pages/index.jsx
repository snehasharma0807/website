import React from 'react';
import Banner from '../components/homepage/banner';
import OurWorkSection from '../components/homepage/ourWork';
import InvolveSection from '../components/involveSection';
import PartnerSection from '../components/homepage/partnerSection';
import { ToastContainer } from 'react-toastify';
import Head from '../components/head';
import Section from '../components/section';
import { Container } from 'reactstrap';
import { getActiveProjects, getSponsorsPublic } from '../lib/dataPublic';

function Home({ previewProjects, sponsors }) {
  return (
    <>
      <Head title="Hack4Impact" />
      <ToastContainer />
      <Banner />
      <OurWorkSection projects={previewProjects} />
      <Section grey>
        <Container>
          <h2 className="text-center">Get Involved</h2>
          <InvolveSection />
        </Container>
      </Section>
      <PartnerSection sponsors={sponsors} />
    </>
  );
}

export default Home;

export async function getServerSideProps() {
  try {
    const [projects, sponsors] = await Promise.all([
      getActiveProjects(),
      getSponsorsPublic(),
    ]);

    const previewProjects = projects.slice(0, 3).map((p) => ({
      title: p.title ?? '',
      description: { json: p.description ?? '' },
      thumbnail: { url: p.image_url ?? '', description: p.title ?? '' },
      urlSlug: p.id,
    }));

    return {
      props: {
        previewProjects,
        sponsors: sponsors ?? [],
      },
    };
  } catch (e) {
    console.error('[index] getServerSideProps', e);
    return {
      props: {
        previewProjects: [],
        sponsors: [],
      },
    };
  }
}
