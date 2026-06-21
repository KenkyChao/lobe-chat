'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from './page.module.css';

type Heading = {
  id: string;
  level: 2 | 3;
  title: string;
};

interface TocNavProps {
  headings: Heading[];
}

const TocNav = ({ headings }: TocNavProps) => {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '');

  const headingIds = useMemo(() => headings.map((heading) => heading.id), [headings]);

  useEffect(() => {
    if (headingIds.length === 0) return;

    const resolveActiveHeading = () => {
      const visibleHeadings = headingIds
        .map((id) => {
          const element = document.getElementById(id);
          if (!element) return null;

          const rect = element.getBoundingClientRect();

          return {
            id,
            top: rect.top,
          };
        })
        .filter(Boolean) as Array<{ id: string; top: number }>;

      const currentHeading =
        visibleHeadings.filter((heading) => heading.top <= 140).at(-1) ?? visibleHeadings[0];

      if (currentHeading) setActiveId(currentHeading.id);
    };

    resolveActiveHeading();

    window.addEventListener('scroll', resolveActiveHeading, { passive: true });
    window.addEventListener('resize', resolveActiveHeading);

    return () => {
      window.removeEventListener('scroll', resolveActiveHeading);
      window.removeEventListener('resize', resolveActiveHeading);
    };
  }, [headingIds]);

  return (
    <nav className={styles.tocNav}>
      {headings.map((heading) => (
        <a
          className={`${styles.tocItem} ${heading.level === 3 ? styles.tocItemDepth3 : ''} ${
            activeId === heading.id ? styles.tocItemActive : ''
          }`}
          href={`#${heading.id}`}
          key={heading.id}
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );
};

export default TocNav;
