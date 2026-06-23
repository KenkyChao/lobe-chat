'use client';

import { type BuiltinSkill, type LobeToolMeta } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  createBuiltinAgentSkillDetailModal,
  createBuiltinSkillDetailModal,
} from '@/features/SkillStore/SkillDetail';
import { useToolStore } from '@/store/tool';
import { type ToolStoreState } from '@/store/tool/initialState';

import BuiltinItem from '../Builtin/Item';
import Empty from '../Empty';
import { gridStyles } from '../style';

interface LobeHubListProps {
  keywords: string;
}

// Selector to get only actual builtin tools (not including Klavis)
const getBuiltinToolsOnly = (s: ToolStoreState): LobeToolMeta[] => {
  return s.builtinTools
    .filter((item) => !item.hidden)
    .map((t) => ({
      author: 'NaiYun AI',
      identifier: t.identifier,
      meta: t.manifest.meta,
      type: 'builtin' as const,
    }));
};

export const LobeHubList = memo<LobeHubListProps>(({ keywords }) => {
  const { t } = useTranslation('setting');
  // Use custom selector to get only actual builtin tools (not Klavis)
  const builtinTools = useToolStore(getBuiltinToolsOnly, isEqual);
  const builtinSkills = useToolStore((s) => s.builtinSkills, isEqual);

  const filteredItems = useMemo(() => {
    const items: Array<
      { skill: BuiltinSkill; type: 'builtinAgentSkill' } | { tool: LobeToolMeta; type: 'builtin' }
    > = [];

    // Add builtin agent skills first
    for (const skill of builtinSkills) {
      items.push({ skill, type: 'builtinAgentSkill' });
    }

    // Add builtin tools
    for (const tool of builtinTools) {
      items.push({ tool, type: 'builtin' });
    }

    // Filter by keywords
    const lowerKeywords = keywords.toLowerCase().trim();
    if (!lowerKeywords) return items;

    return items.filter((item) => {
      if (item.type === 'builtinAgentSkill') {
        const name = item.skill.name.toLowerCase();
        const identifier = item.skill.identifier.toLowerCase();
        return name.includes(lowerKeywords) || identifier.includes(lowerKeywords);
      }

      const title = item.tool.meta?.title?.toLowerCase() || '';
      const identifier = item.tool.identifier?.toLowerCase() || '';
      return title.includes(lowerKeywords) || identifier.includes(lowerKeywords);
    });
  }, [keywords, builtinTools, builtinSkills]);

  const hasSearchKeywords = Boolean(keywords && keywords.trim());

  if (filteredItems.length === 0) return <Empty search={hasSearchKeywords} />;

  return (
    <>
      <div className={gridStyles.grid}>
        {filteredItems.map((item) => {
          if (item.type === 'builtinAgentSkill') {
            const localizedTitle = t(`tools.builtins.${item.skill.identifier}.title`, {
              defaultValue: item.skill.name,
            });
            const localizedDescription = t(`tools.builtins.${item.skill.identifier}.description`, {
              defaultValue: item.skill.description,
            });
            return (
              <BuiltinItem
                avatar={item.skill.avatar}
                description={localizedDescription}
                identifier={item.skill.identifier}
                key={item.skill.identifier}
                title={localizedTitle}
                onOpenDetail={() =>
                  createBuiltinAgentSkillDetailModal({ identifier: item.skill.identifier })
                }
              />
            );
          }

          const localizedTitle = t(`tools.builtins.${item.tool.identifier}.title`, {
            defaultValue: item.tool.meta?.title || item.tool.identifier,
          });
          const localizedDescription = t(`tools.builtins.${item.tool.identifier}.description`, {
            defaultValue: item.tool.meta?.description || '',
          });
          return (
            <BuiltinItem
              avatar={item.tool.meta?.avatar}
              description={localizedDescription}
              identifier={item.tool.identifier}
              key={item.tool.identifier}
              title={localizedTitle}
              onOpenDetail={() =>
                createBuiltinSkillDetailModal({ identifier: item.tool.identifier })
              }
            />
          );
        })}
      </div>
    </>
  );
});

LobeHubList.displayName = 'LobeHubList';

export default LobeHubList;
