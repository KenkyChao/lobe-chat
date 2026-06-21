'use client';

import { Button } from '@lobehub/ui';
import { App } from 'antd';
import { createStaticStyles } from 'antd-style';
import { customAlphabet } from 'nanoid/non-secure';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SESSION_CHAT_URL } from '@/const/url';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { usePermission } from '@/hooks/usePermission';
import { agentService } from '@/services/agent';
import { useAgentStore } from '@/store/agent';
import { useHomeStore } from '@/store/home';

import { useDetailContext } from '../../DetailProvider';

const styles = createStaticStyles(({ css }) => ({
  buttonGroup: css`
    width: 100%;
  `,
}));

/**
 * Generate a market identifier (8-character lowercase alphanumeric string)
 */
const generateMarketIdentifier = () => {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  const generate = customAlphabet(alphabet, 8);
  return generate();
};

const ForkAndChat = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { identifier, title, config, avatar, backgroundColor, description, tags, editorData } =
    useDetailContext();
  const [isLoading, setIsLoading] = useState(false);
  const createAgent = useAgentStore((s) => s.createAgent);
  const refreshAgentList = useHomeStore((s) => s.refreshAgentList);
  const { message } = App.useApp();
  const navigate = useWorkspaceAwareNavigate();
  const { t } = useTranslation('discover');
  const { allowed: canCreate } = usePermission('create_content');

  const meta = {
    avatar,
    backgroundColor,
    description,
    marketIdentifier: identifier,
    tags,
    title,
  };

  const handleForkAndChat = async () => {
    if (!canCreate) return;

    try {
      setIsLoading(true);

      // Step 1: Check if user has already forked this agent
      const existingAgentId = await agentService.getAgentByForkedFromIdentifier(identifier!);

      if (existingAgentId) {
        // User has already forked this agent, navigate to existing fork
        message.info(t('fork.alreadyForked'));
        navigate(SESSION_CHAT_URL(existingAgentId, mobile));
        return;
      }

      // Generate a unique identifier for the forked agent
      const newIdentifier = generateMarketIdentifier();

      // Step 2: Create a local fork without requiring a community profile.
      if (!config) throw new Error('Agent config is missing');

      const agentData = {
        config: {
          ...config,
          editorData,
          ...meta,
          marketIdentifier: newIdentifier,
          params: {
            ...config.params,
            forkedFromIdentifier: identifier, // Store the source agent identifier
          },
          title,
        },
      };

      // Step 3: Add to local agent list
      const result = await createAgent(agentData);
      await refreshAgentList();

      message.success(t('fork.success'));

      // Step 4: Navigate to chat
      navigate(SESSION_CHAT_URL(result!.agentId, mobile));
    } catch (error: any) {
      console.error('Fork failed:', error);
      message.error(t('fork.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      block
      className={styles.buttonGroup}
      disabled={!canCreate}
      loading={isLoading}
      size={'large'}
      type={'primary'}
      onClick={handleForkAndChat}
    >
      {t('fork.forkAndChat')}
    </Button>
  );
});

export default ForkAndChat;
