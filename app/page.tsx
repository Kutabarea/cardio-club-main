import Intro from "./components/Intro";
import Search from "./components/Search";
import Slider from "./components/Slider";
import Community from "./components/Community";
import Helper from "./components/Helper";

export default function Home() {
  return (
    <div>
      <div className="home-wrapper">
         <Intro />
        <div className="container">
          <Search />
        </div>
        <Slider />
        <Community />
        <Helper />
      </div>
       
    </div>
  );
}
