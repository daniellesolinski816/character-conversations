import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Reader from './pages/Reader';
import BookClubs from './pages/BookClubs';
import ClubDetail from './pages/ClubDetail';
import Discussion from './pages/Discussion';
import Community from './pages/Community';
import Challenges from './pages/Challenges';
import WritingDetail from './pages/WritingDetail';
import CrossCharacterDialogue from './pages/CrossCharacterDialogue';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BookDetail": BookDetail,
    "Reader": Reader,
    "BookClubs": BookClubs,
    "ClubDetail": ClubDetail,
    "Discussion": Discussion,
    "Community": Community,
    "Challenges": Challenges,
    "WritingDetail": WritingDetail,
    "CrossCharacterDialogue": CrossCharacterDialogue,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};