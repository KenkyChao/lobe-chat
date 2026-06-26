'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './page.module.css';

type DownloadActionProps = {
  available: boolean;
  href?: string;
  unavailableMessage?: string;
  unavailableText?: string;
};

const DownloadAction = ({
  available,
  href,
  unavailableMessage = '安装包地址尚未配置',
  unavailableText = '待配置',
}: DownloadActionProps) => {
  const [showNotice, setShowNotice] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  if (available && href) {
    return (
      <a className={styles.button} href={href}>
        下载安装包
      </a>
    );
  }

  const handleUnavailableClick = () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);

    setShowNotice(true);
    noticeTimer.current = setTimeout(() => {
      setShowNotice(false);
    }, 1800);
  };

  return (
    <>
      <button className={styles.buttonUnavailable} type="button" onClick={handleUnavailableClick}>
        {unavailableText}
      </button>
      {showNotice && (
        <div className={styles.toast} role="status">
          {unavailableMessage}
        </div>
      )}
    </>
  );
};

export default DownloadAction;
