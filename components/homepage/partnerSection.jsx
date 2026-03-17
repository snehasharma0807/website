import React from 'react';
import Section from '../section';
import { Container, Row } from 'reactstrap';
import ActionLink from '../actionLink';

const TIER_ORDER = { platinum: 4, gold: 3, silver: 2, bronze: 1 };

function tierRank(tier) {
  if (!tier) return 0;
  const key = String(tier).toLowerCase().trim();
  return TIER_ORDER[key] ?? 0;
}

export default function PartnerSection({ sponsors = [] }) {
  const withLogos = sponsors.filter((s) => s.logo_url);
  const sorted = [...withLogos].sort((a, b) => tierRank(b.tier) - tierRank(a.tier));

  return (
    <Section className="partners-section">
      <Container>
        <h2 className="section-title center mb-5">Our Partners</h2>
        <div className="sponsor-row">
          {sorted.length > 0 ? (
            sorted.map((s) => (
              <a
                key={s.id}
                href={s.website || '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name || 'Partner'}
                className="partner-card"
              >
                <img
                  width="150"
                  src={s.logo_url}
                  className="center partner-logos"
                  alt={s.name || 'Partner'}
                />
                <span className="partner-name">{s.name || 'Partner'}</span>
                {s.tier && <span className="partner-tier">{s.tier}</span>}
              </a>
            ))
          ) : (
            <p className="partners-empty text-center">No partners to display yet.</p>
          )}
        </div>
        <Row>
          <div className="center partner-button">
            <ActionLink
              text="Interested in partnering? Contact us"
              link="mailto:penn@hack4impact.org"
            />
          </div>
        </Row>
      </Container>
      <style jsx>{`
        .partners-section h2 {
          font-size: 20px;
          text-align: center;
          margin-bottom: 50px;
          color: #373f46;
          opacity: 0.7;
          font-weight: 300;
        }
        .partner-button {
          margin-top: 30px !important;
        }
        .partner-logos {
          margin: 0;
          max-width: 15vw;
        }
        .sponsor-row {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          align-items: flex-start;
          gap: 2rem;
        }
        .partner-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none;
          color: inherit;
          max-width: 180px;
        }
        .partner-card:hover {
          color: var(--primary-blue, #0069ca);
        }
        .partner-name {
          display: block;
          margin-top: 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          color: #373f46;
        }
        .partner-tier {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.8rem;
          color: #373f46;
          opacity: 0.8;
          text-transform: capitalize;
        }
        .partners-empty {
          color: #373f46;
          opacity: 0.7;
          margin: 0;
        }
      `}</style>
    </Section>
  );
}
