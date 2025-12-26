'use client';

import { Alert } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { type ActionKeys, ChatInputProvider, DesktopChatInput } from '@/features/ChatInput';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { useSendThreadMessage } from './useSend';

const threadActions: ActionKeys[] = ['typo', 'stt', 'portalToken'];

const Desktop = memo(() => {
  const [hideThreadLimitAlert, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.systemStatus(s).hideThreadLimitAlert,
    s.updateSystemStatus,
  ]);

  const { send, disabled, generating, stop } = useSendThreadMessage();

  return (
    <WideScreenContainer>
      {!hideThreadLimitAlert && (
        <Flexbox paddingBlock={'0 6px'} paddingInline={12}>
          <Alert
            closable
            message={"子话题暂不支持文件/图片上传"}
            onClose={() => {
              updateSystemStatus({ hideThreadLimitAlert: true });
            }}
            type={'info'}
          />
        </Flexbox>
      )}

      <ChatInputProvider
        chatInputEditorRef={(instance) => {
          if (!instance) return;
          useChatStore.setState({ threadInputEditor: instance });
        }}
        leftActions={threadActions}
        onSend={() => {
          send();
        }}
        sendButtonProps={{
          disabled,
          generating,
          onStop: stop,
          shape: 'round',
        }}
      >
        <DesktopChatInput />
      </ChatInputProvider>
    </WideScreenContainer>
  );
});

export default Desktop;
