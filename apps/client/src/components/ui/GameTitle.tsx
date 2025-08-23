import React from "react";
import styled from "styled-components";

const TitleContainer = styled.div`
  text-align: center;
  max-width: 600px;
  padding: 40px;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  font-weight: 300;
  line-height: 1.4;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

interface GameTitleProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const GameTitle: React.FC<GameTitleProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <TitleContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
      <div>{children}</div>
    </TitleContainer>
  );
};
