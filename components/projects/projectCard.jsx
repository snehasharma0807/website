import React from 'react';
import { Card, CardBody } from 'reactstrap';
import ActionButton from '../actionButton';
import ContentBlock from '../ContentBlock';

function ProjectCard({ title, thumbnail, urlSlug, description }) {
  const imgSrc = thumbnail?.url || '/images/logo.svg';
  const imgAlt = thumbnail?.description || title || 'Project';
  return (
    <>
      <Card className="bg-light mb-3 project-card h-100" style={{ height: '100%' }}>
        <img
          className="card-img-top"
          style={{ height: '200px', objectFit: 'cover' }}
          src={imgSrc}
          alt={imgAlt}
        />
        <CardBody>
          <h3 className="text-center">{title}</h3>
          <div className="text-center" style={{ maxHeight: '200px', overflow: 'auto' }}>
            <ContentBlock content={description?.json ?? description} />
          </div>
          <div className="text-center action-btn-box">
            <ActionButton white link={`/projects/${urlSlug}`}>
              Learn more
            </ActionButton>
          </div>
        </CardBody>
      </Card>
      <style jsx>{`
        h3 {
          font-size: 22px;
          margin-bottom: 15px;
        }
        .action-btn-box {
          margin-top: 30px;
        }
        .project-card:hover {
          box-shadow: 0 5px 30px rgba(44, 62, 80, 0.1);
        }
        .project-card {
          border: none;
          height: 100% !important;
        }
      `}</style>
    </>
  );
}

export default ProjectCard;
