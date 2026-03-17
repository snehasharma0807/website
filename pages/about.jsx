import React from 'react';
import GradientBanner from '../components/gradientBanner';
import MissionSection from '../components/about/missionSection';
import OurValues from '../components/about/ourValues';
import Head from '../components/head';
import Team from '../components/about/team';
import { getMembersPublic, getAlumniPublic } from '../lib/dataPublic';

const EXEC_ROLES = [
  'Co-Director',
  'Projects Chair',
  'Education Chair',
  'Community Chair',
  'External Relations Chair',
];

const DEFAULT_VALUES = [
  { header: 'Impact', body: { json: 'We prioritize work that creates measurable, lasting change for our partners and the communities they serve.' } },
  { header: 'Community', body: { json: 'We build an inclusive community where members learn from each other and grow as technologists and leaders.' } },
  { header: 'Quality', body: { json: 'We deliver well-scoped, maintainable software and treat our partners’ missions with the same rigor as industry clients.' } },
];

function AboutPage({ members, alumni, values, execBoard }) {
  return (
    <div>
      <Head title="About Us" />
      <GradientBanner
        title="We believe in using tech for good."
        subHeadline="Hack4Impact believes in technology's huge potential to empower activists and humanitarians to create lasting and impactful social change. We work to foster the wider adoption of software as a tool for social good."
        arrow
      />
      <MissionSection />
      <OurValues content={values} />
      <Team members={members} alumni={alumni} execBoard={execBoard} />
    </div>
  );
}

export default AboutPage;

export async function getServerSideProps() {
  try {
    const [membersRows, alumniRows] = await Promise.all([
      getMembersPublic(),
      getAlumniPublic(),
    ]);

    const allMembers = membersRows.map((m) => ({
      id: m.id,
      name: m.name ?? '',
      title: m.role ?? '',
      image: m.photo_url ? { url: m.photo_url } : null,
      urlSlug: m.id,
      linkedIn: m.linkedin ?? '',
    }));

    const execBoard = allMembers.filter((m) => EXEC_ROLES.includes(m.title));
    const members = allMembers.filter((m) => !EXEC_ROLES.includes(m.title));

    const alumni = alumniRows.map((a) => ({
      id: a.id,
      name: a.name ?? '',
      graduation_year: a.graduation_year ?? '',
      image: null,
      urlSlug: a.id,
      linkedIn: '',
    }));

    return {
      props: {
        members,
        alumni,
        values: DEFAULT_VALUES,
        execBoard,
      },
    };
  } catch (e) {
    console.error('[about] getServerSideProps', e);
    return {
      props: {
        members: [],
        alumni: [],
        values: DEFAULT_VALUES,
        execBoard: [],
      },
    };
  }
}
