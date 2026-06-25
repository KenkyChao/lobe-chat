import { BRANDING_NAME } from '@lobechat/business-const';
import { describe, expect, it } from 'vitest';

import { withBrandSender } from './sender';

describe('withBrandSender', () => {
  it('wraps a plain sender address with the product name', () => {
    expect(withBrandSender('service@naiyun.com')).toBe(`${BRANDING_NAME} <service@naiyun.com>`);
  });

  it('keeps an explicit sender display name unchanged', () => {
    expect(withBrandSender('NaiYunHub Service <service@naiyun.com>')).toBe(
      'NaiYunHub Service <service@naiyun.com>',
    );
  });

  it('keeps empty sender unchanged', () => {
    expect(withBrandSender()).toBeUndefined();
  });
});
