import {
  type CategoryItem,
  type CategoryListQuery,
  type PluginManifest,
} from '@lobehub/market-sdk';
import {
  type AgentEventRequest,
  type CallReportRequest,
  type InstallReportRequest,
  type PluginEventRequest,
} from '@lobehub/market-types';

import { lambdaClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';
import {
  type AssistantListResponse,
  type AssistantMarketSource,
  type AssistantQueryParams,
  type DiscoverAssistantDetail,
  type DiscoverMcpDetail,
  type DiscoverModelDetail,
  type DiscoverPluginDetail,
  type DiscoverProviderDetail,
  type DiscoverSkillDetail,
  type DiscoverUserProfile,
  type GroupAgentQueryParams,
  type IdentifiersResponse,
  type McpListResponse,
  type McpQueryParams,
  type ModelListResponse,
  type ModelQueryParams,
  type PluginListResponse,
  type PluginQueryParams,
  type ProviderListResponse,
  type ProviderQueryParams,
  type SkillCategoryItem,
  type SkillListResponse,
  type SkillQueryParams,
} from '@/types/discover';
import { type MCPPluginListParams } from '@/types/plugins';
import { cleanObject } from '@/utils/object';

class DiscoverService {
  private _isRetrying = false;
  private _tokenRefreshPromise: Promise<void> | null = null;

  private createEmptyListResponse = <T>(params: { page?: number; pageSize?: number } = {}): T =>
    ({
      currentPage: params.page ? Number(params.page) : 1,
      items: [],
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
      totalCount: 0,
      totalPages: 0,
    }) as T;

  private isMarketTrustedClientEnabled = (): boolean => {
    if (typeof window === 'undefined' || !window.global_serverConfigStore) return false;
    try {
      const state = window.global_serverConfigStore.getState();
      return state.serverConfig.enableMarketTrustedClient || false;
    } catch {
      return false;
    }
  };

  safeInjectMPToken = async (options: { force?: boolean } = {}) => {
    // Trusted-client auth is handled by backend. Some public Market surfaces still
    // need M2M as a fallback when local user context is unavailable.
    if (this.isMarketTrustedClientEnabled() && !options.force) return;

    try {
      await this.injectMPToken();
    } catch (error) {
      // Log error but don't block the request
      console.warn('Failed to inject MP token, continuing without it:', error);
    }
  };

  // ============================== Assistant Market ==============================
  getAssistantCategories = async (
    params: CategoryListQuery & { source?: AssistantMarketSource } = {},
  ): Promise<CategoryItem[]> => {
    void params;
    return [];
  };

  getAssistantDetail = async (params: {
    identifier: string;
    locale?: string;
    source?: AssistantMarketSource;
    version?: string;
  }): Promise<DiscoverAssistantDetail | undefined> => {
    void params;
    return;
  };

  getAssistantIdentifiers = async (
    params: { source?: AssistantMarketSource } = {},
  ): Promise<IdentifiersResponse> => {
    void params;
    return [];
  };

  getAssistantList = async (params: AssistantQueryParams = {}): Promise<AssistantListResponse> => {
    return this.createEmptyListResponse<AssistantListResponse>(params);
  };

  getAgentsByPlugin = async (params: {
    locale?: string;
    page?: number;
    pageSize?: number;
    pluginId: string;
  }): Promise<AssistantListResponse> => {
    return this.createEmptyListResponse<AssistantListResponse>(params);
  };

  // ============================== MCP Market ==============================

  getMcpCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    void params;
    return [];
  };

  getMcpDetail = async (params: {
    identifier: string;
    locale?: string;
    version?: string;
  }): Promise<DiscoverMcpDetail> => {
    void params;
    return undefined as unknown as DiscoverMcpDetail;
  };

  getMcpList = async (params: McpQueryParams = {}): Promise<McpListResponse> => {
    return this.createEmptyListResponse<McpListResponse>(params);
  };

  getMCPPluginList = async (params: MCPPluginListParams): Promise<McpListResponse> => {
    return this.createEmptyListResponse<McpListResponse>(params);
  };

  getMcpManifest = async (params: { identifier: string; locale?: string; version?: string }) => {
    void params;
    return undefined;
  };

  getMCPPluginManifest = async (
    identifier: string,
    options: { install?: boolean } = {},
  ): Promise<PluginManifest> => {
    void identifier;
    void options;
    return undefined as unknown as PluginManifest;
  };

  registerClient = () => {
    return lambdaClient.market.registerClientInMarketplace.mutate({});
  };

  /**
   * Report MCP plugin installation result
   */
  reportMcpInstallResult = async ({
    success,
    manifest,
    errorMessage,
    errorCode,
    ...params
  }: InstallReportRequest) => {
    // if user don't allow tracing, just not report installation
    const allow = userGeneralSettingsSelectors.telemetry(useUserStore.getState());

    if (!allow) return;
    void success;
    void manifest;
    void errorMessage;
    void errorCode;
    void params;
  };

  /**
   * Report plugin call result
   */
  reportPluginCall = async (reportData: CallReportRequest) => {
    // if user don't allow tracing , just not report calling
    const allow = userGeneralSettingsSelectors.telemetry(useUserStore.getState());

    if (!allow) return;

    void reportData;
  };

  reportMcpEvent = async (eventData: PluginEventRequest) => {
    const allow = userGeneralSettingsSelectors.telemetry(useUserStore.getState());
    if (!allow) return;

    void eventData;
  };

  /**
   * Report agent installation to increase install count
   */
  reportAgentInstall = async (identifier: string) => {
    // if user don't allow tracing, just not report installation
    const allow = userGeneralSettingsSelectors.telemetry(useUserStore.getState());

    if (!allow) return;

    void identifier;
  };

  reportAgentEvent = async (eventData: AgentEventRequest) => {
    const allow = userGeneralSettingsSelectors.telemetry(useUserStore.getState());
    if (!allow) return;

    void eventData;
  };

  // ============================== Models ==============================

  getModelCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    return lambdaClient.market.getModelCategories.query(params);
  };

  getModelDetail = async (params: {
    identifier: string;
    locale?: string;
  }): Promise<DiscoverModelDetail | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getModelDetail.query({
      ...params,
      locale,
    });
  };

  getModelIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getModelIdentifiers.query();
  };

  getModelList = async (params: ModelQueryParams = {}): Promise<ModelListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getModelList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };

  // ============================== Plugin Market ==============================

  getPluginCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getPluginCategories.query({
      ...params,
      locale,
    });
  };

  getPluginDetail = async (params: {
    identifier: string;
    locale?: string;
    withManifest?: boolean;
  }): Promise<DiscoverPluginDetail | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getPluginDetail.query({
      ...params,
      locale,
    });
  };

  getPluginIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getPluginIdentifiers.query();
  };

  getPluginList = async (params: PluginQueryParams = {}): Promise<PluginListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getPluginList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };

  // ============================== Providers ==============================

  getProviderDetail = async (params: {
    identifier: string;
    locale?: string;
    withReadme?: boolean;
  }): Promise<DiscoverProviderDetail | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getProviderDetail.query({
      ...params,
      locale,
    });
  };

  getProviderIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getProviderIdentifiers.query();
  };

  getProviderList = async (params: ProviderQueryParams = {}): Promise<ProviderListResponse> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getProviderList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };

  // ============================== User Profile ==============================

  getUserInfo = async (params: {
    locale?: string;
    username: string;
  }): Promise<DiscoverUserProfile | undefined> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getUserInfo.query({
      locale,
      username: params.username,
    });
  };

  // ============================== Helpers ==============================

  async injectMPToken() {
    if (typeof localStorage === 'undefined') return;

    const item = localStorage.getItem('_mpc');

    // Check server-set status flag cookie
    const tokenStatus = this.getTokenStatusFromCookie();
    if (tokenStatus === 'active' && item) return;

    // If a token refresh is already in progress, wait for it to complete
    if (this._tokenRefreshPromise) {
      await this._tokenRefreshPromise;
      return;
    }

    // Create a new refresh promise and execute
    this._tokenRefreshPromise = this._doRefreshToken();
    try {
      await this._tokenRefreshPromise;
    } finally {
      this._tokenRefreshPromise = null;
    }
  }

  private async _doRefreshToken() {
    let clientId: string;
    let clientSecret: string;

    // 1. Get client information from localStorage
    const item = localStorage.getItem('_mpc');
    if (!item) {
      // 2. If not exists, register client
      const clientInfo = await this.registerClient();
      clientId = clientInfo.clientId;
      clientSecret = clientInfo.clientSecret;

      // 3. Base64 encode and save to localStorage
      const clientData = JSON.stringify({ clientId, clientSecret });
      const encodedData = btoa(clientData);
      localStorage.setItem('_mpc', encodedData);
    } else {
      // 4. If exists, decode to get client information
      try {
        const decodedData = atob(item);
        const clientData = JSON.parse(decodedData);
        clientId = clientData.clientId;
        clientSecret = clientData.clientSecret;
      } catch (error) {
        console.error('Failed to decode client data:', error);
        // If decoding fails, re-register
        const clientInfo = await this.registerClient();
        clientId = clientInfo.clientId;
        clientSecret = clientInfo.clientSecret;

        const clientData = JSON.stringify({ clientId, clientSecret });
        const encodedData = btoa(clientData);
        localStorage.setItem('_mpc', encodedData);
      }
    }

    // 5. Get access token (server will automatically set HTTP-Only cookie)
    try {
      const result = await lambdaClient.market.registerM2MToken.query({
        clientId,
        clientSecret,
      });

      // Check server response result
      if (!result.success) {
        console.warn(
          'Token registration failed, client credentials may be invalid. Clearing and retrying...',
        );

        // Clear related local storage data
        localStorage.removeItem('_mpc');

        // Re-execute the complete registration process (but only retry once)
        if (!this._isRetrying) {
          this._isRetrying = true;
          try {
            await this._doRefreshToken();
          } finally {
            this._isRetrying = false;
          }
        } else {
          console.error('Failed to re-register after credential invalidation');
        }

        return;
      }

      // 6. Wait for cookie to be set by browser
      // The Set-Cookie header processing may have a tiny delay
      await this._waitForCookieSet();
    } catch (error) {
      console.error('Failed to register M2M token:', error);
    }
  }

  private async _waitForCookieSet(maxRetries = 10, interval = 10): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      if (this.getTokenStatusFromCookie() === 'active') {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    // If cookie still not set after retries, continue anyway
    // The request might still work if the cookie was set but we couldn't detect it
    console.warn('Cookie may not be fully set, proceeding anyway');
  }

  private getTokenStatusFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'mp_token_status') {
        return value;
      }
    }
    return null;
  }

  // ============================== Skills Market ==============================

  getSkillCategories = async (params: CategoryListQuery = {}): Promise<SkillCategoryItem[]> => {
    void params;
    return [];
  };

  getSkillDetail = async (params: {
    identifier: string;
    locale?: string;
    version?: string;
  }): Promise<DiscoverSkillDetail> => {
    void params;
    return undefined as unknown as DiscoverSkillDetail;
  };

  getSkillList = async (params: SkillQueryParams = {}): Promise<SkillListResponse> => {
    return this.createEmptyListResponse<SkillListResponse>(params);
  };

  reportSkillEvent = async (eventData: { event: string; identifier: string; source?: string }) => {
    const allow = userGeneralSettingsSelectors.telemetry(useUserStore.getState());
    if (!allow) return;

    const payload = cleanObject({
      ...eventData,
      source: eventData.source ?? 'community/skill',
    });

    // Note: skill event reporting can be added when the backend supports it
    // Payload prepared for future backend integration
    void payload;
  };

  // ============================== Group Agent Market ==============================

  getGroupAgentCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getGroupAgentCategories.query({
      ...params,
      locale,
    });
  };

  getGroupAgentDetail = async (params: {
    identifier: string;
    locale?: string;
    version?: string;
  }): Promise<any> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.getGroupAgentDetail.query({
      identifier: params.identifier,
      locale,
      version: params.version,
    });
  };

  getGroupAgentIdentifiers = async (): Promise<IdentifiersResponse> => {
    return lambdaClient.market.getGroupAgentIdentifiers.query();
  };

  getGroupAgentList = async (params: GroupAgentQueryParams = {}): Promise<any> => {
    const locale = globalHelpers.getCurrentLanguage();
    return lambdaClient.market.agentGroup.getAgentGroupList.query(
      {
        ...params,
        locale,
        page: params.page ? Number(params.page) : 1,
        pageSize: params.pageSize ? Number(params.pageSize) : 20,
      },
      { context: { showNotification: false } },
    );
  };

  reportGroupAgentEvent = async (params: {
    event: 'add' | 'chat' | 'click';
    identifier: string;
    source?: string;
  }): Promise<void> => {
    await lambdaClient.market.reportGroupAgentEvent.mutate(params);
  };

  reportGroupAgentInstall = async (identifier: string): Promise<void> => {
    await lambdaClient.market.reportGroupAgentInstall.mutate({ identifier });
  };
}

export const discoverService = new DiscoverService();
