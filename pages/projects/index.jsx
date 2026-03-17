/* eslint-disable prettier/prettier */
import React from 'react';
import Head from '../../components/head';
import GradientBanner from '../../components/gradientBanner';
import ProjectList from '../../components/projects/projectList';
import ProjectExplore from '../../components/projects/projectExplore';
import ActionButton from '../../components/actionButton';
import { getActiveProjects } from '../../lib/dataPublic';

function Projects({ projects }) {
  return (
    <div>
      <Head title="Our Work" />
      <GradientBanner
        arrow
        title="Our Work"
        subHeadline="In today&#39;s world, we are capable of changing the lives of those
                halfway across the country. While tech has enabled us to have a
                larger reach, we also understand that we have a responsibility
                to build tools that are more than just pet projects. We strive
                to deliver incredible value to the nonprofits we are fortunate
                enough to work with and look forward to seeing our products
                continue to be used for years to come. ">
        <ActionButton link="https://github.com/hack4impact-upenn">See our GitHub</ActionButton>
      </GradientBanner>
      <ProjectList projects={projects} />
      <ProjectExplore />
    </div>
  );
}

export default Projects;

export async function getServerSideProps() {
  try {
    const rows = await getActiveProjects();
    const projects = rows.map((p) => {
      const year = p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear();
      const semester = (p.semester && String(p.semester).trim()) || `Year ${year}`;
      return {
        title: p.title ?? '',
        description: p.description ?? '',
        thumbnail: {
          url: p.image_url ?? '',
          description: p.title ?? '',
        },
        urlSlug: p.id,
        completedIn: semester,
      };
    });
    return { props: { projects } };
  } catch (e) {
    console.error('[projects] getServerSideProps', e);
    return { props: { projects: [] } };
  }
}
