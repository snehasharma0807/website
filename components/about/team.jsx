import React from 'react';
import { Container, Row } from 'reactstrap';
import Section from '../section';
import MemberIcon from '../memberIcon';
import ExecBoard from '../about/ExecBoard';
import groupBy from '../../utils/groupBy';

function formatAlumniName(name, graduationYear) {
  const n = (name ?? '').trim() || '—';
  const year = (graduationYear ?? '').toString().trim();
  if (!year) return n;
  const yy = year.length >= 2 ? year.slice(-2) : year;
  return `${n} '${yy}`;
}

const EXEC_TITLES = [
  'Co-Director',
  'Projects Chair',
  'Education Chair',
  'Community Chair',
  'External Relations Chair',
];

function Team({ members, alumni, execBoard }) {
  const hasExecBoard = execBoard && execBoard.length > 0;
  const developers = (members || []).filter(
    (m) => !hasExecBoard || !EXEC_TITLES.includes(m.title)
  );

  const sortedAlumni = [...(alumni || [])].sort((a, b) => {
    const y1 = (a.graduation_year ?? a.classOf ?? '').toString();
    const y2 = (b.graduation_year ?? b.classOf ?? '').toString();
    return y2.localeCompare(y1);
  });

  const hasGraduationYear = sortedAlumni.some((a) => a.graduation_year);
  const alumByClass = hasGraduationYear ? null : groupBy(sortedAlumni, 'classOf');

  return (
    <Section>
      <Container>
        <h1 className="p-3 m-3 center">Our Team</h1>
        <ExecBoard execBoard={execBoard} />
        <h2 className="p-5 m-3 center">Developers</h2>
        <Row>
          {developers.map((member) => (
              <MemberIcon
                key={member.id || member.name}
                name={member.name}
                image={member.image}
                memberSlug={`/team/${member.urlSlug || member.id || '#'}`}
                linkedIn={member.linkedIn}
              />
            ))}
        </Row>
        <h2 className="p-5 m-3 center">Alumni</h2>
        {hasGraduationYear ? (
          <Row>
            {sortedAlumni.map((alum) => (
              <MemberIcon
                key={alum.id || alum.name}
                name={formatAlumniName(alum.name, alum.graduation_year)}
                image={alum.image}
                memberSlug={`/team/${alum.urlSlug || alum.id || '#'}`}
                linkedIn={alum.linkedIn}
              />
            ))}
          </Row>
        ) : (
          Object.entries(alumByClass || {})
            .sort()
            .reverse()
            .map(([classOf, alum]) => (
              <div key={classOf}>
                <Row>
                  <h4 className="class-title center">Class of {classOf}</h4>
                </Row>
                <Row>
                  {alum.map((member) => (
                    <MemberIcon
                      key={member.name}
                      name={member.name}
                      image={member.image}
                      memberSlug={`/team/${member.urlSlug}`}
                      linkedIn={member.linkedIn}
                    />
                  ))}
                </Row>
              </div>
            ))
        )}
      </Container>
    </Section>
  );
}

export default Team;
