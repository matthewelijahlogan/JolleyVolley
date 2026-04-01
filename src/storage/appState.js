import {NativeModules, Platform} from 'react-native';

const {AppStateStore} = NativeModules;

export async function loadPersistedAppState() {
  if (Platform.OS !== 'android' || !AppStateStore?.load) {
    return null;
  }

  const raw = await AppStateStore.load();

  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
}

export async function savePersistedAppState(state) {
  if (Platform.OS !== 'android' || !AppStateStore?.save) {
    return;
  }

  await AppStateStore.save(JSON.stringify(state));
}
