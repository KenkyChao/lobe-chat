'use client';

import { type AuthorizationPhase, type AuthorizationProgress } from '@lobechat/electron-client-ipc';
import { useWatchBroadcast } from '@lobechat/electron-client-ipc';
import { Alert, Button, Center, Flexbox, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { Cloud, Undo2Icon } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isDesktop } from '@/const/version';
import UserInfo from '@/features/User/UserInfo';
import { remoteServerService } from '@/services/electron/remoteServer';
import { useElectronStore } from '@/store/electron';
import { setDesktopAutoOidcFirstOpenHandled } from '@/utils/electron/autoOidc';

import LobeMessage from '../components/LobeMessage';

type LoginStatus = 'idle' | 'loading' | 'success' | 'error';

const authorizationPhaseI18nKeyMap: Record<AuthorizationPhase, string> = {
  browser_opened: 'screen5.auth.phase.browserOpened',
  cancelled: 'screen5.actions.cancel',
  verifying: 'screen5.auth.phase.verifying',
  waiting_for_auth: 'screen5.auth.phase.waitingForAuth',
};

interface LoginStepProps {
  onBack: () => void;
  onNext: () => void;
}

const LoginStep = memo<LoginStepProps>(({ onNext }) => {
  const { t } = useTranslation('desktop-onboarding');
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [authProgress, setAuthProgress] = useState<AuthorizationProgress | null>(null);
  const [isSuccessDismissed, setIsSuccessDismissed] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [localRemainingSeconds, setLocalRemainingSeconds] = useState<number | null>(null);

  const [
    dataSyncConfig,
    isConnectingServer,
    remoteServerSyncError,
    useDataSyncConfig,
    connectRemoteServer,
    refreshServerConfig,
    clearRemoteServerSyncError,
  ] = useElectronStore((s) => [
    s.dataSyncConfig,
    s.isConnectingServer,
    s.remoteServerSyncError,
    s.useDataSyncConfig,
    s.connectRemoteServer,
    s.refreshServerConfig,
    s.clearRemoteServerSyncError,
  ]);

  useDataSyncConfig();

  const isNaiYunHubAuthed = !!dataSyncConfig?.active && dataSyncConfig.storageMode === 'cloud';
  const hasLocalLoginResult = loginStatus !== 'idle';
  const successLogin =
    !isSuccessDismissed &&
    (loginStatus === 'success' || (!hasLocalLoginResult && isNaiYunHubAuthed));

  const handleLogin = async () => {
    if (!isDesktop) {
      setRemoteError(t('screen5.errors.desktopOnlyOidc'));
      setLoginStatus('error');
      return;
    }

    setRemoteError(null);
    clearRemoteServerSyncError();
    setIsSuccessDismissed(false);
    setLoginStatus('loading');
    setDesktopAutoOidcFirstOpenHandled();
    await connectRemoteServer({ remoteServerUrl: undefined, storageMode: 'cloud' });
  };

  const handleBackToLogin = () => {
    setIsSuccessDismissed(true);
    setLoginStatus('idle');
    setAuthProgress(null);
    setRemoteError(null);
    clearRemoteServerSyncError();
  };

  useEffect(() => {
    if (isNaiYunHubAuthed) setLoginStatus('success');
  }, [isNaiYunHubAuthed]);

  useEffect(() => {
    const message = remoteServerSyncError?.message;
    if (!message) return;
    setRemoteError(message);
    if (loginStatus === 'loading') setLoginStatus('error');
  }, [remoteServerSyncError?.message, loginStatus]);

  useWatchBroadcast('authorizationSuccessful', async () => {
    setRemoteError(null);
    clearRemoteServerSyncError();
    setAuthProgress(null);
    setIsSuccessDismissed(false);
    setLoginStatus('success');
    await refreshServerConfig();
  });

  useWatchBroadcast('authorizationFailed', ({ error }) => {
    setRemoteError(error);
    setAuthProgress(null);
    setLoginStatus('error');
  });

  useWatchBroadcast('authorizationProgress', (progress) => {
    setAuthProgress(progress);
    if (progress.phase === 'cancelled') {
      setLoginStatus('idle');
      setAuthProgress(null);
    }
  });

  useEffect(() => {
    if (authProgress) {
      const seconds = Math.max(
        0,
        Math.ceil((authProgress.maxPollTime - authProgress.elapsed) / 1000),
      );
      setLocalRemainingSeconds(seconds);
    } else {
      setLocalRemainingSeconds(null);
    }
  }, [authProgress]);

  useEffect(() => {
    if (localRemainingSeconds === null || localRemainingSeconds <= 0) return;

    const timer = setTimeout(() => {
      setLocalRemainingSeconds((prev) => {
        if (prev === null || prev <= 0) return prev;
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [localRemainingSeconds]);

  const handleCancelAuth = async () => {
    setRemoteError(null);
    clearRemoteServerSyncError();
    setLoginStatus('idle');
    setAuthProgress(null);
    await remoteServerService.cancelAuthorization();
  };

  const renderSuccessContent = () => {
    return (
      <Center gap={32} style={{ height: '100%', minHeight: '100%' }}>
        <Flexbox align={'flex-start'} justify={'flex-start'} style={{ width: '100%' }}>
          <LobeMessage sentences={[t('screen5.title'), t('screen5.title2'), t('screen5.title3')]} />
          <Text as={'p'}>{t('screen5.description')}</Text>
        </Flexbox>

        <Flexbox gap={16} style={{ width: '100%' }}>
          <Alert
            description={t('authResult.success.desc')}
            style={{ width: '100%' }}
            title={t('authResult.success.title')}
            type={'success'}
          />
          <UserInfo
            style={{
              background: cssVar.colorFillSecondary,
              borderRadius: 8,
            }}
          />
        </Flexbox>

        <Flexbox horizontal justify={'space-between'} style={{ marginTop: 32 }}>
          <Button
            icon={Undo2Icon}
            style={{ color: cssVar.colorTextDescription }}
            type={'text'}
            onClick={handleBackToLogin}
          >
            {t('back')}
          </Button>
          <Button type={'primary'} onClick={onNext}>
            {t('screen5.navigation.next')}
          </Button>
        </Flexbox>
      </Center>
    );
  };

  const renderLoginContent = () => {
    if (loginStatus === 'error') {
      const errorMessage = remoteError?.toLowerCase().includes('timed out')
        ? t('screen5.errors.timedOut')
        : remoteError || t('authResult.failed.desc');

      return (
        <Flexbox gap={16} style={{ width: '100%' }}>
          <Alert
            description={errorMessage}
            title={t('authResult.failed.title')}
            type={'secondary'}
          />
          <Button block icon={Cloud} size={'large'} type={'primary'} onClick={handleLogin}>
            {t('screen5.actions.tryAgain')}
          </Button>
        </Flexbox>
      );
    }

    if (loginStatus === 'loading') {
      const phaseText = t(authorizationPhaseI18nKeyMap[authProgress?.phase ?? 'browser_opened'], {
        defaultValue: t('screen5.actions.signingIn'),
      });

      return (
        <Flexbox gap={8} style={{ width: '100%' }}>
          <Button block disabled icon={Cloud} loading size={'large'} type={'primary'}>
            {t('screen5.actions.signingIn')}
          </Button>
          <Text style={{ color: cssVar.colorTextDescription }} type={'secondary'}>
            {phaseText}
          </Text>
          <Flexbox horizontal align={'center'} justify={'space-between'}>
            {localRemainingSeconds !== null ? (
              <Text style={{ color: cssVar.colorTextDescription }} type={'secondary'}>
                {t('screen5.auth.remaining', {
                  time: localRemainingSeconds,
                })}
              </Text>
            ) : (
              <div />
            )}
            <Button size={'small'} type={'text'} onClick={handleCancelAuth}>
              {t('screen5.actions.cancel')}
            </Button>
          </Flexbox>
        </Flexbox>
      );
    }

    return (
      <Button
        block
        disabled={isConnectingServer}
        icon={Cloud}
        size={'large'}
        type={'primary'}
        onClick={handleLogin}
      >
        {t('screen5.actions.signInCloud')}
      </Button>
    );
  };

  if (successLogin) return renderSuccessContent();

  return (
    <Center gap={32} style={{ height: '100%', minHeight: '100%' }}>
      <Flexbox align={'flex-start'} justify={'flex-start'} style={{ width: '100%' }}>
        <LobeMessage sentences={[t('screen5.title'), t('screen5.title2'), t('screen5.title3')]} />
        <Text as={'p'}>{t('screen5.description')}</Text>
      </Flexbox>

      <Flexbox align={'flex-start'} gap={16} style={{ width: '100%' }} width={'100%'}>
        {renderLoginContent()}
      </Flexbox>
    </Center>
  );
});

LoginStep.displayName = 'LoginStep';

export default LoginStep;
