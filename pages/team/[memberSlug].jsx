import React from 'react';
import Head from '../../components/head';
import fetchContent from '../../utils/fetchContent';
import { getMemberById } from '../../lib/dataPublic';
import { Row, Col } from 'reactstrap';
import ActionButton from '../../components/actionButton';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function MemberPage({ name, title, image, linkedIn, bio, classOf, email, github }) {
  const imgUrl = image?.url ?? '';
  const imgAlt = image?.description ?? name ?? '';

  return (
    <div className="member-page-root">
      <Head title={name} />
      <Row className="d-flex justify-content-center mb-5">
        {imgUrl ? (
          <img className="member-page-thumb" src={imgUrl} alt={imgAlt} />
        ) : (
          <div
            className="member-page-thumb member-page-thumb-placeholder"
            style={{ width: '50%', maxWidth: 300, aspectRatio: '1', background: '#e0e0e0', borderRadius: 8 }}
          />
        )}
      </Row>
      <Row className="d-flex justify-content-center">
        <Col lg="4" md="6">
          <h3 className="member-page-name">{name}</h3>
          <h4 className="member-page-role">{title}</h4>
          {classOf && <p className="text-center">Class of {classOf}</p>}
          <div className="member-page-links">
            {linkedIn && (
              <a href={linkedIn} target="_blank" rel="noreferrer">
                <img width="12" className="linkedin-icon" src="/icons/linkedin.svg" alt={`${name}'s LinkedIn`} />
              </a>
            )}
            {'  '}
            {github && (
              <a href={github.startsWith('http') ? github : `https://github.com/${github}`} target="_blank" rel="noreferrer">
                <img width="12" className="linkedin-icon" src="/icons/github.svg" alt={`${name}'s Github`} />
              </a>
            )}
            {'  '}
            {email && (
              <a href={`mailto:${email}`}>
                <img width="12" className="linkedin-icon" src="/icons/email.svg" alt={`${name}'s Email`} />
              </a>
            )}
          </div>
          {bio && <div className="card-body">{bio}</div>}
        </Col>
      </Row>
      <Row className="d-flex justify-content-center mb-5">
        <ActionButton white link="/about">
          Learn More About Us
        </ActionButton>
      </Row>

      <style dangerouslySetInnerHTML={{ __html: `
        .member-page-root .member-page-name { margin-top: 85px; text-align: center; margin-bottom: 10px; }
        .member-page-root .member-page-role { text-align: center; }
        .member-page-root .member-page-links { text-align: center; }
        .member-page-root .member-page-thumb {
          width: 50%;
          height: auto;
          object-fit: cover;
          box-shadow: 0 10px 20px var(--primary-dark-2);
        }
        .member-page-root .member-page-thumb-placeholder { display: block; margin: 0 auto; }
        @media (min-width: 300px) {
          .member-page-root .member-page-thumb {
            position: relative;
            top: 100px;
            max-width: 300px;
          }
        }
        .member-page-root section { padding: 30px 0; }
      ` }} />
    </div>
  );
}

export default MemberPage;

export async function getServerSideProps({ params: { memberSlug } }) {
  const slug = memberSlug ?? '';

  if (UUID_REGEX.test(slug)) {
    try {
      const member = await getMemberById(slug);
      if (member) {
        return {
          props: {
            name: member.name ?? '',
            title: member.role ?? '',
            image: member.photo_url
              ? { url: member.photo_url, description: member.name ?? '' }
              : { url: '', description: '' },
            linkedIn: member.linkedin ?? '',
            bio: member.bio ?? '',
            classOf: member.graduation_year ?? '',
            email: '',
            github: member.github ?? '',
          },
        };
      }
    } catch (e) {
      console.error(`[team] getMemberById(${slug})`, e);
    }
  }

  try {
    const data = await fetchContent(`
    {
      pennMemberProfileCollection(where: {urlSlug: "${slug}"} limit: 1) {
        items {
          name
          title
          image { url description }
          linkedIn
          bio
          classOf
          email
          github
        }
      }
    }
    `);

    if (
      data?.pennMemberProfileCollection?.items?.length > 0
    ) {
      const memberContent = data.pennMemberProfileCollection.items[0];
      return { props: { ...memberContent } };
    }
  } catch (e) {
    console.error(`[team] fetchContent(${slug})`, e);
  }

  return { notFound: true };
}
