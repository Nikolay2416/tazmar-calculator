import { FC } from 'react';
import { Flow } from '../components/flow/Flow';

import s from './app.module.css';

const App: FC = () => {
  return (
    <div className={s.app}>
      <Flow />
    </div>
  );
};

export default App;
