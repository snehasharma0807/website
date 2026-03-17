import React from 'react';
import Head from '../../components/head';
import fetchContent from '../../utils/fetchContent';
import Team from '../../components/projects/Team';
import FeatureSlider from '../../components/projects/featureSlider';
import ProjectQuote from '../../components/quote';
import ContentBlock from '../../components/ContentBlock';
import ActionButton from '../../components/actionButton';
import { Row, Col, Container } from 'reactstrap';
import GradientBanner from '../../components/gradientBanner';
import ProjectTechUsed from '../../components/projects/projectTechUsed';
import MemberIcon from '../../components/memberIcon';
import { getProjectById } from '../../lib/dataPublic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LEAD_TITLES = ['lead', 'pm', 'manager', 'director', 'chair'];

function ProjectPage({
  title,
  titleAbbrev,
  introParagraph,
  codeRepoLink,
  finalProductLink,
  aboutProject,
  aboutClient,
  features = [],
  impact,
  technologiesUsed = [],
  projectLeads = [],
  developers = [],
  testimonials = [],
  thumbnail,
}) {
  const displayTitle = titleAbbrev ? `${title || ''} (${titleAbbrev})` : (title || 'Project');
  const techList = Array.isArray(technologiesUsed) ? technologiesUsed : String(technologiesUsed || '').split(',').map((t) => t.trim()).filter(Boolean);
  const hasTeam = (projectLeads && projectLeads.length > 0) || (developers && developers.length > 0);
  const bannerSubline = typeof introParagraph === 'string' ? introParagraph : '';

  return (
    <>
      <Head title={displayTitle} />
      <GradientBanner title={displayTitle} subHeadline={bannerSubline}>
        {finalProductLink ? (
          <>
            <ActionButton className="mr-3" link={finalProductLink}>
              Try our final product
            </ActionButton>
            <ActionButton white link={codeRepoLink || 'https://github.com/hack4impact-upenn'}>
              See our code
            </ActionButton>
          </>
        ) : (
          <ActionButton white link={codeRepoLink || 'https://github.com/hack4impact-upenn'}>
            See our code
          </ActionButton>
        )}
      </GradientBanner>

      {introParagraph && (
        <section className="project-intro">
          <Container>
            <Row className="d-flex justify-content-center">
              <Col lg="8">
                {typeof introParagraph === 'string' ? (
                  <p className="project-intro-p">{introParagraph}</p>
                ) : (
                  <div className="project-intro-p"><ContentBlock content={introParagraph?.json ?? introParagraph} /></div>
                )}
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {thumbnail?.url && (
        <section className="project-thumb-section">
          <Row className="d-flex justify-content-center mb-5">
            <img className="project-thumb" src={thumbnail.url} alt={thumbnail.description || title} />
          </Row>
        </section>
      )}

      <section className="project-about">
        <Container>
          <Row>
            {aboutProject && (
              <Col lg="6" md="6" className="mb-4 mb-md-0">
                <h2 className="project-section-title">About the Project</h2>
                <div className="project-card-body">
                  <ContentBlock content={aboutProject?.json ?? aboutProject} />
                </div>
              </Col>
            )}
            {aboutClient && (
              <Col lg="6" md="6">
                <h2 className="project-section-title">About the Client</h2>
                <div className="project-card-body">
                  <ContentBlock content={aboutClient?.json ?? aboutClient} />
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </section>

      {features && features.length > 0 && (
        <FeatureSlider features={features} />
      )}

      {impact && (
        <section className="project-impact">
          <Container>
            <Row className="d-flex justify-content-center">
              <Col lg="8">
                <h2 className="project-section-title">Impact</h2>
                <div className="project-card-body">
                  <ContentBlock content={impact?.json ?? impact} />
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {techList.length > 0 && <ProjectTechUsed technologiesUsed={techList} />}

      {hasTeam && (
        <section className="project-team pt-5 mt-5">
          <Container>
            {projectLeads && projectLeads.length > 0 && (
              <>
                <h2 className="project-section-title">Project leads</h2>
                <Row className="mb-5">
                  {projectLeads.map((member) => (
                    <MemberIcon
                      key={member.name}
                      name={member.name}
                      title={member.title}
                      image={member.image}
                      linkedIn={member.linkedIn}
                      memberSlug={member.urlSlug ? `/team/${member.urlSlug}` : '#'}
                    />
                  ))}
                </Row>
              </>
            )}
            {developers && developers.length > 0 && (
              <>
                <h2 className="project-section-title">Developers</h2>
                <Row>
                  {developers.map((member) => (
                    <MemberIcon
                      key={member.name}
                      name={member.name}
                      title={member.title}
                      image={member.image}
                      linkedIn={member.linkedIn}
                      memberSlug={member.urlSlug ? `/team/${member.urlSlug}` : '#'}
                    />
                  ))}
                </Row>
              </>
            )}
          </Container>
        </section>
      )}

      {testimonials && testimonials.length > 0 && testimonials.map(({ author, quote }) => {
        const [authorName, authorTitle] = (author || '').split(',');
        return (
          <ProjectQuote
            key={authorName || author}
            quote={quote}
            source={authorName}
            sourceTitle={authorTitle}
          />
        );
      })}

      <Row className="d-flex justify-content-center mb-5">
        <ActionButton white link="/projects">
          See more of our projects
        </ActionButton>
      </Row>

      <style dangerouslySetInnerHTML={{ __html: `
        .project-section-title { text-align: center; margin-bottom: 1.5rem; }
        .project-card-body { color: #333; line-height: 1.6; }
        .project-intro { padding: 2rem 0; }
        .project-intro-p { font-size: 1.1rem; text-align: center; color: #555; margin: 0; }
        .project-thumb { width: 100%; max-width: 500px; object-fit: cover; box-shadow: 0 10px 20px var(--primary-dark-2); }
        @media (min-width: 600px) { .project-thumb { position: relative; top: -30px; } }
        .project-about section, .project-impact section { padding: 40px 0; }
      ` }} />
    </>
  );
}

export default ProjectPage;

function normalizeContentful(data) {
  const item = data?.pennProjectPageCollection?.items?.[0];
  if (!item) return null;
  const team = item.teamMembersCollection?.items ?? [];
  const leadTitles = (t) => LEAD_TITLES.some((k) => (t?.title || '').toLowerCase().includes(k));
  const leads = team.filter((m) => leadTitles(m));
  const devs = team.filter((m) => !leadTitles(m));
  return {
    title: item.title,
    titleAbbrev: null,
    introParagraph: item.description || '',
    codeRepoLink: item.codeRepoLink,
    finalProductLink: item.finalProductLink,
    aboutProject: item.project,
    aboutClient: item.client,
    features: item.featuresCollection?.items ?? [],
    impact: item.impact,
    technologiesUsed: item.technologiesUsed ? String(item.technologiesUsed).split(',').map((t) => t.trim()) : [],
    projectLeads: leads.map((m) => ({
      name: m.name,
      title: m.title,
      image: m.image,
      linkedIn: m.linkedIn,
      urlSlug: m.urlSlug,
    })),
    developers: devs.map((m) => ({
      name: m.name,
      title: m.title,
      image: m.image,
      linkedIn: m.linkedIn,
      urlSlug: m.urlSlug,
    })),
    testimonials: (item.testimonialsCollection?.items ?? []).map((t) => ({
      author: t.author,
      quote: t.quote,
    })),
    thumbnail: item.thumbnail ? { url: item.thumbnail.url, description: item.thumbnail.description } : null,
  };
}

function normalizeSupabase(p) {
  const team = p.team_members ?? [];
  const leads = team.filter((m) => m.role === 'lead').map((m) => ({
    name: m.name,
    title: m.title,
    image: m.image_url ? { url: m.image_url } : null,
    linkedIn: m.linkedin,
    urlSlug: null,
  }));
  const devs = team.filter((m) => m.role === 'developer').map((m) => ({
    name: m.name,
    title: m.title,
    image: m.image_url ? { url: m.image_url } : null,
    linkedIn: m.linkedin,
    urlSlug: null,
  }));
  if (team.length === 0 && p.dev_team) {
    devs.push({ name: p.dev_team, title: null, image: null, linkedIn: null, urlSlug: null });
  }
  const features = (p.features ?? []).map((f) => ({
    header: f.header || '',
    body: f.body ? { json: f.body } : null,
    image: f.image_url ? { url: f.image_url, description: f.header } : { url: '', description: '' },
  })).filter((f) => f.header);
  return {
    title: p.title,
    titleAbbrev: p.title_abbrev || null,
    introParagraph: p.description || '',
    codeRepoLink: p.github_link,
    finalProductLink: p.demo_link,
    aboutProject: p.about_project || p.description,
    aboutClient: p.about_client,
    impact: p.impact,
    features,
    technologiesUsed: p.tags ?? [],
    projectLeads: leads,
    developers: devs,
    testimonials: (p.testimonials ?? []).map((t) => ({ author: t.author, quote: t.quote ? { json: t.quote } : null })),
    thumbnail: p.image_url ? { url: p.image_url, description: p.title } : null,
  };
}

export async function getServerSideProps({ params: { projectSlug } }) {
  const slug = projectSlug ?? '';

  if (UUID_REGEX.test(slug)) {
    try {
      const project = await getProjectById(slug);
      if (project) {
        const props = normalizeSupabase(project);
        return { props };
      }
    } catch (e) {
      console.error('[projects] getProjectById', e);
    }
  }

  try {
    const data = await fetchContent(`
    {
      pennProjectPageCollection(where: {urlSlug: "${slug}"}, limit: 1) {
        items {
          title
          description { json }
          thumbnail { url description }
          finalProductLink
          codeRepoLink
          technologiesUsed
          project { json }
          client { json }
          impact { json }
          featuresCollection {
            items { header body { json } image { url description } }
          }
          testimonialsCollection { items { author quote { json } } }
          teamMembersCollection { items { name title image { url } linkedIn urlSlug } }
        }
      }
    }
    `);
    const props = normalizeContentful(data);
    if (props) return { props };
  } catch (e) {
    console.error('[projects] fetchContent', e);
  }

  return { notFound: true };
}
