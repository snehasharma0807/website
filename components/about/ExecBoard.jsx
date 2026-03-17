import React from 'react';
import { Container, Row } from 'reactstrap';
import MemberIcon from '../memberIcon';
import CoDirectorIcon from '../CoDirectorIcon';

function ExecBoard({ execBoard }) {
  const list = execBoard ?? [];
  const coDirectors = list.filter((x) => x.title === 'Co-Director');
  const otherExec = list.filter((x) => x.title !== 'Co-Director');

  return (
    <Container>
      <h3 className="p-2 m-3 center">Co-Directors</h3>
      <Row className="justify-content-md-center">
        {coDirectors.map((member) => (
          <CoDirectorIcon
            key={member.id || member.name}
            name={member.name}
            image={member.image}
            title={member.title}
            linkedIn={member.linkedIn}
            memberSlug={`/team/${member.urlSlug || member.id || '#'}`}
          />
        ))}
      </Row>
      <h3 className="p-2 m-3 center">Executive Board</h3>
      <Row>
        {otherExec.map((member) => (
          <MemberIcon
            key={member.id || member.name}
            name={member.name}
            image={member.image}
            title={member.title}
            linkedIn={member.linkedIn}
            memberSlug={`/team/${member.urlSlug || member.id || '#'}`}
          />
        ))}
      </Row>
    </Container>
  );
}

export default ExecBoard;
