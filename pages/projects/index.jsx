/* eslint-disable prettier/prettier */
import React from 'react';
import Head from '../../components/head';
import GradientBanner from '../../components/gradientBanner';
import ProjectList from '../../components/projects/projectList';
import ProjectExplore from '../../components/projects/projectExplore';
import fetchContent from '../../utils/fetchContent';
import ActionButton from '../../components/actionButton';

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
      <div style={{ textAlign: 'center', paddingRight: '5px' }}>
        <h2>Section Under Construction</h2>
        <p>
          We are in the process of transfer all of our projects to our new site. A complete list of
          previous projects can be found{' '}
          <a href="https://www.notion.so/h4i/986a3351cdca44cd85e10dd4452953f5?v=6420ae90233148dfaf6f8570e680e4e5">
            here
          </a>
        </p>
      </div>
      <ProjectList projects={projects} />
      <ProjectExplore />
    </div>
  );
}

export default Projects;

export async function getStaticProps() {
  const data = await fetchContent(`
  {
    pennWebsiteLayout(id: "${process.env.LAYOUT_ENTRY_ID}") {
      projectsCollection {
        items {
          title
          description {
            json
          }
          thumbnail {
            url
            description
          }
          urlSlug
          completedIn
        }
      }
    }
  }
  `);

  return {
    props: {
      projects: data?.pennWebsiteLayout?.projectsCollection?.items?.filter((x) => !!x) ?? [],
    },
  };
}
