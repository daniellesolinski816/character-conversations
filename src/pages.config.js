import BookClubs from './pages/BookClubs';
import BookDetail from './pages/BookDetail';
import Challenges from './pages/Challenges';
import ClubDetail from './pages/ClubDetail';
import Community from './pages/Community';
import CrossCharacterDialogue from './pages/CrossCharacterDialogue';
import Discussion from './pages/Discussion';
import Home from './pages/Home';
import Reader from './pages/Reader';
import WritingDetail from './pages/WritingDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "BookClubs": BookClubs,
    "BookDetail": BookDetail,
    "Challenges": Challenges,
    "ClubDetail": ClubDetail,
    "Community": Community,
    "CrossCharacterDialogue": CrossCharacterDialogue,
    "Discussion": Discussion,
    "Home": Home,
    "Reader": Reader,
    "WritingDetail": WritingDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};