'use client';

import { useEffect } from 'react';

import { useLastOpened, type LastOpenedRecord } from '@/hooks/use-last-opened';

interface RecordVisitProps {
  record: Omit<LastOpenedRecord, 'openedAt'>;
}

export function RecordVisit({ record }: RecordVisitProps): null {
  const { setRecord } = useLastOpened();

  useEffect(() => {
    setRecord(record);
    // setRecord is stable; record values are primitives, the slug effectively keys this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.slug]);

  return null;
}
