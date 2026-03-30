import {MenuHub} from '../components/MenuHub';
import {mainMenuSections} from '../data/dashboard';

export function HomeScreen({onOpenScreen}) {
  return <MenuHub items={mainMenuSections} onOpenScreen={onOpenScreen} />;
}
