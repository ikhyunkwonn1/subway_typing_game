
import { SubwayMap } from '../subway-map/SubwayMap';
import { TopHud } from '../hud/TopHud';
import { StationNavBar } from '../station-bar/StationNavBar';

export function GameScreen() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <SubwayMap />
      <TopHud />
      <StationNavBar />
    </div>
  );
}
