import { Suspense } from 'react';
import Meeting from './Meeting';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading meeting page...</div>}>
      <Meeting />
    </Suspense>
  );
}
