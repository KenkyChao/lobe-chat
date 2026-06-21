'use client';

import { Avatar, Skeleton } from '@lobehub/ui';
import { memo, useCallback } from 'react';

import { useCommunityWorkspaceProfile } from '@/business/client/hooks/useCommunityWorkspaceProfile';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useMarketAuth, useMarketUserProfile } from '@/layout/AuthProvider/MarketAuth';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';

import { resolveCommunityUserAvatarTarget } from './navigation';

interface UserAvatarProps {
  avatarOverride?: string | null;
}

/**
 * Check whether the user needs to complete their profile
 * When using trustedClient auto-authorization, the user's meta-related fields will be empty
 */
const checkNeedsProfileSetup = (
  enableMarketTrustedClient: boolean,
  userProfile:
    | {
        avatarUrl: string | null;
        bannerUrl: string | null;
        socialLinks: { github?: string; twitter?: string; website?: string } | null;
      }
    | null
    | undefined,
): boolean => {
  if (!enableMarketTrustedClient) return false;
  if (!userProfile) return true;

  // If the avatarUrl field is empty, the user needs to complete their profile
  const hasAvatarUrl = !!userProfile.avatarUrl;

  return !hasAvatarUrl;
};

const UserAvatar = memo<UserAvatarProps>(({ avatarOverride }) => {
  const navigate = useWorkspaceAwareNavigate();
  const {
    avatarUrl: workspaceAvatarUrl,
    isWorkspaceScope,
    username: workspaceUsername,
  } = useCommunityWorkspaceProfile();
  const { isAuthenticated, isLoading, getCurrentUserInfo } = useMarketAuth();

  const enableMarketTrustedClient = useServerConfigStore(
    serverConfigSelectors.enableMarketTrustedClient,
  );

  const userInfo = getCurrentUserInfo();
  const username = userInfo?.sub;

  // Use SWR to fetch user profile with caching
  const { data: userProfile } = useMarketUserProfile(username);

  // Check whether profile setup is needed
  const needsProfileSetup = checkNeedsProfileSetup(enableMarketTrustedClient, userProfile);

  const handleAvatarClick = useCallback(() => {
    const profileUserName = userProfile?.userName || userProfile?.namespace;
    const target = resolveCommunityUserAvatarTarget({
      isWorkspaceScope,
      profileUsername: profileUserName,
    });

    if (target) {
      navigate(target);
    }
  }, [isWorkspaceScope, navigate, userProfile?.userName, userProfile?.namespace]);

  if (isLoading) {
    return <Skeleton.Avatar active shape={'square'} size={28} style={{ borderRadius: 6 }} />;
  }

  // If trustedClient is enabled, show the avatar directly; otherwise hide the Market onboarding action.
  if (!enableMarketTrustedClient && (!isAuthenticated || needsProfileSetup)) {
    return null;
  }

  // Get avatar from user profile (fetched via SWR with caching)
  const avatarUrl =
    avatarOverride ||
    (isWorkspaceScope
      ? workspaceAvatarUrl || workspaceUsername
      : userProfile?.avatarUrl || userProfile?.userName || username);

  return <Avatar avatar={avatarUrl} shape={'square'} size={28} onClick={handleAvatarClick} />;
});

export default UserAvatar;
