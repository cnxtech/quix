import {fromPairs} from 'lodash';
import {Runner} from '../lib/runner';
import {browserNotificationsManager} from '../services/notifications';
import {INotebook, INote} from '../../../shared/dist';


const runners = new Map();

const computeFinishState = (runner: Runner) => {
  const status = runner.getState().getStatus();
  if (status.error) {
    return 'error';
  } if (status.killed) {
    return 'killed';
  }
  return 'finished';
}

export const addRunner = (id: string, runner: Runner, note: INote, notebook: INotebook) => {
  runner.on('finish', (r: Runner) => {
    const status = computeFinishState(r);
    if (status === 'finished') {
      browserNotificationsManager.notify('runnerFinished', note, notebook);
    } else {
      browserNotificationsManager.notify('runnerError', note, notebook);
    }
  });
  runners.set(id, runner);
}

export const removeRunner = (id: string) => {
  runners.delete(id);
}

export const getRunner = (id: string) => {
  return runners.get(id);
}

export const getRunners = () => fromPairs([...runners.entries()]);
