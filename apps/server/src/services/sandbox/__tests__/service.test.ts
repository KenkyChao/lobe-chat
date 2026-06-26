import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileService } from '@/server/services/file';
import type { MarketService } from '@/server/services/market';

import type { SandboxProvider } from '../types';

const mockCloudSandboxEnabled = (enabled: boolean) => {
  vi.doMock('@lobechat/const', async () => ({
    ...((await vi.importActual('@lobechat/const')) as object),
    CLOUD_SANDBOX_ENABLED: enabled,
  }));
};

describe('SandboxMiddlewareService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('uploads provider exports through the shared file record flow', async () => {
    mockCloudSandboxEnabled(true);

    const { SandboxMiddlewareService: TestSandboxMiddlewareService } = await import('../service');
    const exportFileToUploadUrl = vi.fn(async () => ({
      result: { mime_type: 'text/plain' },
      success: true,
    }));
    const provider = {
      capabilities: {
        backgroundCommands: true,
        exportFile: true,
        files: true,
        languages: ['python'],
        persistentSession: true,
        shell: true,
        skillScripts: true,
      },
      callTool: vi.fn(),
      exportFileToUploadUrl,
      kind: 'onlyboxes',
    } satisfies SandboxProvider;

    const fileService = {
      createPreSignedUpload: vi.fn(async () => ({
        headers: { 'x-amz-acl': 'public-read' },
        url: 'https://uploads.example.com/put',
      })),
      createFileRecord: vi.fn(async () => ({ fileId: 'file-1', url: '/f/file-1' })),
      getFileMetadata: vi.fn(async () => ({
        contentLength: 42,
        contentType: 'text/csv',
      })),
    } as unknown as FileService;

    const service = new TestSandboxMiddlewareService(provider, {
      fileService,
      marketService: {} as MarketService,
      topicId: 'topic-1',
      userId: 'user-1',
    });

    const result = await service.exportAndUploadFile('/workspace/result.csv', 'result.csv');

    expect(result).toMatchObject({
      fileId: 'file-1',
      filename: 'result.csv',
      mimeType: 'text/csv',
      size: 42,
      success: true,
      url: '/f/file-1',
    });
    expect(exportFileToUploadUrl).toHaveBeenCalledWith({
      filename: 'result.csv',
      path: '/workspace/result.csv',
      uploadHeaders: { 'x-amz-acl': 'public-read' },
      uploadUrl: 'https://uploads.example.com/put',
    });
    expect(fileService.createFileRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        fileType: 'text/csv',
        name: 'result.csv',
        size: 42,
        url: expect.stringMatching(
          /^code-interpreter-exports\/\d{4}-\d{2}-\d{2}\/topic-1\/result\.csv$/,
        ),
      }),
    );
  });

  it('normalizes provider export failures before storage metadata is read', async () => {
    mockCloudSandboxEnabled(true);

    const provider = {
      capabilities: {
        backgroundCommands: true,
        exportFile: true,
        files: true,
        languages: ['python'],
        persistentSession: true,
        shell: true,
        skillScripts: true,
      },
      callTool: vi.fn(),
      exportFileToUploadUrl: vi.fn(async () => ({
        error: { message: 'no such file', name: 'not_found' },
        success: false,
      })),
      kind: 'onlyboxes',
    } satisfies SandboxProvider;

    const { SandboxMiddlewareService } = await import('../service');
    const fileService = {
      createFileRecord: vi.fn(),
      createPreSignedUpload: vi.fn(async () => ({ url: 'https://uploads.example.com/put' })),
      getFileMetadata: vi.fn(),
    } as unknown as FileService;

    const service = new SandboxMiddlewareService(provider, {
      fileService,
      marketService: {} as MarketService,
      topicId: 'topic-1',
      userId: 'user-1',
    });

    const result = await service.exportAndUploadFile('/workspace/missing.txt', 'missing.txt');

    expect(result).toMatchObject({
      error: { message: 'no such file', name: 'not_found' },
      filename: 'missing.txt',
      success: false,
    });
    expect(fileService.getFileMetadata).not.toHaveBeenCalled();
    expect(fileService.createFileRecord).not.toHaveBeenCalled();
  });

  it('returns unavailable without touching the provider when cloud sandbox is disabled', async () => {
    mockCloudSandboxEnabled(false);

    const { SandboxMiddlewareService } = await import('../service');
    const provider = {
      capabilities: {
        backgroundCommands: true,
        exportFile: true,
        files: true,
        languages: ['python'],
        persistentSession: true,
        shell: true,
        skillScripts: true,
      },
      callTool: vi.fn(),
      exportFileToUploadUrl: vi.fn(),
      kind: 'onlyboxes',
    } satisfies SandboxProvider;

    const service = new SandboxMiddlewareService(provider, {
      marketService: {} as MarketService,
      topicId: 'topic-1',
      userId: 'user-1',
    });

    await expect(service.callTool('runCommand', { command: 'ls' })).resolves.toMatchObject({
      error: { message: '暂未开放', name: 'SandboxUnavailable' },
      result: null,
      success: false,
    });
    await expect(service.exportAndUploadFile('/workspace/result.csv', 'result.csv')).resolves.toMatchObject({
      error: { message: '暂未开放', name: 'SandboxUnavailable' },
      filename: 'result.csv',
      success: false,
    });
    expect(provider.callTool).not.toHaveBeenCalled();
    expect(provider.exportFileToUploadUrl).not.toHaveBeenCalled();
  });
});
